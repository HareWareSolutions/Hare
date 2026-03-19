import sys
from app.db.database import SessionLocal
from app.db.base import User, Company # Importing through base ensures metadata is loaded

def promote_user(email: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"Erro: Usuário com email '{email}' não encontrado.")
            return
        
        user.is_superuser = True
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"Sucesso! O usuário '{email}' agora é um Superuser.")
    except Exception as e:
        print(f"Ocorreu um erro: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        email_to_promote = sys.argv[1]
    else:
        email_to_promote = "giordano@hareware.com.br"
    
    promote_user(email_to_promote)
