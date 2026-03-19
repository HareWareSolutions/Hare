from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    value: float = 0.0
    type: str = "unique"

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    value: Optional[float] = None
    type: Optional[str] = None

class ServiceInDBBase(ServiceBase):
    id: UUID
    company_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Service(ServiceInDBBase):
    pass
