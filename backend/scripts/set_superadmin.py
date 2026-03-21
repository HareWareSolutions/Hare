import os
import sys

# Adiciona o diretório atual ao PYTHONPATH para que o módulo 'app' possa ser encontrado
sys.path.append(os.getcwd())

from app.db.database import SessionLocal
from app.db.base import User # This imports all models

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
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import sys as sys_argv
    email_to_promote = "giordano@hareware.com.br"
    if len(sys_argv.argv) > 1:
        email_to_promote = sys_argv.argv[1]
    
    set_superadmin(email_to_promote)
