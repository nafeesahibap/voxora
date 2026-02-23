from sqlalchemy import Column, Integer, String, DateTime
from app.database.base import Base

class Meeting(Base):
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    start_time = Column(DateTime)
    transcript_path = Column(String)
