from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class CompanyBase(BaseModel):
    name: str

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(CompanyBase):
    pass

class CompanyInDBBase(CompanyBase):
    id: UUID
    subscription_status: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    users_count: Optional[int] = None

    class Config:
        from_attributes = True

class Company(CompanyInDBBase):
    pass
