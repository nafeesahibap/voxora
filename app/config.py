from typing import List, Union, Optional, Any
from pydantic import AnyHttpUrl, PostgresDsn, field_validator, ValidationInfo
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Voxora"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
    
    # Database
    POSTGRES_SERVER: Optional[str] = None
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
    DATABASE_URL: Optional[str] = None

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Optional[str], info: ValidationInfo) -> Any:
        if v:
            return v
        
        values = info.data
        server = values.get("POSTGRES_SERVER")
        if not server:
            return "sqlite:///./voxora.db"
            
        return f"postgresql://{values.get('POSTGRES_USER')}:{values.get('POSTGRES_PASSWORD')}@{server}/{values.get('POSTGRES_DB') or ''}"

    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    # ML Models
    MODEL_PATH: str = "data/models"

    # Keys
    OPENAI_API_KEY: str = ""
    HUGGINGFACE_API_KEY: str = ""

    class Config:
        env_case_sensitive = True
        env_file = ".env"

settings = Settings()
