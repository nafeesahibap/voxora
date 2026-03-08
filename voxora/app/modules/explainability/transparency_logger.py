import logging

logger = logging.getLogger(__name__)

class TransparencyLogger:
    """
    Logs decisions for auditability.
    """
    def log_decision(self, decision_data: dict) -> None:
        logger.info(f"DECISION LOG: {decision_data}")
