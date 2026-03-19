from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

class LeadBase(BaseModel):
    nome_empresa: str
    email: EmailStr
    telefone: str
    origem: str
    tags: Optional[str] = None
    status: str = "active"

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    nome_empresa: Optional[str] = None
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    origem: Optional[str] = None
    tags: Optional[str] = None
    status: Optional[str] = None
    stage_id: Optional[UUID] = None

class LeadResponse(LeadBase):
    id: UUID
    company_id: Optional[UUID] = None
    stage_id: Optional[UUID] = None
    data_criacao: datetime

    class Config:
        from_attributes = True
