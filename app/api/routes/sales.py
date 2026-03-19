from fastapi import APIRouter, HTTPException, status, Depends
from typing import Any, List, Optional
from app.api.deps import SessionDep, ActiveCompanyDep, CurrentUser
from app.models.sales import SalesFunnelStage, SalesGoal, Sale
from app.models.lead import Lead
from app.models.transaction import Transaction
from app.models.service import Service
from app.schemas.sales import (
    SalesFunnelStage as StageSchema, SalesFunnelStageCreate, SalesFunnelStageUpdate,
    SalesGoal as GoalSchema, SalesGoalCreate,
    Sale as SaleSchema, SaleCreate,
    LeadUpdateStage
)
from app.schemas.lead import LeadResponse, LeadCreate, LeadUpdate
from sqlalchemy.orm import joinedload
from sqlalchemy import func
from datetime import date, datetime
from uuid import UUID

router = APIRouter()

# --- Goals ---
@router.get("/goals/current", response_model=Optional[GoalSchema])
def get_current_goal(db: SessionDep, company: ActiveCompanyDep) -> Any:
    today = date.today()
    return db.query(SalesGoal).filter(
        SalesGoal.company_id == company.id,
        SalesGoal.month == today.month,
        SalesGoal.year == today.year
    ).first()

@router.post("/goals/", response_model=GoalSchema)
def create_or_update_goal(
    *, db: SessionDep, company: ActiveCompanyDep, goal_in: SalesGoalCreate
) -> Any:
    goal = db.query(SalesGoal).filter(
        SalesGoal.company_id == company.id,
        SalesGoal.month == goal_in.month,
        SalesGoal.year == goal_in.year
    ).first()
    
    if goal:
        goal.target_value = goal_in.target_value
    else:
        goal = SalesGoal(**goal_in.model_dump(), company_id=company.id)
        db.add(goal)
    
    db.commit()
    db.refresh(goal)
    return goal

# --- Sales ---
@router.get("/sales/", response_model=List[SaleSchema])
def list_sales(db: SessionDep, company: ActiveCompanyDep) -> Any:
    return db.query(Sale).options(
        joinedload(Sale.client),
        joinedload(Sale.service)
    ).filter(Sale.company_id == company.id).all()

@router.post("/sales/", response_model=SaleSchema)
def create_sale(
    *, db: SessionDep, company: ActiveCompanyDep, sale_in: SaleCreate
) -> Any:
    # 1. Get service for description
    service = db.query(Service).filter(Service.id == sale_in.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")

    # 2. Create Transaction
    transaction = Transaction(
        company_id=company.id,
        type="income",
        description=f"Venda: {service.name}",
        amount=sale_in.value,
        is_paid=True,
        paid_at=datetime.utcnow(),
        due_date=date.today(),
        service_id=sale_in.service_id,
        client_id=sale_in.client_id
    )
    db.add(transaction)
    db.flush()

    # 3. Create Sale
    sale = Sale(
        **sale_in.model_dump(),
        company_id=company.id,
        transaction_id=transaction.id
    )
    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale

# --- Funnel Stages ---
@router.get("/funnel/stages", response_model=List[StageSchema])
def list_stages(db: SessionDep, company: ActiveCompanyDep) -> Any:
    stages = db.query(SalesFunnelStage).filter(SalesFunnelStage.company_id == company.id).order_by(SalesFunnelStage.order).all()
    
    # If no stages, create default ones
    if not stages:
        default_stages = ["Lead", "Contato", "Proposta", "Negociação", "Fechado"]
        for i, name in enumerate(default_stages):
            stage = SalesFunnelStage(name=name, order=i, company_id=company.id)
            db.add(stage)
        db.commit()
        stages = db.query(SalesFunnelStage).filter(SalesFunnelStage.company_id == company.id).order_by(SalesFunnelStage.order).all()
    
    return stages

@router.post("/funnel/stages", response_model=StageSchema)
def create_stage(
    *, db: SessionDep, company: ActiveCompanyDep, stage_in: SalesFunnelStageCreate
) -> Any:
    stage = SalesFunnelStage(**stage_in.model_dump(), company_id=company.id)
    db.add(stage)
    db.commit()
    db.refresh(stage)
    return stage

# --- Leads (Funnel) ---
@router.get("/funnel/leads", response_model=List[LeadResponse])
def list_leads(db: SessionDep, company: ActiveCompanyDep) -> Any:
    return db.query(Lead).filter(Lead.company_id == company.id).all()

@router.post("/funnel/leads", response_model=LeadResponse)
def create_lead(
    *, db: SessionDep, company: ActiveCompanyDep, lead_in: LeadCreate
) -> Any:
    lead = Lead(**lead_in.model_dump(), company_id=company.id)
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead

@router.patch("/funnel/leads/{id}/stage", response_model=LeadResponse)
def update_lead_stage(
    *, db: SessionDep, company: ActiveCompanyDep, id: UUID, stage_in: LeadUpdateStage
) -> Any:
    lead = db.query(Lead).filter(Lead.id == id, Lead.company_id == company.id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead não encontrado")
    
    lead.stage_id = stage_in.stage_id
    db.commit()
    db.refresh(lead)
    return lead

@router.patch("/funnel/leads/{id}", response_model=LeadResponse)
def update_lead(
    *, db: SessionDep, company: ActiveCompanyDep, id: UUID, lead_in: LeadUpdate
) -> Any:
    lead = db.query(Lead).filter(Lead.id == id, Lead.company_id == company.id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead não encontrado")
    
    update_data = lead_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lead, field, value)
    
    db.commit()
    db.refresh(lead)
    return lead
