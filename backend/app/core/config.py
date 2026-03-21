import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "HareWare API"
    API_V1_STR: str = "/api/v1"
    
    JWT_SECRET: str = os.getenv("JWT_SECRET", "supersecretkey_change_in_production")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:postgres@172.18.0.1:5433/hareware")
    
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "https://hareware.com.br")
    DOMAIN: str = os.getenv("DOMAIN", "hareware.com.br")
    SUPERADMIN_EMAIL: str = "giordano@hareware.com.br"

    class Config:
        env_file = ".env"

settings = Settings()
