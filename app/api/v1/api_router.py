from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, voice, meeting, call, task, content, avatar, explainability, booking, data_intelligence, market, reports
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(voice.router, prefix="/voice", tags=["voice"])
api_router.include_router(meeting.router, prefix="/meetings", tags=["meetings"])
api_router.include_router(call.router, prefix="/calls", tags=["calls"])
api_router.include_router(task.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(content.router, prefix="/content", tags=["content"])
api_router.include_router(avatar.router, prefix="/avatar", tags=["avatar"])
api_router.include_router(explainability.router, prefix="/explain", tags=["explainability"])
api_router.include_router(booking.router, prefix="/booking", tags=["booking"])
api_router.include_router(data_intelligence.router, prefix="/data-intelligence", tags=["data_intelligence"])
api_router.include_router(market.router, prefix="/market", tags=["market"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
