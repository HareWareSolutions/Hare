from fastapi import APIRouter, HTTPException, status, Depends
from typing import Any, List
from app.api.deps import SessionDep, ActiveCompanyDep, CurrentUser
from app.models.purchase_request import PurchaseRequest
from app.models.price_history import PriceHistory
from app.schemas.purchase import PurchaseRequest as PurchaseRequestSchema, PurchaseRequestCreate, PurchaseRequestUpdate
from uuid import UUID
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[PurchaseRequestSchema])
def read_purchase_requests(
    db: SessionDep,
    company: ActiveCompanyDep,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve purchase requests.
    """
    requests = db.query(PurchaseRequest).filter(PurchaseRequest.company_id == company.id).order_by(PurchaseRequest.created_at.desc()).offset(skip).limit(limit).all()
    return requests

@router.post("/", response_model=PurchaseRequestSchema)
def create_purchase_request(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    user: CurrentUser,
    request_in: PurchaseRequestCreate,
) -> Any:
    """
    Create new purchase request.
    """
    data = request_in.dict()
    if data.get("items"):
        # items are already dictified by data = request_in.dict()
        pass
        
    request = PurchaseRequest(
        **data,
        company_id=company.id,
        requester_id=user.id,
        status="PENDING"
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return request

@router.put("/{id}", response_model=PurchaseRequestSchema)
def update_purchase_request(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    id: UUID,
    request_in: PurchaseRequestUpdate,
) -> Any:
    """
    Update a purchase request.
    """
    request = db.query(PurchaseRequest).filter(PurchaseRequest.id == id, PurchaseRequest.company_id == company.id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Purchase request not found")
    
    update_data = request_in.dict(exclude_unset=True)
    
    # If status is changing to APPROVED, record price history
    if "status" in update_data and update_data["status"] == "APPROVED" and request.status != "APPROVED":
        if request.supplier_id and request.items:
            for item in request.items:
                price_entry = PriceHistory(
                    supplier_id=request.supplier_id,
                    product_name=item["name"],
                    price=item["price"],
                    purchase_request_id=request.id
                )
                db.add(price_entry)
    
    for field, value in update_data.items():
        if field == "items" and value:
            # value is already a list of dicts from request_in.dict()
            setattr(request, field, value)
        else:
            setattr(request, field, value)
    
    db.add(request)
    db.commit()
    db.refresh(request)
    return request

@router.delete("/{id}")
def delete_purchase_request(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    id: UUID,
) -> Any:
    """
    Delete a purchase request.
    """
    request = db.query(PurchaseRequest).filter(PurchaseRequest.id == id, PurchaseRequest.company_id == company.id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Purchase request not found")
    
    db.delete(request)
    db.commit()
    return {"message": "Purchase request deleted"}
