from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List, Annotated
from uuid import UUID

from app.api.deps import SessionDep, CurrentUser
from app.models.company import Company
from app.models.user import User
from app.models.plan import Plan
from app.models.client import Client
from app.models.service import Service
from app.schemas.company import Company as CompanySchema
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
    companies = db.query(Company).offset(skip).limit(limit).all()
    for company in companies:
        company.users_count = db.query(User).filter(User.company_id == company.id).count()
    return companies

@router.post("/block-company/{company_id}")
def block_company(
    company_id: UUID,
    db: SessionDep,
    _superuser: SuperUserDep,
) -> Any:
    company = db.query(Company).filter(Company.id == company_id).first()
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
    company = db.query(Company).filter(Company.id == company_id).first()
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
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Manually delete related records first due to lack of cascade in models
    db.query(User).filter(User.company_id == company_id).delete()
    db.query(Client).filter(Client.company_id == company_id).delete()
    db.query(Service).filter(Service.company_id == company_id).delete()
    
    db.delete(company)
    db.commit()
    return {"message": "Company and all its data deleted successfully"}

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
