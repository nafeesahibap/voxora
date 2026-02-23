from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, voice, meeting, call, task, content, avatar, explainability, hr, interviews
)
from app.api.v1 import candidates, jobs

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(voice.router, prefix="/voice", tags=["voice"])
api_router.include_router(meeting.router, prefix="/meetings", tags=["meetings"])
api_router.include_router(call.router, prefix="/calls", tags=["calls"])
api_router.include_router(task.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(content.router, prefix="/content", tags=["content"])
api_router.include_router(avatar.router, prefix="/avatar", tags=["avatar"])
api_router.include_router(explainability.router, prefix="/explain", tags=["explainability"])
api_router.include_router(hr.router, prefix="/hr", tags=["hr"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["interviews"])
api_router.include_router(candidates.router, prefix="/candidates", tags=["candidates"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
