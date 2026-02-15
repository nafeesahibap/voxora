from celery import Celery
from app.config import settings

celery_app = Celery(
    "voice_worker",
    broker=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0",
    backend=f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/0"
)

celery_app.conf.task_routes = {
    "app.worker.tasks.*": "main-queue",
    "app.worker.meeting_tasks.*": "meeting-queue",
}
