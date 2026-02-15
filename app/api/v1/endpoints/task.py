from fastapi import APIRouter
from app.models import schemas

router = APIRouter()

@router.post("/create")
async def create_task(task: schemas.UserBase):
    return {"status": "task_created"}

@router.get("/list")
async def list_tasks():
    return [{"id": 1, "title": "Buy milk"}]
