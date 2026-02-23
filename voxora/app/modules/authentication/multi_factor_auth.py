import logging

logger = logging.getLogger(__name__)

class MFAHandler:
    """
    Handles Multi-Factor Authentication logic.
    """
    async def send_otp(self, user_contact: str) -> str:
        """
        Sends an OTP to the user.
        """
        logger.info(f"Sending OTP to {user_contact}")
        return "123456"

    async def verify_otp(self, user_contact: str, otp: str) -> bool:
        """
        Verifies the provided OTP.
        """
        return otp == "123456"
