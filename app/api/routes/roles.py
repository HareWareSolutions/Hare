from fastapi import APIRouter, Depends, HTTPException
from typing import List, Any
from uuid import UUID
from sqlalchemy.orm import Session

from app.api.deps import SessionDep, ActiveCompanyDep, get_current_user
from app.models.role import Role as RoleModel
from app.models.user import User as UserModel
from app.schemas.role import Role as RoleSchema, RoleCreate, RoleUpdate

router = APIRouter()

SYSTEM_ROLES = [
    {"name": "Admin", "description": "Acesso total à empresa", "permissions": ["*"], "is_system": True},
    {"name": "Gerente Financeiro", "description": "Gestão de finanças e faturamento", "permissions": ["finance.*"], "is_system": True},
    {"name": "Gerente de Vendas", "description": "Gestão de leads e funil de vendas", "permissions": ["sales.*"], "is_system": True},
    {"name": "Gerente de RH", "description": "Gestão de usuários e solicitações", "permissions": ["users.*", "requests.*"], "is_system": True},
]

def seed_system_roles(db: Session):
    for role_data in SYSTEM_ROLES:
        exists = db.query(RoleModel).filter(RoleModel.name == role_data["name"], RoleModel.is_system == True).first()
        if not exists:
            db_role = RoleModel(**role_data)
            db.add(db_role)
    db.commit()

@router.get("/", response_model=List[RoleSchema])
def read_roles(
    db: SessionDep,
    company: ActiveCompanyDep,
) -> Any:
    # Always ensure system roles are seeded (fast check)
    seed_system_roles(db)
    
    # Return system roles + company specific roles
    roles = db.query(RoleModel).filter(
        (RoleModel.is_system == True) | (RoleModel.company_id == company.id)
    ).all()
    return roles

@router.post("/", response_model=RoleSchema)
def create_role(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    role_in: RoleCreate
) -> Any:
    role = RoleModel(
        company_id=company.id,
        is_system=False,
        **role_in.model_dump(exclude={"company_id", "is_system"})
    )
    db.add(role)
    db.commit()
    db.refresh(role)
    return role

@router.put("/{id}", response_model=RoleSchema)
def update_role(
    *,
    id: UUID,
    db: SessionDep,
    company: ActiveCompanyDep,
    role_in: RoleUpdate
) -> Any:
    role = db.query(RoleModel).filter(
        RoleModel.id == id,
        RoleModel.company_id == company.id # Cannot update system roles
    ).first()
    
    if not role:
        raise HTTPException(status_code=404, detail="Custom role not found or cannot edit system role")
        
    update_data = role_in.model_dump(exclude_unset=True)
    for field in update_data:
        setattr(role, field, update_data[field])
        
    db.add(role)
    db.commit()
    db.refresh(role)
    return role

@router.delete("/{id}")
def delete_role(
    *,
    id: UUID,
    db: SessionDep,
    company: ActiveCompanyDep
) -> Any:
    role = db.query(RoleModel).filter(
        RoleModel.id == id,
        RoleModel.company_id == company.id
    ).first()
    
    if not role:
        raise HTTPException(status_code=404, detail="Custom role not found")
        
    db.delete(role)
    db.commit()
    return {"message": "Role deleted"}
