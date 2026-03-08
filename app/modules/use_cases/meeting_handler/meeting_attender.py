import logging

logger = logging.getLogger(__name__)

class MeetingAttender:
    """
    Joins meetings and captures audio.
    """
    async def join_meeting(self, meeting_url: str) -> bool:
        logger.info(f"Joining meeting at {meeting_url}")
        return True

    async def listen(self) -> None:
        pass
