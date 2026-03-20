import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base

class Lead(Base):
    __tablename__ = "leads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=True, index=True) # Nullable for legacy
    stage_id = Column(UUID(as_uuid=True), ForeignKey("sales_funnel_stages.id"), nullable=True)
    
    nome_empresa = Column(String, nullable=False)
    email = Column(String, nullable=False)
    telefone = Column(String, nullable=False)
    origem = Column(String, nullable=False)
    tags = Column(String, nullable=True)
    
    status = Column(String, default="active") # active, lost, won

    data_criacao = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company")
    stage = relationship("SalesFunnelStage")
