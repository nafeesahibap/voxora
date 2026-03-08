from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
import io
import os
import uuid
import math

router = APIRouter()

UPLOAD_DIR = "data"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class VisualizeRequest(BaseModel):
    chart_type: str
    x_col: str
    y_col: str = None

def get_file_path(file_id: str):
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}.csv")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found or expired.")
    return file_path

def generate_dataset_description(df: pd.DataFrame, summary_stats: dict) -> str:
    rows = summary_stats.get("rows", 0)
    cols = summary_stats.get("columns", 0)
    
    # 1. Domain Inference based on column names
    col_names = [str(c).lower() for c in df.columns]
    domain_keywords = {
        "sales & e-commerce": ["price", "revenue", "order", "product", "sales", "discount", "customer", "invoice", "qty"],
        "finance": ["amount", "balance", "credit", "debit", "account", "transaction", "tax", "fee", "cost"],
        "health & medical": ["patient", "diagnosis", "blood", "heart", "treatment", "doctor", "hospital", "age", "bmi", "disease"],
        "education": ["student", "grade", "score", "class", "course", "teacher", "school", "gpa", "exam"],
        "inventory & logistics": ["stock", "sku", "warehouse", "quantity", "supplier", "shipment", "weight"],
        "human resources": ["employee", "salary", "department", "hire", "manager", "attendance", "role"]
    }
    
    best_match = "general operational"
    max_matches = 0
    for dom, keywords in domain_keywords.items():
        matches = sum(1 for keyword in keywords for col in col_names if keyword in col)
        if matches > max_matches:
            max_matches = matches
            best_match = dom
            
    domain_text = f"This dataset appears to represent {best_match} data, consisting of {rows:,} records across {cols} features."
    
    # 2. Data Types & Content Analysis
    date_cols = df.select_dtypes(include=['datetime64', 'datetimetz']).columns.tolist()
    if not date_cols:
        for col in df.columns:
            if df[col].dtype == 'object' and any(k in str(col).lower() for k in ['date', 'time', 'year', 'month']):
                date_cols.append(col)
                break
                
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = df.select_dtypes(exclude=[np.number, 'datetime64', 'datetimetz']).columns.tolist()
    
    content_points = []
    if date_cols:
        content_points.append(f"It includes temporal information (e.g., '{date_cols[0]}'), making it suitable for time-series and trend analysis.")
    if numeric_cols:
        num_cols_str = "', '".join(numeric_cols[:2]) + ("'" if len(numeric_cols) <= 2 else "' and others")
        content_points.append(f"Numeric indicators such as '{num_cols_str}' offer opportunities for statistical aggregation and distribution profiling.")
    if cat_cols:
        cat_cols_str = "', '".join(cat_cols[:2]) + ("'" if len(cat_cols) <= 2 else "' and others")
        content_points.append(f"Categorical variables like '{cat_cols_str}' allow for segmentation into distinct groups or dominant classes.")
        
    content_text = " ".join(content_points)
    
    # 3. Quality Assessment
    total_cells = rows * cols
    missing_cells = int(df.isna().sum().sum())
    missing_pct = (missing_cells / total_cells) * 100 if total_cells > 0 else 0
    duplicate_rows = int(df.duplicated().sum())
    duplicate_pct = (duplicate_rows / rows) * 100 if rows > 0 else 0
    
    quality_text = "Overall data quality is "
    if missing_pct < 5 and duplicate_pct < 5:
        quality_text += "excellent, with very few missing values or duplicates."
    elif missing_pct < 20:
        quality_text += f"fair. Approximately {missing_pct:.1f}% of the data points are missing, "
        quality_text += f"and there are {duplicate_rows} duplicate rows that may require cleaning." if duplicate_pct > 0 else "but there are no significant duplicates."
    else:
        quality_text += f"poor. A significant portion ({missing_pct:.1f}%) of the data is missing, which necessitates data imputation or cleaning before in-depth analysis."
        
    return f"{domain_text} {content_text} {quality_text}"

