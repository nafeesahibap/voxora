import enum

class StageEnum(str, enum.Enum):
    screening = "screening"
    interview = "interview"
    offer = "offer"
    hired = "hired"
    rejected = "rejected"

class SourceEnum(str, enum.Enum):
    manual_upload = "manual_upload"
    job_application = "job_application"
    voxora_link = "voxora_link"

class FileTypeEnum(str, enum.Enum):
    pdf = "pdf"
    docx = "docx"

class SkillCategoryEnum(str, enum.Enum):
    technical = "technical"
    soft_skills = "soft_skills"
    languages = "languages"
    other = "other"
class TaskPriorityEnum(str, enum.Enum):
    high = "high"
    medium = "medium"
    low = "low"

class InterviewStatusEnum(str, enum.Enum):
    scheduled = "Scheduled"
    completed = "Completed"
    cancelled = "Cancelled"

class InterviewTypeEnum(str, enum.Enum):
    technical = "Technical"
    hr = "HR"
    final = "Final"
    screening = "Screening"
