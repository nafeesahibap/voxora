from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from .models import StageEnum, SourceEnum, FileTypeEnum, SkillCategoryEnum

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

class MatchReport(BaseModel):
    overallScore: int
    skillMatchDetails: List[dict]
    experienceFit: int
    educationFit: int
