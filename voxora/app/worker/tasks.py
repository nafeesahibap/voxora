from app.worker.celery_app import celery_app
import time

@celery_app.task
def process_voice_async(file_path: str):
    time.sleep(5) # Simulate processing
    return f"Processed {file_path}"
