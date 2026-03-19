from fastapi import APIRouter, HTTPException, status
from typing import Any, List
from app.api.deps import SessionDep, ActiveCompanyDep, CurrentUser
from app.models.supplier import Supplier
from app.models.price_history import PriceHistory
from app.schemas.supplier import Supplier as SupplierSchema, SupplierCreate, SupplierUpdate, PriceHistory as PriceHistorySchema
from uuid import UUID

router = APIRouter()

@router.get("/", response_model=List[SupplierSchema])
def read_suppliers(
    db: SessionDep,
    company: ActiveCompanyDep,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve suppliers.
    """
    suppliers = db.query(Supplier).filter(Supplier.company_id == company.id).offset(skip).limit(limit).all()
    return suppliers

@router.post("/", response_model=SupplierSchema)
def create_supplier(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    supplier_in: SupplierCreate,
) -> Any:
    """
    Create new supplier.
    """
    supplier = Supplier(
        **supplier_in.dict(),
        company_id=company.id,
    )
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier

@router.put("/{id}", response_model=SupplierSchema)
def update_supplier(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    id: UUID,
    supplier_in: SupplierUpdate,
) -> Any:
    """
    Update a supplier.
    """
    supplier = db.query(Supplier).filter(Supplier.id == id, Supplier.company_id == company.id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    update_data = supplier_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(supplier, field, value)
    
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier

@router.delete("/{id}")
def delete_supplier(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    id: UUID,
) -> Any:
    """
    Delete a supplier.
    """
    supplier = db.query(Supplier).filter(Supplier.id == id, Supplier.company_id == company.id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    db.delete(supplier)
    db.commit()
    return {"message": "Supplier deleted"}

@router.get("/{id}/price-history", response_model=List[PriceHistorySchema])
def read_price_history(
    db: SessionDep,
    company: ActiveCompanyDep,
    id: UUID,
) -> Any:
    """
    Get price history for a supplier.
    """
    supplier = db.query(Supplier).filter(Supplier.id == id, Supplier.company_id == company.id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    return supplier.price_histories
