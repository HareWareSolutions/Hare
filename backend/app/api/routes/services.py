from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List

from uuid import UUID
from app.api.deps import SessionDep, ActiveCompanyDep
from app.models.service import Service
from app.schemas.service import Service as ServiceSchema, ServiceCreate, ServiceUpdate

router = APIRouter()

@router.get("/", response_model=List[ServiceSchema])
def read_services(
    db: SessionDep,
    company: ActiveCompanyDep,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    services = db.query(Service).filter(Service.company_id == company.id).offset(skip).limit(limit).all()
    return services

@router.post("/", response_model=ServiceSchema)
def create_service(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    service_in: ServiceCreate,
) -> Any:
    service = Service(
        company_id=company.id,
        **service_in.model_dump()
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    return service

@router.put("/{id}", response_model=ServiceSchema)
def update_service(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    id: UUID,
    service_in: ServiceUpdate,
) -> Any:
    service = db.query(Service).filter(Service.id == id, Service.company_id == company.id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
        
    update_data = service_in.model_dump(exclude_unset=True)
    for field in update_data:
        setattr(service, field, update_data[field])
        
    db.add(service)
    db.commit()
    db.refresh(service)
    return service

@router.delete("/{id}")
def delete_service(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    id: UUID,
) -> Any:
    service = db.query(Service).filter(Service.id == id, Service.company_id == company.id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
        
    db.delete(service)
    db.commit()
    return {"message": "Service deleted successfully"}
