from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

class PriceHistory(Base):
    __tablename__ = "supplier_price_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False)
    product_name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    purchase_request_id = Column(UUID(as_uuid=True), ForeignKey("purchase_requests.id", ondelete="SET NULL"), nullable=True)

    supplier = relationship("Supplier", back_populates="price_histories")
    purchase_request = relationship("PurchaseRequest", back_populates="price_history_entries")
