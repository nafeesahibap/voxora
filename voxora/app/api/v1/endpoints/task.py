from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.task import Task
from app import schemas
from datetime import datetime

router = APIRouter(prefix="", tags=["tasks"])

@router.get("/", response_model=List[schemas.Task])
def list_tasks(db: Session = Depends(get_db)):
    # Simple strategy: get tasks for today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    return db.query(Task).filter(Task.date >= today_start).all()

@router.post("/", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    data = task.model_dump(exclude_unset=True)
    if "date" not in data or data["date"] is None:
        data["date"] = datetime.utcnow()
    
    db_task = Task(**data)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.put("/{task_id}", response_model=schemas.Task)
def update_task(task_id: str, task: schemas.TaskUpdate, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task

@router.patch("/{task_id}/progress", response_model=schemas.Task)
def update_progress(task_id: str, progress: int = Body(..., embed=True), db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db_task.progress = progress
    db.commit()
    db.refresh(db_task)
    return db_task

@router.delete("/{task_id}")
def delete_task(task_id: str, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(db_task)
    db.commit()
    return {"status": "ok"}
