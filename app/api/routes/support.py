from fastapi import APIRouter, HTTPException, status, Depends
from typing import Any, List, Optional
from app.api.deps import SessionDep, ActiveCompanyDep, CurrentUser
from app.models.support import SupportRequest
from app.models.assignment import Ticket, Task, TaskStatus
from app.schemas.support import SupportRequest as SupportSchema, SupportRequestCreate, SupportRequestUpdate, SupportConvertToTicket
from sqlalchemy.orm import joinedload
from uuid import UUID

router = APIRouter()

@router.get("/", response_model=List[SupportSchema])
def list_supports(
    db: SessionDep,
    company: ActiveCompanyDep,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    return db.query(SupportRequest).options(
        joinedload(SupportRequest.client),
        joinedload(SupportRequest.service),
        joinedload(SupportRequest.responsible)
    ).filter(SupportRequest.company_id == company.id).offset(skip).limit(limit).all()

@router.post("/", response_model=SupportSchema)
def create_support(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    support_in: SupportRequestCreate,
) -> Any:
    gut_score = support_in.gravity * support_in.urgency * support_in.tendency
    support = SupportRequest(
        **support_in.model_dump(),
        company_id=company.id,
        gut_score=gut_score
    )
    db.add(support)
    db.commit()
    db.refresh(support)
    return support

@router.post("/{id}/convert", response_model=SupportSchema)
def convert_to_ticket(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    user: CurrentUser,
    id: UUID,
    convert_in: SupportConvertToTicket,
) -> Any:
    support = db.query(SupportRequest).filter(SupportRequest.id == id, SupportRequest.company_id == company.id).first()
    if not support:
        raise HTTPException(status_code=404, detail="Suporte não encontrado")
    if support.is_converted:
        raise HTTPException(status_code=400, detail="Este suporte já foi convertido em ticket")

    # Create Ticket
    ticket = Ticket(
        title=f"Suporte: {support.solicitation[:50]}...",
        description=f"Solicitação original: {support.solicitation}\nGravidade: {support.gravity}\nUrgência: {support.urgency}\nTendência: {support.tendency}",
        sector_id=convert_in.sector_id,
        company_id=company.id,
        created_by=user.id
    )
    db.add(ticket)
    db.flush()

    # Create initial Task
    task = Task(
        ticket_id=ticket.id,
        title="Resolver solicitação de suporte",
        description=support.solicitation,
        assigned_to=support.responsible_id,
        status="Em espera",
        impact=support.gravity * 2, # GUT 1-5 maps roughly to ICE 1-10
        confidence=support.urgency * 2,
        effort=support.tendency * 2
    )
    task.ice_score = task.impact * task.confidence * (11 - task.effort)
    db.add(task)

    # Update Support
    support.is_converted = True
    support.ticket_id = ticket.id
    
    db.commit()
    db.refresh(support)
    return support
