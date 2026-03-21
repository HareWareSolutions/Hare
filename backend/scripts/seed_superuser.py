from app.db.database import SessionLocal
from app.models.user import User
from app.models.company import Company
from app.core import security
from app.core.config import settings
import uuid

def seed_superuser():
    db = SessionLocal()
    try:
        # 1. Create Default Company if not exists
        company = db.query(Company).filter(Company.name == "HareWare").first()
        if not company:
            print("Creating default company: HareWare...")
            company = Company(
                name="HareWare",
                document="60.871.736/0001-67",
                document_type="PJ",
                phone="(19) 99803-3434",
                is_active=True,
                subscription_status="active"
            )
            db.add(company)
            db.commit()
            db.refresh(company)
            print(f"Company created with ID: {company.id}")
        else:
            print(f"Company 'HareWare' already exists with ID: {company.id}")

        # 2. Create Superuser if not exists
        email = settings.SUPERADMIN_EMAIL
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"Creating superuser: {email}...")
            user = User(
                email=email,
                hashed_password=security.get_password_hash("HareWare@2026"), # Default password
                full_name="Super Admin",
                company_id=company.id,
                is_superuser=True,
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Superuser created with ID: {user.id}")
        else:
            print(f"User {email} already exists.")
            if not user.is_superuser:
                print(f"Updating user {email} to be superuser...")
                user.is_superuser = True
                db.add(user)
                db.commit()
                print("User updated to superuser.")

    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_superuser()
