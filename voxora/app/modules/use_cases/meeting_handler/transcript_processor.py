class TranscriptProcessor:
    """
    Processes raw transcripts for cleaner output.
    """
    async def process_transcript(self, raw_text: str) -> str:
        return raw_text.strip()
