from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from app.database.base import Base
from datetime import datetime
from .enums import InterviewStatusEnum, InterviewTypeEnum

class Interview(Base):
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String, ForeignKey("candidate.id"), nullable=False)
    job_posting_id = Column(String, ForeignKey("jobposting.id"), nullable=False)
    
    interview_date = Column(DateTime, nullable=False)
    interview_time = Column(String, nullable=False) # e.g., "10:00 AM"
    interview_type = Column(Enum(InterviewTypeEnum), default=InterviewTypeEnum.technical)
    status = Column(Enum(InterviewStatusEnum), default=InterviewStatusEnum.scheduled)
    
    zoom_link = Column(String)
    notes = Column(Text)
    transcript_path = Column(String)
    report_path = Column(String)
    
    sentiment_score = Column(Float)
    match_score = Column(Integer)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    candidate = relationship("Candidate")
    job_posting = relationship("JobPosting")
