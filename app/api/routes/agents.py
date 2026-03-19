from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Any, Dict

from app.api.deps import SessionDep, ActiveCompanyDep

class AgentAction(BaseModel):
    action: str
    payload: Dict[str, Any]

router = APIRouter()

@router.post("/execute")
async def execute_agent(
    db: SessionDep,
    company: ActiveCompanyDep,
    action_in: AgentAction
) -> Any:
    """
    Receber a ação, encaminhar para o OpenClaw (stub) e retornar resposta.
    """
    if not company.openclaw_agent_id:
        raise HTTPException(status_code=404, detail="OpenClaw Agent ID not configured for this company.")
        
    return {
        "status": "success",
        "message": f"Ação {action_in.action} fake-encaminhada para OpenClaw Agent {company.openclaw_agent_id}",
        "agent_response": {"fake_data": "ok"}
    }
