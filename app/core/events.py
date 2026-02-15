from typing import Callable
from fastapi import FastAPI
import logging

logger = logging.getLogger(__name__)

def create_start_app_handler(app: FastAPI) -> Callable:
    async def start_app() -> None:
        logger.info("Starting up application...")
        
        # Initialize DB
        from app.database.session import engine
        from app.database.base import Base
        from app import models  # Register models
        
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created.")

        # TODO: Load ML models
        logger.info("Application startup complete.")
    return start_app

def create_stop_app_handler(app: FastAPI) -> Callable:
    async def stop_app() -> None:
        logger.info("Shutting down application...")
        # TODO: Close DB connection
        logger.info("Application shutdown complete.")
    return stop_app
