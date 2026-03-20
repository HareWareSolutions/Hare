from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List, Annotated
from uuid import UUID

from app.api.deps import SessionDep, CurrentUser
from app.models.company import Company as CompanyModel
from app.models.user import User
from app.models.plan import Plan
from app.models.client import Client
from app.models.service import Service
from app.schemas.company import Company as CompanySchema, CompanyModulesUpdate
from app.schemas.plan import Plan as PlanSchema, PlanCreate, PlanUpdate

router = APIRouter()

def get_superuser(current_user: CurrentUser):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="The user doesn't have enough privileges")
    return current_user

SuperUserDep = Annotated[User, Depends(get_superuser)]

@router.get("/companies", response_model=List[CompanySchema])
def read_all_companies(
    db: SessionDep,
    _superuser: SuperUserDep,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    companies = db.query(CompanyModel).offset(skip).limit(limit).all()
    for company in companies:
        company.users_count = db.query(User).filter(User.company_id == company.id).count()
    return companies

@router.post("/block-company/{company_id}")
def block_company(
    company_id: UUID,
    db: SessionDep,
    _superuser: SuperUserDep,
) -> Any:
    company = db.query(CompanyModel).filter(CompanyModel.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    company.is_active = False
    db.add(company)
    db.commit()
    return {"message": "Company blocked successfully"}

@router.post("/unblock-company/{company_id}")
def unblock_company(
    company_id: UUID,
    db: SessionDep,
    _superuser: SuperUserDep,
) -> Any:
    company = db.query(CompanyModel).filter(CompanyModel.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    company.is_active = True
    db.add(company)
    db.commit()
    return {"message": "Company unblocked successfully"}

@router.delete("/companies/{company_id}")
def delete_company(
    company_id: UUID,
    db: SessionDep,
    _superuser: SuperUserDep,
) -> Any:
    company = db.query(CompanyModel).filter(CompanyModel.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Manually delete related records in order to avoid foreign key constraints
    from app.models.request import Request
    from app.models.role import Role
    from app.models.support import SupportRequest
    from app.models.sales import Sale, SalesGoal, SalesFunnelStage
    from app.models.assignment import Sector, Ticket, Task
    from app.models.transaction import Transaction
    from app.models.lead import Lead
    from app.models.supplier import Supplier
    from app.models.document import Document

    # 1. Requests and Support
    db.query(Request).filter(Request.company_id == company_id).delete()
    db.query(SupportRequest).filter(SupportRequest.company_id == company_id).delete()
    
    # 2. Sales and Finance
    db.query(Sale).filter(Sale.company_id == company_id).delete()
    db.query(SalesGoal).filter(SalesGoal.company_id == company_id).delete()
    db.query(SalesFunnelStage).filter(SalesFunnelStage.company_id == company_id).delete()
    db.query(Transaction).filter(Transaction.company_id == company_id).delete()
    
    # 3. Assignments (Tasks -> Tickets -> Sectors)
    ticket_ids = [t.id for t in db.query(Ticket).filter(Ticket.company_id == company_id).all()]
    if ticket_ids:
        db.query(Task).filter(Task.ticket_id.in_(ticket_ids)).delete(synchronize_session=False)
    db.query(Ticket).filter(Ticket.company_id == company_id).delete()
    db.query(Sector).filter(Sector.company_id == company_id).delete()
    
    # 4. CRM and Ops
    db.query(Lead).filter(Lead.company_id == company_id).delete()
    db.query(Supplier).filter(Supplier.company_id == company_id).delete()
    db.query(Document).filter(Document.company_id == company_id).delete()
    
    # 5. Core
    # First, handle the many-to-many relationship in user_roles
    from app.models.user_role import user_roles
    user_ids = [u.id for u in db.query(User).filter(User.company_id == company_id).all()]
    if user_ids:
        db.execute(user_roles.delete().where(user_roles.c.user_id.in_(user_ids)))
    
    db.query(Role).filter(Role.company_id == company_id).delete()
    db.query(User).filter(User.company_id == company_id).delete()
    db.query(Client).filter(Client.company_id == company_id).delete()
    db.query(Service).filter(Service.company_id == company_id).delete()
    
    db.delete(company)
    db.commit()
    return {"message": "Company and all its data deleted successfully"}

@router.put("/companies/{company_id}/modules", response_model=CompanySchema)
def update_company_modules(
    *,
    db: SessionDep,
    current_user: CurrentUser,
    company_id: UUID,
    modules_in: CompanyModulesUpdate,
) -> Any:
    """
    Update company modules (Superadmin only).
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    company = db.query(CompanyModel).filter(CompanyModel.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    company.modules = modules_in.modules
    db.add(company)
    db.commit()
    db.refresh(company)
    return company

@router.get("/plans", response_model=List[PlanSchema])
def read_all_plans(
    db: SessionDep,
    _superuser: SuperUserDep,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    plans = db.query(Plan).offset(skip).limit(limit).all()
    return plans

@router.post("/plans", response_model=PlanSchema, status_code=201)
def create_plan(
    *,
    db: SessionDep,
    _superuser: SuperUserDep,
    plan_in: PlanCreate,
) -> Any:
    plan = Plan(**plan_in.model_dump())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan

@router.put("/plans/{plan_id}", response_model=PlanSchema)
def update_plan(
    *,
    db: SessionDep,
    _superuser: SuperUserDep,
    plan_id: UUID,
    plan_in: PlanUpdate,
) -> Any:
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    update_data = plan_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(plan, field, value)
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan
