from fastapi import APIRouter

router = APIRouter()

@router.post("/join")
async def join_meeting(url: str):
    return {"status": "joined", "url": url}

@router.post("/summarize/{meeting_id}")
async def summarize_meeting(meeting_id: int):
    return {"summary": "Meeting summary placeholder"}
