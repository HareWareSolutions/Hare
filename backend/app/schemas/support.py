from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from app.schemas.client import Client
from app.schemas.service import Service
from app.schemas.user import UserInDBBase

class SupportRequestBase(BaseModel):
    client_id: UUID
    service_id: Optional[UUID] = None
    responsible_id: UUID
    solicitation: str
    gravity: int = 3
    urgency: int = 3
    tendency: int = 3

class SupportRequestCreate(SupportRequestBase):
    pass

class SupportRequestUpdate(BaseModel):
    client_id: Optional[UUID] = None
    service_id: Optional[UUID] = None
    responsible_id: Optional[UUID] = None
    solicitation: Optional[str] = None
    gravity: Optional[int] = None
    urgency: Optional[int] = None
    tendency: Optional[int] = None

class SupportRequest(SupportRequestBase):
    id: UUID
    company_id: UUID
    gut_score: int
    is_converted: bool
    ticket_id: Optional[UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Nested relations for display
    client: Optional[Client] = None
    service: Optional[Service] = None
    responsible: Optional[UserInDBBase] = None

    class Config:
        from_attributes = True

class SupportConvertToTicket(BaseModel):
    sector_id: UUID
