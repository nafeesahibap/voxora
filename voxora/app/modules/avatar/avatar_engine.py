class AvatarEngine:
    """
    Controls avatar rendering and animation.
    """
    async def render_avatar(self, state: str) -> bytes:
        return b"avatar_image_data"

    async def animate(self, action: str) -> None:
        pass
