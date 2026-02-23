from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from app.database.base import Base
import enum
import uuid
from datetime import datetime

from .enums import FileTypeEnum

class Resume(Base):
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String, ForeignKey("candidate.id"))
    job_posting_id = Column(String, ForeignKey("jobposting.id")) # Linked job
    file_name = Column(String)
    file_data = Column(Text)  # Base64 or path
    file_type = Column(Enum(FileTypeEnum))
    version = Column(Integer, default=1)
    is_current = Column(Boolean, default=True)
    
    # Metadata tracking
    upload_source = Column(String, default='manual')
    voxora_link_token = Column(String)
    ip_address = Column(String)
    user_agent = Column(Text)
    is_notified = Column(Boolean, default=False)
    
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="resumes")