def clean_float(val):
    if pd.isna(val) or (isinstance(val, float) and (math.isnan(val) or math.isinf(val))):
        return None
    return val

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}.csv")
    
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        if df.empty:
             raise pd.errors.EmptyDataError
        df.to_csv(file_path, index=False)
        return {"file_id": file_id, "message": "File uploaded successfully"}
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="The uploaded CSV is empty.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary/{file_id}")
async def get_summary(file_id: str):
    file_path = get_file_path(file_id)
    try:
        df = pd.read_csv(file_path)
        rows, columns = df.shape
        
        summary = {
            "rows": rows,
            "columns": columns,
            "column_info": []
        }
        
        numeric_df = df.select_dtypes(include=[np.number])
        desc = numeric_df.describe().to_dict() if not numeric_df.empty else {}
        
        for col in df.columns:
            dtype = str(df[col].dtype)
            missing = int(df[col].isna().sum())
            info = {
                "name": col,
                "type": dtype,
                "missing": missing
            }
            if col in desc:
                # Add mean, median, std
                info["mean"] = desc[col].get("mean", None)
                info["std"] = desc[col].get("std", None)
                if not df[col].dropna().empty:
                    info["median"] = df[col].median()
            summary["column_info"].append(info)
            
        for ci in summary["column_info"]:
            for k in ["mean", "std", "median"]:
                if k in ci:
                    ci[k] = clean_float(ci[k])
                    
        summary["description"] = generate_dataset_description(df, summary)
                
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clean/{file_id}")
async def clean_data(file_id: str):
    file_path = get_file_path(file_id)
    try:
        df = pd.read_csv(file_path)
        
        initial_rows = len(df)
        initial_missing = df.isna().sum().sum()
        
        # Remove duplicates
        df = df.drop_duplicates()
        dupes_removed = initial_rows - len(df)
        
        # Handle missing values - simple approach: drop rows if all missing, else fill forwards/backwards or drop
        df = df.dropna(how='all')
        
        # For remaining missing, we can fill numeric with median and categorical with mode
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        categorical_cols = df.select_dtypes(exclude=[np.number]).columns
        
        for col in numeric_cols:
            if df[col].isna().any():
                df[col] = df[col].fillna(df[col].median())
        
        for col in categorical_cols:
            if df[col].isna().any():
                mode_val = df[col].mode()
                if not mode_val.empty:
                    df[col] = df[col].fillna(mode_val[0])
                else:
                    df[col] = df[col].fillna("Unknown")
                    
        final_missing = int(df.isna().sum().sum())
        missing_handled = int(initial_missing - final_missing)
        
        # Write back cleaned data
        df.to_csv(file_path, index=False)
        
        # return preview - clean NaNs
        preview_data = df.head(10).replace({np.nan: None}).to_dict(orient="records")
        for row in preview_data:
            for k, v in row.items():
                if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
                    row[k] = None
        
        return {
            "report": {
                "duplicates_removed": dupes_removed,
                "missing_values_handled": missing_handled,
                "final_rows": len(df)
            },
            "preview": preview_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/visualize/{file_id}")
async def visualize_data(file_id: str, request: VisualizeRequest):
    file_path = get_file_path(file_id)
    try:
        df = pd.read_csv(file_path)
        
        c_type = request.chart_type.lower()
        x = request.x_col
        y = request.y_col
        
        if x not in df.columns:
            raise HTTPException(status_code=400, detail=f"Column {x} not found.")
            
        # Optional basic type coercion for charting stability
        def soft_numeric_cast(col_name):
            if df[col_name].dtype == 'object':
                try:
                    num_attempt = pd.to_numeric(df[col_name].astype(str).str.replace(r'[$,%]', '', regex=True), errors='ignore')
                    if pd.api.types.is_numeric_dtype(num_attempt):
                        df[col_name] = num_attempt
                except:
                    pass
        
        soft_numeric_cast(x)
        if y and y in df.columns:
            soft_numeric_cast(y)
        
        if c_type in ["histogram", "pie"]:
            # Single column charts
            if c_type == "histogram":
                if pd.api.types.is_numeric_dtype(df[x]):
                    # Return bins and counts for numeric data
                    counts, bins = np.histogram(df[x].dropna(), bins=10)
                    labels = [f"{bins[i]:.2f}-{bins[i+1]:.2f}" for i in range(len(bins)-1)]
                    data = counts.tolist()
                    return {"labels": labels, "datasets": [{"label": x, "data": data}]}
                else:
                    # Fallback to categorical frequency distribution if not numeric
                    value_counts = df[x].value_counts().head(15)
                    labels = value_counts.index.astype(str).tolist()
                    data = value_counts.values.tolist()
                    return {"labels": labels, "datasets": [{"label": f"Frequency of {x}", "data": data}]}
                
            if c_type == "pie":
                # Categorical count, or bin top 10 unique values
                value_counts = df[x].value_counts().head(10)
                labels = value_counts.index.astype(str).tolist()
                data = value_counts.values.tolist()
                return {"labels": labels, "datasets": [{"label": x, "data": data}]}
                
        else:
            # Two column charts, with adaptive fallbacks if y is missing
            if not y or y not in df.columns:
                 if c_type in ["bar", "line"]:
                     # Frequency count of X as a fallback single-series shape
                     value_counts = df[x].value_counts().head(20)
                     labels = value_counts.index.astype(str).tolist()
                     data = value_counts.values.tolist()
                     return {"labels": labels, "datasets": [{"label": f"Count of {x}", "data": data}]}
                 elif c_type == "scatter":
                     if pd.api.types.is_numeric_dtype(df[x]):
                         # index vs numeric fallback
                         df_clean = df[x].dropna().head(500).reset_index()
                         scatter_data = [{"x": float(row['index']), "y": float(row[x])} for _, row in df_clean.iterrows()]
                         return {"datasets": [{"label": f"Index vs {x}", "data": scatter_data}]}
                     else:
                         raise HTTPException(status_code=400, detail="Scatter plot requires at least one numeric column. Please select appropriately.")
                 else:
                     raise HTTPException(status_code=400, detail="Y-axis column required for this chart type.")
                
            # If we reach here, both X and Y exist.
            if c_type == "scatter":
                if pd.api.types.is_numeric_dtype(df[x]) and pd.api.types.is_numeric_dtype(df[y]):
                    # Ideal scatter plot scenario
                    df_clean = df[[x, y]].dropna().head(500)
                    scatter_data = [{"x": float(row[x]), "y": float(row[y])} for _, row in df_clean.iterrows()]
                    return {"datasets": [{"label": f"{y} vs {x}", "data": scatter_data}]}
                else:
                    raise HTTPException(status_code=400, detail="Scatter plot typically requires numeric vs numeric columns for accurate positioning.")
                
            if c_type == "bar":
                if pd.api.types.is_numeric_dtype(df[y]):
                    # Aggregate numeric Y by X
                    df_clean = df.groupby(x, dropna=True)[y].mean().reset_index()
                    df_clean = df_clean.head(20)
                    labels = df_clean[x].astype(str).tolist()
                    data = df_clean[y].fillna(0).tolist()
                    return {"labels": labels, "datasets": [{"label": f"Mean of {y} by {x}", "data": data}]}
                else:
                    # Y is not numeric, fallback to just frequency of X, ignoring Y entirely.
                    value_counts = df[x].value_counts().head(20)
                    labels = value_counts.index.astype(str).tolist()
                    data = value_counts.values.tolist()
                    return {"labels": labels, "datasets": [{"label": f"Count of {x} (Y ignored)", "data": data}]}

            if c_type == "line":
                if pd.api.types.is_numeric_dtype(df[y]):
                    # Sequence line plot
                    df_clean = df[[x, y]].dropna().sort_values(by=x).head(500)
                    labels = df_clean[x].astype(str).tolist()
                    data = df_clean[y].tolist()
                    return {"labels": labels, "datasets": [{"label": f"{y} vs {x}", "data": data}]}
                else:
                    # Fallback to frequency trend
                    value_counts = df[x].value_counts().sort_index().head(50)
                    labels = value_counts.index.astype(str).tolist()
                    data = value_counts.values.tolist()
                    return {"labels": labels, "datasets": [{"label": f"Frequency distribution of {x} (Y ignored)", "data": data}]}
                
        raise HTTPException(status_code=400, detail="Unsupported chart type.")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
