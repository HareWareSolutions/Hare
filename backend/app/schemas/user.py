from pydantic import BaseModel, EmailStr
from typing import Optional, List
from app.schemas.role import Role
from app.schemas.company import Company as CompanySchema
from uuid import UUID
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    role_ids: Optional[List[UUID]] = None

class UserCreate(UserBase):
    password: str
    company_name: str
    document: str
    document_type: str = "PJ" # "PF" or "PJ"
    phone: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserInDBBase(UserBase):
    id: UUID
    company_id: Optional[UUID] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class User(UserInDBBase):
    roles: List[Role] = []
    company: Optional[CompanySchema] = None

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
