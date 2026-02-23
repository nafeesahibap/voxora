from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey
from app.database.base import Base
import uuid
from datetime import datetime

class Notification(Base):
    __tablename__ = "notification"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    type = Column(String, nullable=False) # 'new_candidate', 'resume_uploaded'
    candidate_id = Column(String, ForeignKey("candidate.id"), nullable=True)
    job_posting_id = Column(String, ForeignKey("jobposting.id"), nullable=True)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
