from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database.base import Base

class Task(Base):
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    owner_id = Column(Integer, ForeignKey("user.id"))
    created_at = Column(DateTime)
    status = Column(String, default="pending")
