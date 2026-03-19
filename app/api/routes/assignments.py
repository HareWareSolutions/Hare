from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Any, List, Optional
from app.api.deps import SessionDep, ActiveCompanyDep, CurrentUser
from app.models.assignment import Sector, Ticket, Task, TaskStatus
from app.models.user import User
from app.schemas.assignment import (
    Sector as SectorSchema, SectorCreate,
    Ticket as TicketSchema, TicketCreate, TicketUpdate,
    Task as TaskSchema, TaskCreate, TaskUpdate,
    AssignmentAnalytics, UserWorkload
)
from sqlalchemy import func
from uuid import UUID
from datetime import datetime

router = APIRouter()

# --- SECTORS ---

@router.get("/sectors/", response_model=List[SectorSchema])
def list_sectors(
    db: SessionDep,
    company: ActiveCompanyDep,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return db.query(Sector).filter(Sector.company_id == company.id).offset(skip).limit(limit).all()

@router.post("/sectors/", response_model=SectorSchema)
def create_sector(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    sector_in: SectorCreate,
) -> Any:
    sector = Sector(name=sector_in.name, company_id=company.id)
    db.add(sector)
    db.commit()
    db.refresh(sector)
    return sector

# --- TICKETS ---

@router.get("/tickets/", response_model=List[TicketSchema])
def list_tickets(
    db: SessionDep,
    company: ActiveCompanyDep,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return db.query(Ticket).filter(Ticket.company_id == company.id).offset(skip).limit(limit).all()

@router.post("/tickets/", response_model=TicketSchema)
def create_ticket(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    user: CurrentUser,
    ticket_in: TicketCreate,
) -> Any:
    ticket = Ticket(
        title=ticket_in.title,
        description=ticket_in.description,
        sector_id=ticket_in.sector_id,
        company_id=company.id,
        created_by=user.id
    )
    db.add(ticket)
    db.flush()

    for task_in in ticket_in.tasks:
        ice_score = task_in.impact * task_in.confidence * (11 - task_in.effort)
        task = Task(
            ticket_id=ticket.id,
            title=task_in.title,
            description=task_in.description,
            assigned_to=task_in.assigned_to,
            status=task_in.status,
            impact=task_in.impact,
            confidence=task_in.confidence,
            effort=task_in.effort,
            ice_score=ice_score
        )
        db.add(task)
    
    db.commit()
    db.refresh(ticket)
    return ticket

@router.post("/tasks/", response_model=TaskSchema)
def create_task(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    task_in: TaskCreate,
    ticket_id: UUID = Query(...),
) -> Any:
    # Verify ticket belongs to company
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id, Ticket.company_id == company.id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ice_score = task_in.impact * task_in.confidence * (11 - task_in.effort)
    task = Task(
        ticket_id=ticket_id,
        title=task_in.title,
        description=task_in.description,
        assigned_to=task_in.assigned_to,
        status=task_in.status,
        impact=task_in.impact,
        confidence=task_in.confidence,
        effort=task_in.effort,
        ice_score=ice_score
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

# --- TASKS ---

@router.patch("/tasks/{id}", response_model=TaskSchema)
def update_task(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    id: UUID,
    task_in: TaskUpdate,
) -> Any:
    task = db.query(Task).join(Ticket).filter(Task.id == id, Ticket.company_id == company.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    # Re-calculate ICE if any component changed
    if any(k in update_data for k in ["impact", "confidence", "effort"]):
        task.ice_score = task.impact * task.confidence * (11 - task.effort)

    if "status" in update_data and update_data["status"] == TaskStatus.FINALIZADA and not task.completed_at:
        task.completed_at = datetime.now()
    
    db.commit()
    db.refresh(task)
    return task

# --- ANALYTICS ---

@router.get("/analytics", response_model=AssignmentAnalytics)
def get_analytics(
    db: SessionDep,
    company: ActiveCompanyDep,
) -> Any:
    total_tickets = db.query(Ticket).filter(Ticket.company_id == company.id).count()
    
    tasks_query = db.query(Task).join(Ticket).filter(Ticket.company_id == company.id)
    total_tasks = tasks_query.count()
    
    status_counts = db.query(Task.status, func.count(Task.id))\
        .join(Ticket).filter(Ticket.company_id == company.id)\
        .group_by(Task.status).all()
    
    tasks_by_status = {s.value: count for s, count in status_counts}
    # Ensure all statuses exist in dict
    for s in TaskStatus:
        if s.value not in tasks_by_status:
            tasks_by_status[s.value] = 0

    # User workloads
    users = db.query(User).filter(User.company_id == company.id).all()
    user_workloads = []
    
    for user in users:
        u_tasks = db.query(Task).filter(Task.assigned_to == user.id).all()
        completed = [t for t in u_tasks if t.status == TaskStatus.FINALIZADA]
        
        avg_time = None
        if completed:
            times = []
            for t in completed:
                if t.completed_at and t.created_at:
                    diff = (t.completed_at - t.created_at).total_seconds() / 3600
                    times.append(diff)
            if times:
                avg_time = sum(times) / len(times)

        user_workloads.append(UserWorkload(
            user_id=user.id,
            user_name=user.full_name or user.email,
            total_tasks=len(u_tasks),
            completed_tasks=len(completed),
            avg_completion_time=avg_time
        ))

    return AssignmentAnalytics(
        total_tickets=total_tickets,
        total_tasks=total_tasks,
        tasks_by_status=tasks_by_status,
        user_workloads=user_workloads
    )
