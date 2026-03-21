from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api import api_router
from app.core.config import settings
from fastapi import Request
import logging

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="SaaS Platform with OpenClaw Integration",
    version="0.1.0",
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    # Using print for guaranteed visibility in production logs
    print(f"--- DEBUG REQUEST: {request.method} {request.url}")
    print(f"--- DEBUG ORIGIN: {request.headers.get('origin')}")
    response = await call_next(request)
    return response

# Configure CORS as the outermost middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to HareWare API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
