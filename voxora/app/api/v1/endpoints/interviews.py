from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.interview import Interview
from app.schemas import Interview as InterviewSchema, InterviewCreate, InterviewUpdate

router = APIRouter()

@router.get("/", response_model=List[InterviewSchema])
def get_interviews(db: Session = Depends(get_db)):
    return db.query(Interview).all()

@router.post("/", response_model=InterviewSchema)
def create_interview(interview_in: InterviewCreate, db: Session = Depends(get_db)):
    interview = Interview(**interview_in.model_dump())
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return interview

@router.get("/{interview_id}", response_model=InterviewSchema)
def get_interview(interview_id: int, db: Session = Depends(get_db)):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview

@router.put("/{interview_id}", response_model=InterviewSchema)
def update_interview(interview_id: int, interview_in: InterviewUpdate, db: Session = Depends(get_db)):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    update_data = interview_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(interview, field, value)
    
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return interview

@router.delete("/{interview_id}")
def delete_interview(interview_id: int, db: Session = Depends(get_db)):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    db.delete(interview)
    db.commit()
    return {"message": "Interview deleted"}
