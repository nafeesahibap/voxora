from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.candidate import Candidate, StageEnum, SourceEnum
from app.models.resume import Resume, FileTypeEnum
from app.models.job import JobPosting
from app.schemas import Candidate as CandidateSchema, CandidateCreate
from app.models.notification import Notification
from app.utils.parser import parse_resume
from app.utils.matching import calculate_match_score
import json
from datetime import datetime
import uuid

router = APIRouter(prefix="", tags=["candidates"])

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
    source: Optional[str] = Form('manual'),
    firstName: Optional[str] = Form(None),
    lastName: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    print(f"API: Received {source} request for {resume.filename}")
    
    # Sanitize inputs
    if jobId == "":
        jobId = None
    if source == "":
        source = 'manual'
        
    try:
        contents = await resume.read()
        print(f"API: Read {len(contents)} bytes.")
        
        file_type = FileTypeEnum.pdf if resume.filename.endswith('.pdf') else FileTypeEnum.docx
        
        # Parse
        print("API: Starting resume parse...")
        text_content = contents.decode('utf-8', errors='ignore')
        parsed_data = parse_resume(text_content, file_type, filename=resume.filename)
        print(f"API: Parsed data for {parsed_data.get('email')}")
        
        # Create Candidate
        print("API: Creating candidate object...")
        new_candidate = Candidate(
            id=str(uuid.uuid4()),
            first_name=firstName or parsed_data["first_name"],
            last_name=lastName or parsed_data["last_name"],
            email=email or parsed_data["email"],
            phone=phone or parsed_data.get("phone"),
            skills=",".join(parsed_data["skills"]),
            resume_text=parsed_data["text"],
            experience_years=float(parsed_data["experience"]),
            job_posting_id=jobId,
            application_source=source,
            applied_via_link=(source == 'public_link'),
            application_date=datetime.utcnow()
        )
        
        # ... matching logic ...
        # (keeping matching logic as is for now)
        
        # Match against specific job
        job_title = "General Pool"
        if jobId:
            job = db.query(JobPosting).filter(JobPosting.id == jobId).first()
            if job:
                job_title = job.title
                req_skills = json.loads(job.required_skills) if job.required_skills else []
                new_candidate.match_score = calculate_match_score(
                    parsed_data["skills"], 
                    req_skills,
                    parsed_data["experience"],
                    job.experience_required or 0
                )
        else:
            default_hot_skills = ["React", "Python", "Communication", "SQL", "AWS"]
            new_candidate.match_score = calculate_match_score(
                parsed_data["skills"],
                default_hot_skills,
                parsed_data["experience"],
                3.0 
            )

        db.add(new_candidate)
        
        # Create Resume record
        new_resume = Resume(
            id=str(uuid.uuid4()),
            candidate_id=new_candidate.id,
            job_posting_id=jobId,
            file_name=resume.filename,
            file_type=file_type,
            upload_source=source,
            is_notified=True
        )
        db.add(new_resume)
        
        # Create Notification
        new_notification = Notification(
            id=str(uuid.uuid4()),
            type='new_candidate',
            candidate_id=new_candidate.id,
            job_posting_id=jobId,
            message=f"🎉 {new_candidate.first_name} applied for {job_title} ({new_candidate.match_score}% match)",
            created_at=datetime.utcnow()
        )
        db.add(new_notification)

        db.commit()
        db.refresh(new_candidate)
        print(f"API: Success. Candidate ID: {new_candidate.id}")
        
        return new_candidate
    except Exception as e:
        db.rollback()
        import traceback
        error_msg = traceback.format_exc()
        print(f"API ERROR: {error_msg}")
        try:
            with open("debug_log.txt", "a") as f:
                f.write(f"\n[{datetime.now()}] UPLOAD ERROR: {error_msg}\n")
        except:
            pass
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
