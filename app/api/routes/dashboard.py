from fastapi import APIRouter, Depends
from typing import Any
from app.api.deps import SessionDep, ActiveCompanyDep, CurrentUser
from app.models.client import Client
from app.models.service import Service
from app.models.sales import Sale, SalesGoal
from app.models.support import SupportRequest
from app.models.assignment import Ticket, Task
from sqlalchemy import func
from datetime import date

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(
    db: SessionDep,
    company: ActiveCompanyDep,
    current_user: CurrentUser
) -> Any:
    # 1. Clients & Services
    total_clients = db.query(Client).filter(Client.company_id == company.id).count()
    active_services = db.query(Service).filter(Service.company_id == company.id).count()
    
    # 2. Sales
    today = date.today()
    current_goal = db.query(SalesGoal).filter(
        SalesGoal.company_id == company.id,
        SalesGoal.month == today.month,
        SalesGoal.year == today.year
    ).first()
    
    current_sales_value = db.query(func.sum(Sale.value)).filter(
        Sale.company_id == company.id,
        func.extract('month', Sale.sale_date) == today.month,
        func.extract('year', Sale.sale_date) == today.year
    ).scalar() or 0
    
    # 3. Support
    open_supports = db.query(SupportRequest).filter(
        SupportRequest.company_id == company.id,
        SupportRequest.converted_to_ticket_id == None
    ).count()
    
    # 4. Assignments (Tickets/Tasks)
    pending_tasks = db.query(Task).join(Ticket).filter(
        Ticket.company_id == company.id,
        Task.status != "Finalizada"
    ).count()
    
    user_tasks = db.query(Task).filter(
        Task.assigned_to_id == current_user.id,
        Task.status != "Finalizada"
    ).count()

    return {
        "total_clients": total_clients,
        "active_services": active_services,
        "sales": {
            "current_value": float(current_sales_value),
            "goal": float(current_goal.target_value) if current_goal else 0.0,
            "progress": (float(current_sales_value) / float(current_goal.target_value) * 100) if current_goal and current_goal.target_value > 0 else 0.0
        },
        "support": {
            "open_requests": open_supports
        },
        "assignments": {
            "total_pending": pending_tasks,
            "user_pending": user_tasks
        }
    }
