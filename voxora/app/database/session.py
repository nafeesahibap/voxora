from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings

<<<<<<< HEAD
connect_args = {"check_same_thread": False} if "sqlite" in str(settings.DATABASE_URL) else {}
engine = create_engine(str(settings.DATABASE_URL), connect_args=connect_args)
=======
engine = create_engine(str(settings.DATABASE_URL))
>>>>>>> upstream/main
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
