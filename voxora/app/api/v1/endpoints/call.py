from fastapi import APIRouter

router = APIRouter()

@router.post("/start")
async def start_call(number: str):
    return {"status": "calling", "number": number}
