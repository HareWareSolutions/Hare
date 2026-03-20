from app.db.database import SessionLocal
from app.db.base import Base
from app.models.user import User
from app.models.company import Company
from app.models.role import Role

def check_user_and_company(email: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        companies = db.query(Company).all()
        
        print(f"User: {user.email}")
        print(f"Is Superuser: {user.is_superuser}")
        print(f"User Company ID: {user.company_id}")
        print(f"User Roles: {[r.name for r in user.roles]}")
        
        print("\nAvailable Companies:")
        for c in companies:
            print(f" - ID: {c.id}, Name: {c.name}")
            
        if not user.company_id and companies:
            # Assign the first company to the user if they want to be admin of it
            user.company_id = companies[0].id
            
            # Ensure they have the Admin role
            admin_role = db.query(Role).filter(Role.name == "Admin", Role.is_system == True).first()
            if admin_role and admin_role not in user.roles:
                user.roles.append(admin_role)
            
            db.add(user)
            db.commit()
            print(f"\nAssigned user to company: {companies[0].name} and granted Admin role.")
            
    finally:
        db.close()

if __name__ == "__main__":
    check_user_and_company("giordano@hareware.com.br")
