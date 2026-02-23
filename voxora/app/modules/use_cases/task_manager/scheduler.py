from datetime import datetime

class Scheduler:
    """
    Schedules tasks and reminders.
    """
    async def schedule_task(self, task_id: str, time: datetime) -> bool:
        return True

    async def set_reminder(self, message: str, time: datetime) -> bool:
        return True
