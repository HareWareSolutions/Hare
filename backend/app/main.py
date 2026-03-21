from fastapi import FastAPI, Request
from app.api.api import api_router
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="SaaS Platform with OpenClaw Integration",
    version="0.1.0",
)

# CORS is handled by Apache reverse proxy.
# DO NOT add CORSMiddleware here - it would duplicate the headers and cause browser errors.

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"--- DEBUG REQUEST: {request.method} {request.url}")
    print(f"--- DEBUG ORIGIN: {request.headers.get('origin')}")
    response = await call_next(request)
    return response

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to HareWare API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
