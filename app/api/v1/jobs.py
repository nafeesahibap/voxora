from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.job import JobPosting
from app.schemas import JobPosting as JobSchema
import uuid

router = APIRouter(prefix="", tags=["jobs"])

@router.get("/", response_model=List[JobSchema])
def list_jobs(db: Session = Depends(get_db)):
    return db.query(JobPosting).filter(JobPosting.is_active == True).all()

@router.get("/{job_id}", response_model=JobSchema)
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.get("/{job_id}/generate-upload-link")
def generate_link(job_id: str):
    token = str(uuid.uuid4())[:8]
    # In a real app, store this token in DB with expiry
    return {
        "uploadLink": f"http://127.0.0.1:8000/apply?jobId={job_id}&token={token}",
        "token": token
    }
