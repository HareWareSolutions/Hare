from fastapi import APIRouter, Depends, HTTPException, status
import logging

logger = logging.getLogger(__name__)
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from typing import Any

from app.api.deps import SessionDep, CurrentUser
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.models.company import Company
from app.schemas.user import UserCreate, Token, User as UserSchema

router = APIRouter()

@router.post("/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: SessionDep) -> Any:
    # Check if user exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    
    is_super = user_in.email == settings.SUPERADMIN_EMAIL
    
    # Create Company as multi-tenant logic requires a company
    company = Company(
        name=user_in.company_name,
        document=user_in.document,
        document_type=user_in.document_type,
        phone=user_in.phone,
        is_active=is_super or False
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    
    # Create User
    new_user = User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        company_id=company.id,
        is_superuser=is_super,
        is_active=is_super or False # Auto-activate if superadmin
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create Approval Request (only if NOT superadmin)
    if not is_super:
        from app.models.request import Request
        approval_request = Request(
            type="account_approval",
            company_id=company.id,
            requested_by_id=new_user.id,
            payload={
                "full_name": new_user.full_name,
                "email": new_user.email,
                "company_name": company.name,
                "document": company.document,
                "document_type": company.document_type,
                "phone": company.phone
            }
        )
        db.add(approval_request)
        db.commit()

    return new_user

@router.post("/login", response_model=Token)
def login(db: SessionDep, form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    logger.info(f"Tentativa de login para usuário: {form_data.username}")
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user:
        logger.warning(f"Usuário não encontrado: {form_data.username}")
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    if not security.verify_password(form_data.password, user.hashed_password):
        logger.warning(f"Senha incorreta para usuário: {form_data.username}")
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    if not user.is_active:
        logger.warning(f"Usuário inativo: {form_data.username}")
        raise HTTPException(status_code=400, detail="Inactive user")
        
    logger.info(f"Login bem-sucedido: {form_data.username}")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "refresh_token": security.create_refresh_token(user.id),
        "token_type": "bearer",
    }

@router.get("/me", response_model=UserSchema)
def read_user_me(current_user: CurrentUser) -> Any:
    """
    Get current user.
    """
    return current_user
