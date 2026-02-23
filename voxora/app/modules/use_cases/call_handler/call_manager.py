import logging

logger = logging.getLogger(__name__)

class CallManager:
    """
    Manages phone calls.
    """
    async def make_call(self, number: str) -> bool:
        logger.info(f"Calling {number}...")
        return True

    async def receive_call(self, call_data: dict) -> None:
        pass
