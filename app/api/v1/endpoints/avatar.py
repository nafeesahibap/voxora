from fastapi import APIRouter

router = APIRouter()

@router.post("/speak")
async def avatar_speak(text: str):
    return {"status": "speaking"}
