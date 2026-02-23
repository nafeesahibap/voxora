from sqlalchemy import Column, Integer, String, DateTime
from app.database.base import Base

class Call(Base):
    id = Column(Integer, primary_key=True, index=True)
    caller_number = Column(String)
    start_time = Column(DateTime)
    duration_seconds = Column(Integer)
