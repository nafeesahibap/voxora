from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

from app.config import settings
from app.api.v1.api_router import api_router
from app.core.events import create_start_app_handler, create_stop_app_handler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_application() -> FastAPI:
    application = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url=f"{settings.API_V1_STR}/docs",
    )

    if settings.BACKEND_CORS_ORIGINS:
        application.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    application.add_event_handler("startup", create_start_app_handler(application))
    application.add_event_handler("shutdown", create_stop_app_handler(application))

    application.include_router(api_router, prefix=settings.API_V1_STR)

    from fastapi.staticfiles import StaticFiles
    import os
    
    # Mount frontend static files
    frontend_path = os.path.abspath("frontend")
    if os.path.exists(frontend_path):
        application.mount("/static", StaticFiles(directory=frontend_path), name="static")
        
        from fastapi.responses import FileResponse
        @application.get("/hr/{path:path}")
        async def serve_spa(path: str):
            return FileResponse(os.path.join(frontend_path, "dashboard-hr.html"))
            
        @application.get("/apply")
        async def serve_apply():
            return FileResponse(os.path.join(frontend_path, "dashboard-hr.html"))

        application.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")

    return application

app = get_application()

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
