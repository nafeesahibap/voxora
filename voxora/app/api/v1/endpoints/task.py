from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any
from app.database.session import get_db
from app.models.task import Task
from app import schemas
from datetime import datetime
import uuid
import re

router = APIRouter(prefix="", tags=["tasks"])

# In-memory session store for multi-turn voice interaction
VOICE_SESSIONS = {}

@router.get("/", response_model=List[schemas.Task])
def list_tasks(db: Session = Depends(get_db)):
    return db.query(Task).order_by(Task.created_at.desc()).all()

@router.get("/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total = db.query(Task).count()
    pending = db.query(Task).filter(Task.status == "pending").count()
    completed = db.query(Task).filter(Task.status == "completed").count()
    now = datetime.utcnow()
    # overdue tasks: status is pending and deadline is in the past
    overdue = db.query(Task).filter(Task.status == "pending", Task.deadline < now).count()
    
    return {
        "total": total,
        "pending": pending,
        "completed": completed,
        "overdue": overdue
    }

@router.post("/", response_model=schemas.Task)
def create_task(task: dict = Body(...), db: Session = Depends(get_db)):
    payload = dict(task or {})

    # Ensure defaults
    if not payload.get("status"):
        payload["status"] = "pending"
    if not payload.get("priority"):
        payload["priority"] = "medium"

    if "voice_created" in payload:
        vc = payload.get("voice_created")
        payload["voice_created"] = "true" if vc in (True, "true") else "false"
    else:
        payload["voice_created"] = "false"

    if "date" not in payload or payload["date"] is None:
        payload["date"] = datetime.utcnow()

    try:
        validated = schemas.TaskCreate.model_validate(payload)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Invalid task payload: {str(e)}")

    data = validated.model_dump(exclude_unset=True)
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
    
    db_task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_task)
    return db_task

