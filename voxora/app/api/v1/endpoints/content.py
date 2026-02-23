from fastapi import APIRouter

router = APIRouter()

@router.post("/generate")
async def generate_content(topic: str):
    return {"content": "Generated content placeholder"}
