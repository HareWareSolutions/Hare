import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Boolean, Date, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.database import Base
import enum

class TransactionType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    
    type = Column(String, nullable=False) # income / expense
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    
    is_paid = Column(Boolean, default=False)
    payment_method = Column(String, nullable=True) # dinheiro, pix, crédito, débito, boleto
    invoice_issued = Column(Boolean, default=False)
    
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id"), nullable=True)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=True)
    
    due_date = Column(Date, nullable=False)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    
    # Recurrence support
    recurrence_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
