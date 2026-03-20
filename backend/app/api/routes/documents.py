from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import Any, List, Optional
from app.api.deps import SessionDep, ActiveCompanyDep, CurrentUser
from app.models.document import Document
from app.models.role import Role
from app.schemas.document import Document as DocumentSchema
from uuid import UUID
import os
import shutil
from datetime import datetime
import json

router = APIRouter()

# Directory for file storage
UPLOAD_DIR = "uploads/documents"

@router.post("/", response_model=DocumentSchema)
async def upload_document(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    user: CurrentUser,
    file: UploadFile = File(...),
    name: str = Form(...),
    written_at: str = Form(...),
    author_name: Optional[str] = Form(None),
    valid_until: Optional[str] = Form(None),
    client_id: Optional[str] = Form(None),
    author_id: Optional[str] = Form(None),
    role_ids: str = Form("[]"), # JSON string of UUIDs
) -> Any:
    """
    Upload a new document with metadata and role permissions.
    """
    # Create directory if not exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Save file
    file_extension = os.path.splitext(file.filename)[1]
    file_id = str(UUID(int=os.urandom(16).hex().__hash__()).hex)[:12] # Short unique id
    unique_filename = f"{company.id}_{datetime.now().timestamp()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Parse dates and extras
    w_at = datetime.fromisoformat(written_at)
    v_until = datetime.fromisoformat(valid_until) if valid_until else None
    c_id = UUID(client_id) if client_id and client_id != "null" else None
    a_id = UUID(author_id) if author_id and author_id != "null" else None
    parsed_role_ids = json.loads(role_ids)
    
    document = Document(
        company_id=company.id,
        name=name,
        file_path=file_path,
        content_type=file.content_type,
        written_at=w_at,
        author_name=author_name,
        author_id=a_id,
        valid_until=v_until,
        client_id=c_id
    )
    
    # Set role permissions
    if parsed_role_ids:
        roles = db.query(Role).filter(Role.id.in_(parsed_role_ids)).all()
        document.accessible_roles = roles
        
    db.add(document)
    db.commit()
    db.refresh(document)
    return document

@router.get("/", response_model=List[DocumentSchema])
def list_documents(
    db: SessionDep,
    company: ActiveCompanyDep,
    user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    List documents visible to the current user based on roles.
    Admin sees all.
    """
    # Check if user is Admin
    is_admin = any(r.name.lower() == "admin" for r in user.roles) or user.is_superuser
    
    query = db.query(Document).filter(Document.company_id == company.id)
    
    if not is_admin:
        # Filter by user roles
        user_role_ids = [r.id for r in user.roles]
        query = query.join(Document.accessible_roles).filter(Role.id.in_(user_role_ids))
        
    documents = query.offset(skip).limit(limit).all()
    return documents

@router.get("/{id}/download")
def download_document(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    id: UUID,
) -> Any:
    """
    Download a document.
    """
    document = db.query(Document).filter(Document.id == id, Document.company_id == company.id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if not os.path.exists(document.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")
        
    return FileResponse(
        document.file_path,
        media_type=document.content_type,
        filename=os.path.basename(document.file_path).split('_', 2)[-1] # Original filename
    )

@router.delete("/{id}")
def delete_document(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    id: UUID,
) -> Any:
    """
    Delete a document and its file.
    """
    document = db.query(Document).filter(Document.id == id, Document.company_id == company.id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Remove file
    if os.path.exists(document.file_path):
        os.remove(document.file_path)
        
    db.delete(document)
    db.commit()
    return {"message": "Document deleted"}
