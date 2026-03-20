from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class PlanBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stripe_price_id: Optional[str] = None
    features: Optional[List[str]] = []
    is_active: bool = True

class PlanCreate(PlanBase):
    pass

class PlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stripe_price_id: Optional[str] = None
    features: Optional[List[str]] = None
    is_active: Optional[bool] = None

class PlanInDBBase(PlanBase):
    id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Plan(PlanInDBBase):
    pass
