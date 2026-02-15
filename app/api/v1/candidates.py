from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.candidate import Candidate, StageEnum, SourceEnum
from app.models.resume import Resume, FileTypeEnum
from app.models.job import JobPosting
from app.schemas import Candidate as CandidateSchema, CandidateCreate
from app.utils.parser import parse_resume
from app.utils.matching import calculate_match_score
import json

router = APIRouter(prefix="/candidates", tags=["candidates"])

@router.get("/", response_model=List[CandidateSchema])
def list_candidates(
    search: Optional[str] = None,
    stage: Optional[str] = None,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Candidate)
        if search:
            query = query.filter(Candidate.first_name.contains(search) | Candidate.last_name.contains(search) | Candidate.email.contains(search))
        if stage:
            query = query.filter(Candidate.stage == stage)
        results = query.all()
        print(f"API List Candidates found: {len(results)}")
        return results
    except Exception as e:
        import traceback
        with open("debug_log.txt", "a") as f:
            f.write(f"\nLIST ERROR: {str(e)}\n{traceback.format_exc()}\n")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{candidate_id}", response_model=CandidateSchema)
def get_candidate(candidate_id: str, db: Session = Depends(get_db)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate

@router.post("/upload")
async def upload_candidate(
    resume: UploadFile = File(...),
    jobId: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    try:
        contents = await resume.read()
        file_type = FileTypeEnum.pdf if resume.filename.endswith('.pdf') else FileTypeEnum.docx
        
        # Parse
        parsed_data = parse_resume(contents.decode('utf-8', errors='ignore'), file_type, filename=resume.filename)
        
        # Create Candidate
        new_candidate = Candidate(
            first_name=parsed_data["first_name"],
            last_name=parsed_data["last_name"],
            email=parsed_data["email"],
            skills=",".join(parsed_data["skills"]),
            resume_text=parsed_data["text"],
            experience_years=float(parsed_data["experience"]),
            job_posting_id=jobId
        )
        
        # Matching Logic
        if jobId:
            # Match against specific job
            job = db.query(JobPosting).filter(JobPosting.id == jobId).first()
            if job:
                req_skills = json.loads(job.required_skills) if job.required_skills else []
                new_candidate.match_score = calculate_match_score(
                    parsed_data["skills"], 
                    req_skills,
                    parsed_data["experience"],
                    job.experience_required or 0
                )
        else:
            # Default "General Pool" Matching
            # Compare against a standard set of high-demand skills to generate a non-zero score
            default_hot_skills = ["React", "Python", "Communication", "SQL", "AWS"]
            new_candidate.match_score = calculate_match_score(
                parsed_data["skills"],
                default_hot_skills,
                parsed_data["experience"],
                3.0 # Assume 3 years required for general pool
            )

        db.add(new_candidate)
        db.commit()
        db.refresh(new_candidate)
        
        return new_candidate
    except Exception as e:
        db.rollback()
        import traceback
        error_msg = traceback.format_exc()
        try:
            with open("debug_log.txt", "w") as f:
                f.write(error_msg)
        except:
            pass
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
