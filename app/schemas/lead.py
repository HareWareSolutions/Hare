from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

class LeadResponse(BaseModel):
    id: UUID
    nome_empresa: str
    email: EmailStr
    telefone: str
    origem: str
    tags: Optional[str] = None
    data_criacao: datetime

    class Config:
        from_attributes = True
