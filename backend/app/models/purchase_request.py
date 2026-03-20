from sqlalchemy import Column, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

class PurchaseRequest(Base):
    __tablename__ = "purchase_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    requester_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("suppliers.id"), nullable=True)
    description = Column(String, nullable=True)
    total_amount = Column(Float, nullable=False, default=0.0)
    status = Column(String, default="PENDING") # PENDING, APPROVED, REJECTED, CANCELLED
    items = Column(JSON, nullable=True) # List of dictionaries {name, price, quantity}
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    company = relationship("Company")
    requester = relationship("User")
    supplier = relationship("Supplier", back_populates="purchase_requests")
    price_history_entries = relationship("PriceHistory", back_populates="purchase_request")
