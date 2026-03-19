from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date

class TransactionBase(BaseModel):
    type: str # income / expense
    description: str
    amount: float
    is_paid: bool = False
    payment_method: Optional[str] = None
    invoice_issued: bool = False
    service_id: Optional[UUID] = None
    client_id: Optional[UUID] = None
    due_date: date
    paid_at: Optional[datetime] = None
    recurrence_id: Optional[UUID] = None

class TransactionCreate(TransactionBase):
    # Additional fields for recurrence generation
    generate_future: bool = False
    recurrence_period: Optional[str] = None # months, weeks, days
    recurrence_interval: Optional[int] = 1
    recurrence_duration: Optional[int] = None # e.g., 6 months

class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    is_paid: Optional[bool] = None
    payment_method: Optional[str] = None
    invoice_issued: Optional[bool] = None
    due_date: Optional[date] = None
    paid_at: Optional[datetime] = None

class Transaction(TransactionBase):
    id: UUID
    company_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
