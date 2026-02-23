from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.notification import Notification

router = APIRouter(prefix="", tags=["hr"])

@router.get("/notifications")
def get_notifications(db: Session = Depends(get_db)):
    """Get all unread notifications"""
    return db.query(Notification).filter(Notification.is_read == False).order_by(Notification.created_at.desc()).all()

@router.post("/notifications/mark-read")
def mark_notifications_read(notificationIds: List[str] = None, all: bool = False, db: Session = Depends(get_db)):
    """Mark specific or all notifications as read"""
    query = db.query(Notification)
    if not all and notificationIds:
        query = query.filter(Notification.id.in_(notificationIds))
    
    notifications = query.all()
    for n in notifications:
        n.is_read = True
    
    db.commit()
    return {"message": f"Marked {len(notifications)} notifications as read"}
