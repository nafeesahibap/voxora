from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    email: str
    is_active: Optional[bool] = True
    is_superuser: bool = False
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: int

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str
