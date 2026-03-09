"""
Data Intelligence API
Provides endpoints for CSV data upload, statistical summary, cleaning, and visualization.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uuid
import os
import io

router = APIRouter()

# In-memory store for uploaded file data (server restart clears it)
_file_store: Dict[str, Any] = {}

UPLOAD_DIR = "data/uploads/data_intelligence"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _load_df(file_id: str):
    """Load a DataFrame from the file store."""
    try:
        import pandas as pd
    except ImportError:
        raise HTTPException(status_code=500, detail="pandas not installed.")

    if file_id not in _file_store:
        raise HTTPException(status_code=404, detail="File not found. Please upload again.")
    path = _file_store[file_id]
    return pd.read_csv(path)


@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    """Upload a CSV file and return a file_id for subsequent operations."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    file_id = uuid.uuid4().hex
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}.csv")

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    _file_store[file_id] = file_path
    return {"file_id": file_id, "filename": file.filename}


@router.get("/summary/{file_id}")
def get_summary(file_id: str):
    """Return statistical summary of the uploaded CSV."""
    try:
        import pandas as pd
        import numpy as np
    except ImportError:
        raise HTTPException(status_code=500, detail="pandas not installed.")

    df = _load_df(file_id)

    column_info = []
    for col in df.columns:
        col_data = df[col]
        dtype = str(col_data.dtype)
        missing = int(col_data.isnull().sum())
        mean = float(col_data.mean()) if col_data.dtype in [np.float64, np.int64] else None
        median = float(col_data.median()) if col_data.dtype in [np.float64, np.int64] else None
        std = float(col_data.std()) if col_data.dtype in [np.float64, np.int64] else None

        column_info.append({
            "name": col,
            "type": dtype,
            "missing": missing,
            "mean": mean,
            "median": median,
            "std": std
        })

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    description = (
        f"Dataset contains {len(df)} rows and {len(df.columns)} columns. "
        f"There are {len(numeric_cols)} numeric column(s) and {df.isnull().sum().sum()} total missing values."
    )

    return {
        "rows": len(df),
        "columns": len(df.columns),
        "description": description,
        "column_info": column_info
    }


@router.post("/clean/{file_id}")
def clean_data(file_id: str):
    """Perform basic data cleaning: remove duplicates and fill/drop nulls."""
    try:
        import pandas as pd
    except ImportError:
        raise HTTPException(status_code=500, detail="pandas not installed.")

    df = _load_df(file_id)
    original_rows = len(df)

    # Remove exact duplicates
    df.drop_duplicates(inplace=True)
    duplicates_removed = original_rows - len(df)

    # Count missing before
    missing_before = int(df.isnull().sum().sum())

    # Fill numeric nulls with column median, drop rows that remain null
    for col in df.select_dtypes(include=['number']).columns:
        df[col].fillna(df[col].median(), inplace=True)
    df.dropna(inplace=True)

    missing_after = int(df.isnull().sum().sum())
    missing_handled = missing_before - missing_after

    # Save cleaned version back
    path = _file_store[file_id]
    df.to_csv(path, index=False)

    preview = df.head(10).fillna("").to_dict(orient="records")

    return {
        "report": {
            "duplicates_removed": duplicates_removed,
            "missing_values_handled": missing_handled,
            "final_rows": len(df)
        },
        "preview": preview
    }


class VisualizeRequest(BaseModel):
    chart_type: str
    x_col: str
    y_col: Optional[str] = None


@router.post("/visualize/{file_id}")
def visualize_data(file_id: str, req: VisualizeRequest):
    """Return data formatted for Chart.js rendering."""
    try:
        import pandas as pd
        import numpy as np
    except ImportError:
        raise HTTPException(status_code=500, detail="pandas not installed.")

    df = _load_df(file_id)

    if req.x_col not in df.columns:
        raise HTTPException(status_code=400, detail=f"Column '{req.x_col}' not found.")

    chart_type = req.chart_type.lower()

    try:
        if chart_type == "histogram":
            col_data = pd.to_numeric(df[req.x_col], errors="coerce").dropna()
            counts, bin_edges = np.histogram(col_data, bins=20)
            labels = [f"{bin_edges[i]:.1f}-{bin_edges[i+1]:.1f}" for i in range(len(counts))]
            return {
                "labels": labels,
                "datasets": [{"label": req.x_col, "data": counts.tolist()}]
            }

        elif chart_type == "pie":
            counts = df[req.x_col].value_counts().head(10)
            return {
                "labels": counts.index.tolist(),
                "datasets": [{"label": req.x_col, "data": counts.values.tolist()}]
            }

        elif chart_type == "scatter":
            if not req.y_col or req.y_col not in df.columns:
                raise HTTPException(status_code=400, detail="Y-axis column required for scatter plot.")
            data = df[[req.x_col, req.y_col]].dropna()
            scatter_data = [{"x": float(row[req.x_col]), "y": float(row[req.y_col])}
                            for _, row in data.iterrows()]
            return {
                "labels": [],
                "datasets": [{"label": f"{req.x_col} vs {req.y_col}", "data": scatter_data}]
            }

        else:  # bar or line
            if req.y_col and req.y_col in df.columns:
                grouped = df.groupby(req.x_col)[req.y_col].mean().head(25)
                return {
                    "labels": [str(k) for k in grouped.index.tolist()],
                    "datasets": [{"label": req.y_col, "data": grouped.values.tolist()}]
                }
            else:
                counts = df[req.x_col].value_counts().head(25)
                return {
                    "labels": [str(k) for k in counts.index.tolist()],
                    "datasets": [{"label": req.x_col, "data": counts.values.tolist()}]
                }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Visualization failed: {str(e)}")
