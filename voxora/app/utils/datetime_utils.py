from datetime import datetime
import pytz

def get_current_time_utc() -> datetime:
    return datetime.now(pytz.utc)
