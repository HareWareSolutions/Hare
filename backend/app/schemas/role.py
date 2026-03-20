from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: List[str] = []

class RoleCreate(RoleBase):
    company_id: Optional[UUID] = None
    is_system: bool = False

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[List[str]] = None

class Role(RoleBase):
    id: UUID
    company_id: Optional[UUID] = None
    is_system: bool

    class Config:
        from_attributes = True
