from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from .models import StageEnum, SourceEnum, FileTypeEnum, SkillCategoryEnum, TaskPriorityEnum, InterviewStatusEnum, InterviewTypeEnum

class ResumeBase(BaseModel):
    file_name: str
    file_type: FileTypeEnum
    version: int = 1
    is_current: bool = True

class ResumeCreate(ResumeBase):
    candidate_id: str
    file_data: str

class Resume(ResumeBase):
    id: str
    uploaded_at: datetime
    model_config = {"from_attributes": True}

class CandidateBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    current_company: Optional[str] = None
    current_title: Optional[str] = None
    experience_years: Optional[float] = None
    location: Optional[str] = None
    skills: Optional[str] = None
    stage: StageEnum = StageEnum.screening
    source: SourceEnum = SourceEnum.manual_upload
    job_posting_id: Optional[str] = None
    application_source: Optional[str] = 'manual'
    applied_via_link: bool = False
    application_date: Optional[datetime] = None

class CandidateCreate(CandidateBase):
    pass

class Candidate(CandidateBase):
    id: str
    match_score: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class JobPostingBase(BaseModel):
    title: str
    department: str
    experience_required: int
    is_active: bool = True

class JobPosting(JobPostingBase):
    id: str
    required_skills: str
    preferred_skills: str
    created_at: datetime
    model_config = {"from_attributes": True}

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: TaskPriorityEnum = TaskPriorityEnum.medium
    status: str = "pending"
    progress: int = 0
    category: Optional[str] = "general"
    candidate: Optional[str] = None
    voice_created: str = "false"
    date: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    priority: Optional[TaskPriorityEnum] = None
    status: Optional[str] = None
    progress: Optional[int] = None
    category: Optional[str] = None

class Task(TaskBase):
    id: str
    created_at: datetime
    model_config = {"from_attributes": True}

class MatchReport(BaseModel):
    overallScore: int
    skillMatchDetails: List[dict]
    experienceFit: int
    educationFit: int

class InterviewBase(BaseModel):
    candidate_id: str
    job_posting_id: str
    interview_date: datetime
    interview_time: str
    interview_type: InterviewTypeEnum = InterviewTypeEnum.technical
    status: InterviewStatusEnum = InterviewStatusEnum.scheduled
    zoom_link: Optional[str] = None
    notes: Optional[str] = None

class InterviewCreate(InterviewBase):
    pass

class InterviewUpdate(BaseModel):
    interview_date: Optional[datetime] = None
    interview_time: Optional[str] = None
    interview_type: Optional[InterviewTypeEnum] = None
    status: Optional[InterviewStatusEnum] = None
    zoom_link: Optional[str] = None
    notes: Optional[str] = None
    sentiment_score: Optional[float] = None
    match_score: Optional[int] = None

class Interview(InterviewBase):
    id: int
    sentiment_score: Optional[float] = None
    match_score: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
