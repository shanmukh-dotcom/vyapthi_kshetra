from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User, Notification

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    """Fetch all users (Farmers, Buyers, Transporters)."""
    return db.query(User).all()

@router.get("/notifications/{user_id}")
def get_notifications(user_id: str, db: Session = Depends(get_db)):
    """Fetch notifications for a user."""
    return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()
