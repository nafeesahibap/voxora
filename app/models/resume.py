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
    file_name = Column(String)
    file_data = Column(Text)  # Base64 or path
    file_type = Column(Enum(FileTypeEnum))
    version = Column(Integer, default=1)
    is_current = Column(Boolean, default=True)
    voxora_link_token = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("Candidate", back_populates="resumes")
