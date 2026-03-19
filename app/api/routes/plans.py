from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List

from app.api.deps import SessionDep
from app.models.plan import Plan
from app.schemas.plan import Plan as PlanSchema

router = APIRouter()

@router.get("/", response_model=List[PlanSchema])
def read_active_plans(
    db: SessionDep,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve active plans. Visível para o público/onboarding.
    """
    plans = db.query(Plan).filter(Plan.is_active == True).offset(skip).limit(limit).all()
    return plans
