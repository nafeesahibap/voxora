class ResponseFormatter:
    """
    Formats the final response payload.
    """
    def format_response(self, text: str, data: dict = None) -> dict:
        return {
            "text": text,
            "data": data or {},
            "timestamp": "2023-01-01T00:00:00Z"
        }
