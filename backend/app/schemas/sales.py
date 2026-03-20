from pydantic import BaseModel
from uuid import UUID
from datetime import datetime, date
from typing import Optional, List
from app.schemas.client import Client
from app.schemas.service import Service

class SalesFunnelStageBase(BaseModel):
    name: str
    order: int = 0

class SalesFunnelStageCreate(SalesFunnelStageBase):
    pass

class SalesFunnelStageUpdate(BaseModel):
    name: Optional[str] = None
    order: Optional[int] = None

class SalesFunnelStage(SalesFunnelStageBase):
    id: UUID
    company_id: UUID

    class Config:
        from_attributes = True

class SalesGoalBase(BaseModel):
    month: int
    year: int
    target_value: float = 0.0

class SalesGoalCreate(SalesGoalBase):
    pass

class SalesGoal(SalesGoalBase):
    id: UUID
    company_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SaleBase(BaseModel):
    client_id: UUID
    service_id: UUID
    value: float
    sale_date: date = date.today()

class SaleCreate(SaleBase):
    pass

class Sale(SaleBase):
    id: UUID
    company_id: UUID
    transaction_id: Optional[UUID] = None
    created_at: datetime
    
    client: Optional[Client] = None
    service: Optional[Service] = None

    class Config:
        from_attributes = True

class LeadUpdateStage(BaseModel):
    stage_id: UUID
