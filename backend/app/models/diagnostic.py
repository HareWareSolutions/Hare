import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base

class Diagnostic(Base):
    __tablename__ = "diagnosticos_empresariais"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nome_empresa = Column(String, nullable=False)
    nome_responsavel = Column(String, nullable=True)
    quantidade_colaboradores = Column(Integer, nullable=False)
    email = Column(String, nullable=False)
    telefone = Column(String, nullable=False)

    atendimento_score = Column(Integer, nullable=False)
    comunicacao_score = Column(Integer, nullable=False)
    processos_score = Column(Integer, nullable=False)
    marketing_score = Column(Integer, nullable=False)
    produtividade_score = Column(Integer, nullable=False)
    tecnologia_score = Column(Integer, nullable=False)

    score_total = Column(Integer, nullable=False)
    classificacao = Column(String, nullable=False)
    gargalo_critico = Column(Boolean, nullable=False, default=False)

    data_criacao = Column(DateTime, default=datetime.utcnow)
