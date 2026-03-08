import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from app.database.session import SessionLocal
from app.database.repository.user_repository import UserRepository
from app.models.schemas import UserCreate

def create_admin():
    db = SessionLocal()
    repo = UserRepository()
    user = UserCreate(email="admin@example.com", password="adminpassword", is_superuser=True)
    repo.create(db, user)
    print("Admin user created")

if __name__ == "__main__":
    create_admin()
