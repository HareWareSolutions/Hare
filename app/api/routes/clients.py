from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List
from uuid import UUID

from app.api.deps import SessionDep, ActiveCompanyDep
from app.models.client import Client
from app.schemas.client import Client as ClientSchema, ClientCreate, ClientUpdate

router = APIRouter()

@router.get("/", response_model=List[ClientSchema])
def read_clients(
    db: SessionDep,
    company: ActiveCompanyDep,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    clients = db.query(Client).filter(Client.company_id == company.id).offset(skip).limit(limit).all()
    return clients

@router.post("/", response_model=ClientSchema)
def create_client(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    client_in: ClientCreate,
) -> Any:
    client = Client(
        company_id=company.id,
        **client_in.model_dump()
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return client

@router.put("/{id}", response_model=ClientSchema)
def update_client(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    id: UUID,
    client_in: ClientUpdate,
) -> Any:
    client = db.query(Client).filter(Client.id == id, Client.company_id == company.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
        
    update_data = client_in.model_dump(exclude_unset=True)
    for field in update_data:
        setattr(client, field, update_data[field])
        
    db.add(client)
    db.commit()
    db.refresh(client)
    return client

@router.delete("/{id}")
def delete_client(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    id: UUID,
) -> Any:
    client = db.query(Client).filter(Client.id == id, Client.company_id == company.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
        
    db.delete(client)
    db.commit()
    return {"message": "Client deleted successfully"}
