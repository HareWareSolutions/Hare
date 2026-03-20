from fastapi import APIRouter, Depends, HTTPException
from typing import List, Any
from uuid import UUID, uuid4
from datetime import timedelta
from dateutil.relativedelta import relativedelta

from app.api.deps import SessionDep, ActiveCompanyDep
from app.models.transaction import Transaction
from app.schemas.transaction import Transaction as TransactionSchema, TransactionCreate, TransactionUpdate

router = APIRouter()

@router.get("/", response_model=List[TransactionSchema])
def read_transactions(
    db: SessionDep,
    company: ActiveCompanyDep,
    skip: int = 0,
    limit: int = 100,
    type: str = None,
    is_paid: bool = None
) -> Any:
    query = db.query(Transaction).filter(Transaction.company_id == company.id)
    if type:
        query = query.filter(Transaction.type == type)
    if is_paid is not None:
        query = query.filter(Transaction.is_paid == is_paid)
    
    return query.order_by(Transaction.due_date.desc()).offset(skip).limit(limit).all()

@router.post("/", response_model=TransactionSchema)
def create_transaction(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    transaction_in: TransactionCreate
) -> Any:
    recurrence_id = uuid4() if transaction_in.generate_future else None
    
    # Create the initial transaction
    db_transaction = Transaction(
        **transaction_in.model_dump(exclude={"generate_future", "recurrence_period", "recurrence_interval", "recurrence_duration"}),
        company_id=company.id,
        recurrence_id=recurrence_id
    )
    db.add(db_transaction)
    
    # Handle recurrence logic
    if transaction_in.generate_future and transaction_in.recurrence_period and transaction_in.recurrence_duration:
        current_date = transaction_in.due_date
        for i in range(1, transaction_in.recurrence_duration):
            if transaction_in.recurrence_period == "months":
                next_date = current_date + relativedelta(months=i)
            elif transaction_in.recurrence_period == "weeks":
                next_date = current_date + timedelta(weeks=i)
            elif transaction_in.recurrence_period == "days":
                next_date = current_date + timedelta(days=i)
            else:
                break
                
            future_transaction = Transaction(
                **transaction_in.model_dump(exclude={"generate_future", "recurrence_period", "recurrence_interval", "recurrence_duration", "due_date"}),
                due_date=next_date,
                company_id=company.id,
                recurrence_id=recurrence_id,
                is_paid=False
            )
            db.add(future_transaction)
            
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.put("/{id}", response_model=TransactionSchema)
def update_transaction(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    id: UUID,
    transaction_in: TransactionUpdate
) -> Any:
    db_transaction = db.query(Transaction).filter(
        Transaction.id == id, 
        Transaction.company_id == company.id
    ).first()
    
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    update_data = transaction_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_transaction, field, value)
        
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.delete("/{id}")
def delete_transaction(
    *,
    db: SessionDep,
    company: ActiveCompanyDep,
    id: UUID
) -> Any:
    db_transaction = db.query(Transaction).filter(
        Transaction.id == id, 
        Transaction.company_id == company.id
    ).first()
    
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    db.delete(db_transaction)
    db.commit()
    return {"message": "Transaction deleted"}
