from fastapi import APIRouter

router = APIRouter()

@router.get("/decision/{decision_id}")
async def explain_decision(decision_id: str):
    return {"explanation": "Reasoning placeholder"}
