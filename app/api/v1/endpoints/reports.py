from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import uuid
import io
import PyPDF2
import docx
import re

router = APIRouter()

UPLOAD_DIR = "data/reports"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def extract_text_from_pdf(content):
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    return text

def extract_text_from_docx(content):
    doc = docx.Document(io.BytesIO(content))
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

def extract_text_from_txt(content):
    return content.decode("utf-8")

@router.post("/upload")
async def upload_report(file: UploadFile = File(...)):
    allowed_extensions = {".pdf", ".docx", ".txt"}
    ext = os.path.splitext(file.filename)[1].lower()
    
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Unsupported file format. Supported: {', '.join(allowed_extensions)}")
    
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")
    
    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="The uploaded file is empty.")
            
        with open(file_path, "wb") as f:
            f.write(content)
            
        return {"file_id": file_id, "filename": file.filename, "extension": ext}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analyze/{file_id}/{analysis_type}")
async def analyze_report(file_id: str, analysis_type: str):
    # Find the file with any of the allowed extensions
    file_path = None
    extension = None
    for ext in [".pdf", ".docx", ".txt"]:
        path = os.path.join(UPLOAD_DIR, f"{file_id}{ext}")
        if os.path.exists(path):
            file_path = path
            extension = ext
            break
            
    if not file_path:
        raise HTTPException(status_code=404, detail="Report not found.")
        
    try:
        with open(file_path, "rb") as f:
            content = f.read()
            
        if extension == ".pdf":
            text = extract_text_from_pdf(content)
        elif extension == ".docx":
            text = extract_text_from_docx(content)
        else:
            text = extract_text_from_txt(content)
            
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from document.")
            
        if analysis_type == "summary":
            return generate_executive_summary(text)
        elif analysis_type == "metrics":
            return generate_key_metrics(text)
        elif analysis_type == "alerts":
            return generate_alerts_risks(text)
        elif analysis_type == "demand":
            return generate_demand_insights(text)
        else:
            raise HTTPException(status_code=400, detail="Invalid analysis type.")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_executive_summary(text):
    # Simple logic to find key sentences
    sentences = re.split(r'(?<=[.!?]) +', text.replace('\n', ' '))
    summary_sentences = sentences[:5] # Take first 5 sentences as a heuristic
    
    return {
        "title": "Executive Summary",
        "content": " ".join(summary_sentences),
        "highlights": [s[:100] + "..." for s in sentences if any(k in s.lower() for k in ["goal", "objective", "key", "significant", "result"])][:3]
    }

def generate_key_metrics(text):
    # Regex for numbers, percentages, currency
    metrics = []
    
    # Currency pattern
    money = re.findall(r'\$\s?\d+(?:,\d{3})*(?:\.\d+)?(?:\s?[kmbKMB])?', text)
    if money:
        metrics.append({"label": "Financial Value Detected", "value": money[0]})
        
    # Percentages
    pcts = re.findall(r'\d+(?:\.\d+)?%', text)
    if pcts:
        metrics.append({"label": "Growth/Change Indicator", "value": pcts[0]})
        
    # Generic numbers with labels
    data_points = re.findall(r'(\w+\s\w+)\s?:\s?(\d+(?:\.\d+)?)', text)
    for label, val in data_points[:2]:
        metrics.append({"label": label.title(), "value": val})
        
    if not metrics:
        metrics.append({"label": "Document Length", "value": f"{len(text.split())} words"})
        
    return {"title": "Key Metrics", "metrics": metrics}

def generate_alerts_risks(text):
    risk_keywords = ["risk", "danger", "warning", "decline", "issue", "problem", "threat", "challenge", "critical", "uncertainty"]
    sentences = re.split(r'(?<=[.!?]) +', text.replace('\n', ' '))
    alerts = []
    
    for s in sentences:
        if any(k in s.lower() for k in risk_keywords):
            alerts.append(s.strip())
            if len(alerts) >= 4: break
            
    if not alerts:
        alerts = ["No immediate high-risk indicators detected based on keyword analysis."]
        
    return {"title": "Alerts & Risks", "alerts": alerts}

def generate_demand_insights(text):
    growth_keywords = ["demand", "growth", "opportunity", "increase", "expansion", "potential", "rising", "strong", "market share"]
    sentences = re.split(r'(?<=[.!?]) +', text.replace('\n', ' '))
    insights = []
    
    for s in sentences:
        if any(k in s.lower() for k in growth_keywords):
            insights.append(s.strip())
            if len(insights) >= 4: break
            
    if not insights:
        insights = ["Conventional market stability observed. No specific surge in demand identified."]
        
    return {"title": "Demand Insights", "insights": insights}
