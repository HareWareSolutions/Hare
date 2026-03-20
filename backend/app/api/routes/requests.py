from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List
from uuid import UUID

from app.api.deps import SessionDep, CurrentUser
from app.models.request import Request
from app.models.user import User
from app.models.company import Company
from app.models.role import Role
from app.api.routes.roles import seed_system_roles
from app.schemas.request import Request as RequestSchema, RequestCreate
from app.core import security

router = APIRouter()

@router.post("/", response_model=RequestSchema, status_code=status.HTTP_201_CREATED)
def create_request(
    *,
    db: SessionDep,
    current_user: CurrentUser,
    request_in: RequestCreate,
) -> Any:
    """
    Create a new request for the current user's company.
    """
    if not current_user.company_id:
         raise HTTPException(status_code=400, detail="User must belong to a company to create requests")
         
    db_obj = Request(
        type=request_in.type,
        payload=request_in.payload,
        company_id=current_user.company_id,
        requested_by_id=current_user.id,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/", response_model=List[RequestSchema])
def read_requests(
    db: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve requests for the current user's company.
    """
    if current_user.is_superuser:
        reqs = db.query(Request).offset(skip).limit(limit).all()
        for r in reqs:
            r.company_name = r.company.name if r.company else "N/A"
        return reqs
    
    if not current_user.company_id:
        return []
        
    reqs = db.query(Request).filter(Request.company_id == current_user.company_id).offset(skip).limit(limit).all()
    for r in reqs:
        r.company_name = r.company.name if r.company else "N/A"
    return reqs

@router.get("/admin", response_model=List[RequestSchema])
def read_all_requests(
    db: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all requests (Superadmin only).
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    reqs = db.query(Request).order_by(Request.created_at.desc()).offset(skip).limit(limit).all()
    for r in reqs:
        r.company_name = r.company.name if r.company else "N/A"
    return reqs

@router.post("/admin/{request_id}/approve", response_model=RequestSchema)
def approve_request(
    *,
    db: SessionDep,
    current_user: CurrentUser,
    request_id: UUID,
) -> Any:
    """
    Approve a request (Superadmin only).
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    db_obj = db.query(Request).filter(Request.id == request_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if db_obj.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request already processed")

    # Business Logic for "user_creation"
    if db_obj.type == "user_creation":
        payload = db_obj.payload
        email = payload.get("email")
        password = payload.get("password")
        full_name = payload.get("full_name")
        
        if not email or not password:
             raise HTTPException(status_code=400, detail="Invalid payload for user_creation")
             
        # Check if user exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
             db_obj.status = "rejected"
             db.add(db_obj)
             db.commit()
             raise HTTPException(status_code=400, detail="User with this email already exists")
        
        new_user = User(
            email=email,
            hashed_password=security.get_password_hash(password),
            full_name=full_name,
            company_id=db_obj.company_id,
            is_superuser=False
        )
        db.add(new_user)
    
    # Business Logic for "account_approval"
    elif db_obj.type == "account_approval":
        user = db.query(User).filter(User.id == db_obj.requested_by_id).first()
        company = db.query(Company).filter(Company.id == db_obj.company_id).first()
        
        if user:
            user.is_active = True
            db.add(user)
            
            # Seed roles and assign Administrador
            seed_system_roles(db)
            admin_role = db.query(Role).filter(Role.name == "Administrador", Role.is_system == True).first()
            if admin_role and admin_role not in user.roles:
                user.roles.append(admin_role)
                db.add(user)
                
        if company:
            company.is_active = True
            db.add(company)

    db_obj.status = "approved"
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.post("/admin/{request_id}/reject", response_model=RequestSchema)
def reject_request(
    *,
    db: SessionDep,
    current_user: CurrentUser,
    request_id: UUID,
) -> Any:
    """
    Reject a request (Superadmin only).
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    db_obj = db.query(Request).filter(Request.id == request_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if db_obj.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request already processed")

    # If it's an account approval, cleanup the inactive data so they can try again
    if db_obj.type == "account_approval":
        user = db.query(User).filter(User.id == db_obj.requested_by_id).first()
        company = db.query(Company).filter(Company.id == db_obj.company_id).first()
        
        if user:
            db.delete(user)
        if company:
            db.delete(company)

    db_obj.status = "rejected"
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
