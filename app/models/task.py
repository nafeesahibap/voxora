from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from app.database.base import Base
import uuid
from datetime import datetime
from .enums import TaskPriorityEnum

class Task(Base):
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, index=True)
    description = Column(String)
    priority = Column(Enum(TaskPriorityEnum), default=TaskPriorityEnum.medium)
    status = Column(String, default="pending") # pending, completed
    progress = Column(Integer, default=0)
    date = Column(DateTime, default=datetime.utcnow)
    category = Column(String)
    candidate = Column(String)
    voice_created = Column(String, default="false") # "true" or "false"
    owner_id = Column(Integer, ForeignKey("user.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
