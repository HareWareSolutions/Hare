from sqlalchemy import Column, String, DateTime, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
import uuid
from datetime import datetime

# Association table for Document <-> Role access control
document_roles = Table(
    "document_roles",
    Base.metadata,
    Column("document_id", UUID(as_uuid=True), ForeignKey("documents.id"), primary_key=True),
    Column("role_id", UUID(as_uuid=True), ForeignKey("roles.id"), primary_key=True),
)

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    file_path = Column(String, nullable=False) # Storage path or URL
    content_type = Column(String, nullable=False) # mime type
    written_at = Column(DateTime, default=datetime.utcnow)
    author_name = Column(String, nullable=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    valid_until = Column(DateTime, nullable=True)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    company = relationship("Company")
    author = relationship("User")
    client = relationship("Client")
    accessible_roles = relationship("Role", secondary=document_roles, backref="documents")
