class UserProfileManager:
    """
    Manages user preferences and profiles.
    """
    async def get_preferences(self, user_id: str) -> dict:
        return {"theme": "dark", "voice_speed": 1.0}
