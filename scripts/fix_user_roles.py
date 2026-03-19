from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.user import User
from app.models.role import Role
from app.api.routes.roles import seed_system_roles

def fix_user_roles():
    db = SessionLocal()
    try:
        # 1. Seed system roles
        seed_system_roles(db)
        
        # 2. Get Admin role
        admin_role = db.query(Role).filter(Role.name == "Admin", Role.is_system == True).first()
        if not admin_role:
            print("Admin role not found!")
            return

        # 3. Find all users with a company but no roles
        users_without_roles = db.query(User).filter(User.company_id.isnot(None)).all()
        
        count = 0
        for user in users_without_roles:
            if not user.roles:
                user.roles.append(admin_role)
                db.add(user)
                count += 1
        
        db.commit()
        print(f"Assigned Admin role to {count} users.")
    finally:
        db.close()

if __name__ == "__main__":
    fix_user_roles()
