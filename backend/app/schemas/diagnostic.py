from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class DiagnosticCreate(BaseModel):
    nome_empresa: str
    nome_responsavel: Optional[str] = None
    quantidade_colaboradores: int = Field(..., gt=0)
    email: EmailStr
    telefone: str
    
    atendimento_score: int = Field(..., ge=0, le=5)
    comunicacao_score: int = Field(..., ge=0, le=5)
    processos_score: int = Field(..., ge=0, le=5)
    marketing_score: int = Field(..., ge=0, le=5)
    produtividade_score: int = Field(..., ge=0, le=5)
    tecnologia_score: int = Field(..., ge=0, le=5)

class DiagnosticResponse(BaseModel):
    id: UUID
    nome_empresa: str
    nome_responsavel: Optional[str] = None
    quantidade_colaboradores: int
    email: EmailStr
    telefone: str
    
    atendimento_score: int
    comunicacao_score: int
    processos_score: int
    marketing_score: int
    produtividade_score: int
    tecnologia_score: int
    
    score_total: int
    classificacao: str
    gargalo_critico: bool
    data_criacao: datetime

    class Config:
        from_attributes = True

class DiagnosticScoreResponse(BaseModel):
    score_total: int
    classificacao: str
    gargalo_critico: bool
