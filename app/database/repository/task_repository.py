from sqlalchemy.orm import Session
from app.models.task import Task

class TaskRepository:
    def create(self, db: Session, title: str, description: str, owner_id: int):
        task = Task(title=title, description=description, owner_id=owner_id)
        db.add(task)
        db.commit()
        return task
