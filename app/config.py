from typing import List, Union
from pydantic import AnyHttpUrl, PostgresDsn, validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Voxora"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
    
    # Database
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    DATABASE_URL: Union[PostgresDsn, str]

    @validator("DATABASE_URL", pre=True)
    def assemble_db_connection(cls, v: str | None, values: dict[str, any]) -> any:
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme="postgresql",
            user=values.get("POSTGRES_USER"),
            password=values.get("POSTGRES_PASSWORD"),
            host=values.get("POSTGRES_SERVER"),
            path=f"/{values.get('POSTGRES_DB') or ''}",
        )

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

    # Amadeus Travel API
    AMADEUS_CLIENT_ID: str = ""
    AMADEUS_CLIENT_SECRET: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_case_sensitive=True)

settings = Settings()
