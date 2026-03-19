from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List, Optional
from enum import Enum

class TaskStatus(str, Enum):
    EM_ESPERA = "Em espera"
    PLANEJAMENTO = "Planejamento"
    EXECUCAO = "Execução"
    QUALIDADE = "Controle de Qualidade"
    FINALIZADA = "Finalizada"

# Sector
class SectorBase(BaseModel):
    name: str

class SectorCreate(SectorBase):
    pass

class Sector(SectorBase):
    id: UUID
    company_id: UUID

    class Config:
        from_attributes = True

# Task
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: UUID
    status: TaskStatus = TaskStatus.EM_ESPERA
    impact: Optional[int] = 5
    confidence: Optional[int] = 5
    effort: Optional[int] = 5

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[UUID] = None
    status: Optional[TaskStatus] = None
    impact: Optional[int] = None
    confidence: Optional[int] = None
    effort: Optional[int] = None
    completed_at: Optional[datetime] = None

class UserSimple(BaseModel):
    id: UUID
    full_name: Optional[str]
    email: str

class Task(TaskBase):
    id: UUID
    ticket_id: UUID
    ice_score: Optional[int] = 25
    created_at: datetime
    updated_at: Optional[datetime]
    completed_at: Optional[datetime]
    assignee: Optional[UserSimple]

    class Config:
        from_attributes = True

# Ticket
class TicketBase(BaseModel):
    title: str
    description: Optional[str] = None
    sector_id: UUID

class TicketCreate(TicketBase):
    tasks: List[TaskCreate] = []

class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    sector_id: Optional[UUID] = None

class Ticket(TicketBase):
    id: UUID
    company_id: UUID
    created_by: UUID
    created_at: datetime
    updated_at: Optional[datetime]
    tasks: List[Task] = []
    
    class Config:
        from_attributes = True

# Analytics
class UserWorkload(BaseModel):
    user_id: UUID
    user_name: str
    total_tasks: int
    completed_tasks: int
    avg_completion_time: Optional[float] # In hours

class AssignmentAnalytics(BaseModel):
    total_tickets: int
    total_tasks: int
    tasks_by_status: dict
    user_workloads: List[UserWorkload]
