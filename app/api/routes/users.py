from fastapi import APIRouter, Depends, HTTPException
from typing import Any, List
from sqlalchemy.orm import Session

from uuid import UUID
from app.api.deps import SessionDep, CurrentUser
from app.core import security
from app.models.user import User
from app.schemas.user import User as UserSchema, UserUpdate

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
def read_company_users(
    db: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retorna os usuários da empresa do usuário atual.
    """
    if not current_user.company_id:
        return []
        
    return db.query(User).filter(User.company_id == current_user.company_id).offset(skip).limit(limit).all()

@router.put("/{id}", response_model=UserSchema)
def update_user(
    *,
    db: SessionDep,
    current_user: CurrentUser,
    id: UUID,
    user_in: UserUpdate,
) -> Any:
    user = db.query(User).filter(User.id == id, User.company_id == current_user.company_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    update_data = user_in.model_dump(exclude_unset=True)
    if "password" in update_data:
        password = update_data.pop("password")
        user.hashed_password = security.get_password_hash(password)
        
    for field in update_data:
        setattr(user, field, update_data[field])
        
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{id}")
def delete_user(
    *,
    db: SessionDep,
    current_user: CurrentUser,
    id: UUID,
) -> Any:
    if id == current_user.id:
        raise HTTPException(status_code=400, detail="Users cannot delete themselves")
        
    user = db.query(User).filter(User.id == id, User.company_id == current_user.company_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.is_superuser:
        raise HTTPException(status_code=400, detail="Superusers cannot be deleted via this endpoint")
        
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
