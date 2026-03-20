from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    name = Column(String, nullable=False)
    tax_id = Column(String, nullable=True) # CNPJ/CPF
    contact_email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)

    company = relationship("Company", back_populates="suppliers")
    price_histories = relationship("PriceHistory", back_populates="supplier", cascade="all, delete-orphan")
    purchase_requests = relationship("PurchaseRequest", back_populates="supplier")
