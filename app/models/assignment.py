import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, func, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum

class TaskStatus(str, enum.Enum):
    EM_ESPERA = "Em espera"
    PLANEJAMENTO = "Planejamento"
    EXECUCAO = "Execução"
    QUALIDADE = "Controle de Qualidade"
    FINALIZADA = "Finalizada"

class Sector(Base):
    __tablename__ = "sectors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    
    company = relationship("Company", backref="sectors")
    tickets = relationship("Ticket", back_populates="sector", cascade="all, delete-orphan")

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    
    sector_id = Column(UUID(as_uuid=True), ForeignKey("sectors.id"), nullable=False)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    sector = relationship("Sector", back_populates="tickets")
    company = relationship("Company", backref="tickets")
    creator = relationship("User", backref="created_tickets")
    tasks = relationship("Task", back_populates="ticket", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    ticket_id = Column(UUID(as_uuid=True), ForeignKey("tickets.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(Enum(TaskStatus), default=TaskStatus.EM_ESPERA, nullable=False)
    
    # ICE Score fields (1-10)
    impact = Column(Integer, default=5)
    confidence = Column(Integer, default=5)
    effort = Column(Integer, default=5)
    ice_score = Column(Integer, default=25) # (Impact * Confidence) / Effort or simply I*C*E if effort is Ease
    # Let's use Impact * Confidence * (11 - Effort) to represent priority
    
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    ticket = relationship("Ticket", back_populates="tasks")
    assignee = relationship("User", backref="assigned_tasks")
