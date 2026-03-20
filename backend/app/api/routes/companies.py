from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List

from app.api.deps import SessionDep, CurrentUser
from app.models.company import Company
from app.schemas.company import Company as CompanySchema, CompanyCreate

router = APIRouter()

@router.get("/", response_model=List[CompanySchema])
def read_companies(
    db: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retorna as empresas que o usuário tem acesso.
    """
    if current_user.is_superuser:
        companies = db.query(Company).offset(skip).limit(limit).all()
    else:
        companies = db.query(Company).filter(Company.id == current_user.company_id).offset(skip).limit(limit).all()
    return companies

@router.post("/", response_model=CompanySchema)
def create_company(
    *,
    db: SessionDep,
    current_user: CurrentUser,
    company_in: CompanyCreate,
) -> Any:
    """
    Cria uma nova empresa. Apenas superusers ou permissão específica.
    """
    company = Company(
        **company_in.model_dump()
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company
