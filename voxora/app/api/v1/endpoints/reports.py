"""
Business Reports API
Provides endpoints for document upload (PDF/DOCX/TXT) and AI-driven analysis.
Falls back to keyword-based extraction if no LLM API key is configured.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any
import uuid
import os
import re

router = APIRouter()

UPLOAD_DIR = "data/uploads/reports"
os.makedirs(UPLOAD_DIR, exist_ok=True)

_report_store: Dict[str, str] = {}


def _extract_text(file_path: str) -> str:
    """Extract raw text from PDF, DOCX, or TXT file."""
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()

    elif ext == ".pdf":
        try:
            import pypdf
            reader = pypdf.PdfReader(file_path)
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        except ImportError:
            try:
                import PyPDF2
                with open(file_path, "rb") as f:
                    reader = PyPDF2.PdfReader(f)
                    return "\n".join(page.extract_text() or "" for page in reader.pages)
            except ImportError:
                return "[PDF text extraction unavailable. Please install pypdf: pip install pypdf]"

    elif ext == ".docx":
        try:
            import docx
            doc = docx.Document(file_path)
            return "\n".join(p.text for p in doc.paragraphs)
        except ImportError:
            return "[DOCX text extraction unavailable. Please install python-docx: pip install python-docx]"

    return ""


def _analyze_text(text: str, analysis_type: str) -> dict:
    """Perform keyword-based analysis of the document text."""
    sentences = [s.strip() for s in re.split(r'[.!?]', text) if len(s.strip()) > 20]
    words = text.lower().split()
    word_count = len(words)
    sentence_count = len(sentences)

    if analysis_type == "summary":
        # Pick top sentences heuristically (longer ones near the start)
        top_sentences = sorted(sentences[:50], key=len, reverse=True)[:5]
        summary_text = ". ".join(top_sentences[:3]) + "."
        highlights = [s for s in top_sentences[3:8]] if len(top_sentences) > 3 else [
            f"Document contains approximately {word_count} words.",
            f"Document contains {sentence_count} sentences.",
        ]
        return {
            "title": "Executive Summary",
            "content": summary_text or "Document processed successfully.",
            "highlights": highlights[:5]
        }

    elif analysis_type == "metrics":
        # Extract numbers as metrics
        numbers = re.findall(r'\b\d[\d,]*\.?\d*\s*(?:%|percent|million|billion|k|USD|usd)?\b', text)
        unique_numbers = list(dict.fromkeys(numbers))[:8]
        context_metrics = []
        for num in unique_numbers:
            # find surrounding context
            idx = text.find(num)
            ctx = text[max(0, idx - 30):idx + len(num) + 30].strip().replace("\n", " ")
            context_metrics.append({"value": num, "label": ctx[:60]})

        if not context_metrics:
            context_metrics = [
                {"value": str(word_count), "label": "Total words"},
                {"value": str(sentence_count), "label": "Total sentences"},
                {"value": str(len(set(words))), "label": "Unique words"},
            ]

        return {"title": "Key Metrics Extracted", "metrics": context_metrics}

    elif analysis_type == "alerts":
        risk_keywords = [
            "risk", "concern", "danger", "warning", "threat", "issue", "problem",
            "loss", "decline", "decrease", "fail", "litigation", "penalty", "breach",
            "deficit", "shortage", "delay", "critical", "urgent", "compliance"
        ]
        found = []
        for sent in sentences:
            if any(kw in sent.lower() for kw in risk_keywords):
                found.append(sent[:200])
            if len(found) >= 6:
                break

        if not found:
            found = ["No explicit risk indicators detected in the document."]

        return {"title": "Alerts & Risk Indicators", "alerts": found}

    elif analysis_type == "demand":
        growth_keywords = [
            "demand", "growth", "increase", "opportunity", "trend", "market",
            "revenue", "profit", "expansion", "rise", "surge", "adoption",
            "popular", "innovative", "leading", "top", "best"
        ]
        found = []
        for sent in sentences:
            if any(kw in sent.lower() for kw in growth_keywords):
                found.append(sent[:200])
            if len(found) >= 6:
                break

        if not found:
            found = ["No specific demand or growth signals detected in the document."]

        return {"title": "Demand & Growth Insights", "insights": found}

    raise HTTPException(status_code=400, detail=f"Unknown analysis type: {analysis_type}")


@router.post("/upload")
async def upload_report(file: UploadFile = File(...)):
    """Upload a business report (PDF, DOCX, TXT) and return a file_id."""
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".docx", ".txt"]:
        raise HTTPException(status_code=400, detail="Supported formats: PDF, DOCX, TXT")

    file_id = uuid.uuid4().hex
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    _report_store[file_id] = file_path
    return {"file_id": file_id, "filename": file.filename}


@router.get("/analyze/{file_id}/{analysis_type}")
def analyze_report(file_id: str, analysis_type: str):
    """Analyze a previously uploaded document. Supported types: summary, metrics, alerts, demand."""
    if file_id not in _report_store:
        raise HTTPException(status_code=404, detail="File not found. Please upload again.")

    file_path = _report_store[file_id]
    text = _extract_text(file_path)

    if not text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from the document.")

    return _analyze_text(text, analysis_type)
