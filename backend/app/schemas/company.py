from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class CompanyBase(BaseModel):
    name: str

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(CompanyBase):
    pass

class CompanyModulesUpdate(BaseModel):
    modules: List[str]


class CompanyInDBBase(CompanyBase):
    id: UUID
    subscription_status: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    users_count: Optional[int] = None
    modules: Optional[List[str]] = []

    class Config:
        from_attributes = True

class Company(CompanyInDBBase):
    pass
