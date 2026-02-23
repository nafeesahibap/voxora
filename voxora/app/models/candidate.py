from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Float, Boolean
from sqlalchemy.orm import relationship
from app.database.base import Base
import enum
import uuid
from datetime import datetime

from .enums import StageEnum, SourceEnum

class Candidate(Base):
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    current_company = Column(String)
    current_title = Column(String)
    experience_years = Column(Float)
    location = Column(String)
    skills = Column(Text)  # JSON string
    stage = Column(Enum(StageEnum), default=StageEnum.screening)
    source = Column(Enum(SourceEnum), default=SourceEnum.manual_upload)
    application_source = Column(String, default='manual') # Added for tracking: manual, public_link
    applied_via_link = Column(Boolean, default=False)
    application_date = Column(DateTime)
    job_posting_id = Column(String, ForeignKey("jobposting.id"))
    match_score = Column(Integer, default=0)
    notes = Column(Text)
    resume_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    resumes = relationship("Resume", back_populates="candidate")
    job_posting = relationship("JobPosting", back_populates="candidates")
