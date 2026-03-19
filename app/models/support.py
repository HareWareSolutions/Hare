import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class SupportRequest(Base):
    __tablename__ = "support_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False)
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id"), nullable=True)
    responsible_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    solicitation = Column(String, nullable=False)
    
    # GUT Matrix (1-5)
    gravity = Column(Integer, default=3)
    urgency = Column(Integer, default=3)
    tendency = Column(Integer, default=3)
    gut_score = Column(Integer, default=27) # gravity * urgency * tendency
    
    is_converted = Column(Boolean, default=False)
    ticket_id = Column(UUID(as_uuid=True), ForeignKey("tickets.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    company = relationship("Company")
    client = relationship("Client")
    service = relationship("Service")
    responsible = relationship("User", foreign_keys=[responsible_id])
    ticket = relationship("Ticket", backref="support_request")
