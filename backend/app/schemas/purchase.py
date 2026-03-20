from pydantic import BaseModel
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime

class PurchaseItem(BaseModel):
    name: str
    price: float
    quantity: float

class PurchaseRequestBase(BaseModel):
    supplier_id: Optional[UUID] = None
    description: Optional[str] = None
    total_amount: float = 0.0
    items: Optional[List[PurchaseItem]] = None

class PurchaseRequestCreate(PurchaseRequestBase):
    pass

class PurchaseRequestUpdate(BaseModel):
    supplier_id: Optional[UUID] = None
    description: Optional[str] = None
    total_amount: Optional[float] = None
    status: Optional[str] = None # PENDING, APPROVED, REJECTED, CANCELLED
    items: Optional[List[PurchaseItem]] = None

class PurchaseRequest(PurchaseRequestBase):
    id: UUID
    company_id: UUID
    requester_id: UUID
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
