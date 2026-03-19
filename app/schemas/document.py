from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import List, Optional

class DocumentBase(BaseModel):
    name: str
    written_at: datetime
    author_name: Optional[str] = None
    valid_until: Optional[datetime] = None
    client_id: Optional[UUID] = None
    author_id: Optional[UUID] = None

class DocumentCreate(DocumentBase):
    accessible_role_ids: List[UUID] = []

class DocumentUpdate(BaseModel):
    name: Optional[str] = None
    written_at: Optional[datetime] = None
    author_name: Optional[str] = None
    valid_until: Optional[datetime] = None
    client_id: Optional[UUID] = None
    accessible_role_ids: Optional[List[UUID]] = None

class RoleSimple(BaseModel):
    id: UUID
    name: str
    model_config = ConfigDict(from_attributes=True)

class Document(DocumentBase):
    id: UUID
    company_id: UUID
    file_path: str
    content_type: str
    created_at: datetime
    accessible_roles: List[RoleSimple] = []

    model_config = ConfigDict(from_attributes=True)