@router.patch("/{task_id}/progress", response_model=schemas.Task)
def update_progress(task_id: str, progress: int = Body(..., embed=True), db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db_task.progress = progress
    db_task.updated_at = datetime.utcnow()
    if progress == 100:
        db_task.status = "completed"
    db.commit()
    db.refresh(db_task)
    return db_task

@router.patch("/{task_id}/complete", response_model=schemas.Task)
def complete_task(task_id: str, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db_task.status = "completed"
    db_task.progress = 100
    db_task.updated_at = datetime.utcnow()
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


# ---- VOICE / NLP PIPELINE ---- #

@router.post("/voice")
def handle_voice_intent(payload: dict = Body(...), db: Session = Depends(get_db)):
    text = payload.get("text", "").strip().lower()
    session_id = payload.get("session_id")
    
    if not text:
        raise HTTPException(status_code=400, detail="No text provided")

    # 1. Multi-turn State Machine Continuation
    if session_id and session_id in VOICE_SESSIONS:
        session_data = VOICE_SESSIONS.pop(session_id)
        
        # Parse priority from response text
        priority = "medium"
        if "high" in text: priority = "high"
        elif "low" in text: priority = "low"
        
        title = session_data.get("title")
        
        try:
            validated = schemas.TaskCreate(
                title=title,
                priority=priority,
                status="pending",
                voice_created="true",
                date=datetime.utcnow()
            )
            data = validated.model_dump(exclude_unset=True)
            db_task = Task(**data)
            db.add(db_task)
            db.commit()
            db.refresh(db_task)
            # Recreate serialized model to standard format
            return {
                "status": "success",
                "intent": "create_task",
                "task": schemas.Task.model_validate(db_task).model_dump(mode='json'),
                "message": f"Task created with {priority} priority."
            }
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Failed to create task after priority check: {str(e)}")

    # 2. NLP Intent Detection (Simulated via string matching for production-level API proxy)
    is_add_cmd = any(text.startswith(p) for p in ["add ", "remind me to ", "create task", "create a task", "new task", "make a task", "schedule "])
    
    # Very permissive fall-through: if it's long enough and doesn't look like a "show" command, treat it as a task
    if not is_add_cmd and len(text.split()) > 2 and not any(p in text for p in ["show", "go to", "open"]):
        is_add_cmd = True
    
    is_done_cmd = False
    target_done_title = ""
    # E.g. "Prepare slides done", "Finish prepare slides", "Mark submit report completed"
    if text.startswith("mark ") and (" as done" in text or " completed" in text):
        is_done_cmd = True
        target_done_title = text.replace("mark ", "").replace(" as done", "").replace(" completed", "").strip()
    elif text.startswith("finish ") or text.startswith("complete "):
        is_done_cmd = True
        target_done_title = text.replace("finish ", "").replace("complete ", "").strip()
    elif text.endswith(" done"):
        is_done_cmd = True
        target_done_title = text[:-5].strip()
    elif text.endswith(" completed"):
        is_done_cmd = True
        target_done_title = text[:-10].strip()

    # ---- INTENT: COMPLETE_TASK ---- #
    if is_done_cmd:
        target_done_title = target_done_title.replace("task ", "").strip()
        
        if not target_done_title or target_done_title in ("task", "the task", "it", "this", "that", "this task"):
            # Complete the most recent pending task
            db_task = db.query(Task).filter(Task.status == "pending").order_by(Task.created_at.desc()).first()
            if not db_task:
                return {"status": "error", "message": "Could not find any pending tasks to complete."}
        else:
            # Fuzzy match task in DB
            search_term = f"%{target_done_title}%"
            db_task = db.query(Task).filter(Task.status == "pending", Task.title.ilike(search_term)).order_by(Task.created_at.desc()).first()
            
            if not db_task:
                return {"status": "error", "message": f"Could not find a pending task matching '{target_done_title}'."}
        
        # Update DB
        db_task.status = "completed"
        db_task.progress = 100
        db_task.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_task)
        
        return {
            "status": "success",
            "intent": "complete_task",
            "task": schemas.Task.model_validate(db_task).model_dump(mode='json'),
            "message": f"Marked {db_task.title} as completed."
        }

    # ---- INTENT: CREATE_TASK ---- #
    if is_add_cmd:
        raw_title = text
        prefixes = [
            "add task to ", "add task ", "add a task to ", "add a task ", "add ",
            "remind me to ", "create a task to ", "create a task ", "create task to ", "create task ",
            "new task to ", "new task ", "make a task to ", "make a task ", "schedule a task to ", "schedule a task ", "schedule "
        ]
        for p in prefixes:
            if raw_title.startswith(p):
                raw_title = raw_title[len(p):]
                break
        
        # If the title is too short or empty after stripping, use the original text
        if len(raw_title.strip()) < 2:
            raw_title = text.capitalize()
        else:
            raw_title = raw_title.capitalize()
            
        title = raw_title.strip()
        
        priority = None
        if "high priority" in raw_title:
            priority = "high"
            raw_title = raw_title.replace("high priority", "").strip()
        elif "low priority" in raw_title:
            priority = "low"
            raw_title = raw_title.replace("low priority", "").strip()
        elif "medium priority" in raw_title:
            priority = "medium"
            raw_title = raw_title.replace("medium priority", "").strip()
        
        title = raw_title.capitalize()
        
        # Multi-turn interaction trigger
        if not priority:
            new_session_id = f"sess_{uuid.uuid4().hex[:8]}"
            VOICE_SESSIONS[new_session_id] = {
                "title": title,
                "intent": "create_task"
            }
            return {
                "status": "awaiting_input",
                "session_id": new_session_id,
                "tts_prompt": "What priority should I assign? High, Medium, or Low?"
            }
            
        # Priority was specified inline
        try:
            validated = schemas.TaskCreate(
                title=title,
                priority=priority,
                status="pending",
                voice_created="true",
                date=datetime.utcnow()
            )
            data = validated.model_dump(exclude_unset=True)
            db_task = Task(**data)
            db.add(db_task)
            db.commit()
            db.refresh(db_task)
            return {
                "status": "success",
                "intent": "create_task",
                "task": schemas.Task.model_validate(db_task).model_dump(mode='json'),
                "message": f"Task added with {priority} priority."
            }
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Failed voice creation inline: {str(e)}")

    # Fallback / Unknown Intent
    return {"status": "error", "message": "I didn't understand the command."}
