from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.database.base import Base
import uuid
from datetime import datetime

class JobPosting(Base):
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    department = Column(String)
    required_skills = Column(Text)  # JSON
    preferred_skills = Column(Text) # JSON
    experience_required = Column(Integer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    candidates = relationship("Candidate", back_populates="job_posting")
