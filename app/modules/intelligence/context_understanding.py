from typing import Any
import logging

logger = logging.getLogger(__name__)

class ContextManager:
    """
    Maintains and retrieves conversation context.
    """
    def __init__(self):
        self.context_store = {}

    def get_context(self, session_id: str) -> dict:
        return self.context_store.get(session_id, {})
    
    def update_context(self, session_id: str, data: Any) -> None:
        if session_id not in self.context_store:
            self.context_store[session_id] = {}
        self.context_store[session_id].update(data)
