from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Any, Optional

class RequestBase(BaseModel):
    type: str
    payload: Any

class RequestCreate(RequestBase):
    pass

class RequestUpdate(BaseModel):
    status: str

class Request(RequestBase):
    id: UUID
    status: str
    company_id: UUID
    company_name: Optional[str] = None
    requested_by_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)
