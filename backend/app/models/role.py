import uuid
from sqlalchemy import Column, String, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.database import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=True, index=True)
    
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    
    # List of permission strings: ["finance.*", "users.read", etc.]
    permissions = Column(JSONB, default=[], nullable=False)
    
    is_system = Column(Boolean, default=False) # True for Admin, Manager Financeiro, etc.
