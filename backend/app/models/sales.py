import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class SalesFunnelStage(Base):
    __tablename__ = "sales_funnel_stages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    
    name = Column(String, nullable=False)
    order = Column(Integer, default=0) # To order the kanban columns
    
    company = relationship("Company")

class SalesGoal(Base):
    __tablename__ = "sales_goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    target_value = Column(Float, nullable=False, default=0.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    company = relationship("Company")

class Sale(Base):
    __tablename__ = "sales"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False)
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id"), nullable=False)
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=True)
    
    value = Column(Float, nullable=False)
    sale_date = Column(Date, server_default=func.current_date())
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    company = relationship("Company")
    client = relationship("Client")
    service = relationship("Service")
    transaction = relationship("Transaction")
