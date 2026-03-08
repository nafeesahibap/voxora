from app.worker.celery_app import celery_app

@celery_app.task
def summarize_meeting_async(meeting_id: int):
    return f"Summary for meeting {meeting_id}"
