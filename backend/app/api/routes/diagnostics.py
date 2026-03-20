from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.database import get_db
from app.models.diagnostic import Diagnostic
from app.models.lead import Lead
from app.models.user import User
from app.schemas.diagnostic import DiagnosticCreate, DiagnosticResponse, DiagnosticScoreResponse
from app.api.deps import get_current_user

router = APIRouter()

def calculate_classification(score_total: int) -> str:
    if score_total <= 10:
        return "Empresa Travada"
    elif score_total <= 18:
        return "Empresa Instável"
    elif score_total <= 24:
        return "Empresa Estruturada"
    else:
        return "Empresa Escalável"

@router.post("/submit", response_model=DiagnosticScoreResponse)
def submit_diagnostic(data: DiagnosticCreate, db: Session = Depends(get_db)):
    # Calculate scores
    score_total = (
        data.atendimento_score + 
        data.comunicacao_score + 
        data.processos_score + 
        data.marketing_score + 
        data.produtividade_score + 
        data.tecnologia_score
    )
    
    # Check for critical bottleneck
    gargalo_critico = any(score <= 1 for score in [
        data.atendimento_score,
        data.comunicacao_score,
        data.processos_score,
        data.marketing_score,
        data.produtividade_score,
        data.tecnologia_score
    ])
    
    classificacao = calculate_classification(score_total)
    
    # Save diagnostic
    new_diagnostic = Diagnostic(
        nome_empresa=data.nome_empresa,
        nome_responsavel=data.nome_responsavel,
        quantidade_colaboradores=data.quantidade_colaboradores,
        email=data.email,
        telefone=data.telefone,
        atendimento_score=data.atendimento_score,
        comunicacao_score=data.comunicacao_score,
        processos_score=data.processos_score,
        marketing_score=data.marketing_score,
        produtividade_score=data.produtividade_score,
        tecnologia_score=data.tecnologia_score,
        score_total=score_total,
        classificacao=classificacao,
        gargalo_critico=gargalo_critico
    )
    db.add(new_diagnostic)
    
    # Save Lead reflexively
    new_lead = Lead(
        nome_empresa=data.nome_empresa,
        email=data.email,
        telefone=data.telefone,
        origem="HARE_SCORE",
        tags="diagnostico_empresarial"
    )
    db.add(new_lead)
    
    db.commit()
    
    return DiagnosticScoreResponse(
        score_total=score_total,
        classificacao=classificacao,
        gargalo_critico=gargalo_critico
    )

@router.get("/admin", response_model=List[DiagnosticResponse])
def get_diagnostics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500)
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    
    diagnostics = db.query(Diagnostic).order_by(Diagnostic.data_criacao.desc()).offset(skip).limit(limit).all()
    return diagnostics
