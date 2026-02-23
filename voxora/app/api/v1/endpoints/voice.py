from fastapi import APIRouter, File, UploadFile

router = APIRouter()

@router.post("/process")
async def process_voice(file: UploadFile = File(...)):
    """
    Process voice input file.
    """
    return {"status": "processing", "transcript": "placeholder"}
