from pydantic import BaseModel, EmailStr
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class PriceHistoryBase(BaseModel):
    product_name: str
    price: float

class PriceHistoryCreate(PriceHistoryBase):
    supplier_id: UUID
    purchase_request_id: Optional[UUID] = None

class PriceHistory(PriceHistoryBase):
    id: UUID
    supplier_id: UUID
    date: datetime
    purchase_request_id: Optional[UUID] = None

    class Config:
        from_attributes = True

class SupplierBase(BaseModel):
    name: str
    tax_id: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    tax_id: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class Supplier(SupplierBase):
    id: UUID
    company_id: UUID
    price_histories: List[PriceHistory] = []

    class Config:
        from_attributes = True
