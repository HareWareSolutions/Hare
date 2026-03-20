from app.db.database import SessionLocal
from app.db.base import Base # This imports all models
from app.models.user import User

def set_superadmin(email: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.is_superuser = True
            db.add(user)
            db.commit()
            print(f"User {email} is now a superadmin.")
        else:
            print(f"User with email {email} not found.")
    finally:
        db.close()

if __name__ == "__main__":
    set_superadmin("giordano@hareware.com.br")
