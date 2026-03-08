import logging

logger = logging.getLogger(__name__)

class VoiceCapture:
    """
    Handles recording and buffering of voice input.
    """
    def record_audio(self, duration: int = 5) -> bytes:
        """
        Records audio for a specified duration.
        """
        logger.info(f"Recording audio for {duration} seconds...")
        return b"mock_audio_data"
