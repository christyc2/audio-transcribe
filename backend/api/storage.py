"""
User storage functions and temporary in-memory database
"""

from fastapi import HTTPException
from .schemas import User as UserSchema
from backend.database.database import SessionLocal
from backend.database.model import User
__all__ = ["get_user", "create_user", "user_exists"]

# [get_user] retrieves the user from the database if they are registered.
def get_user(username: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        return user
    finally:
        db.close()

# [create_user] creates a new user in the database. Raises an exception if the username already exists.
def create_user(user: UserSchema):
    # Lazy import to avoid circular dependency
    from .auth import get_password_hash
    db = SessionLocal()
    try:
        # Add new user to database if they don't already exist
        if user_exists(user.username):
            raise HTTPException(status_code=400, detail="Username already exists")
        # add user to database
        disabled = user.disabled if user.disabled is not None else False
        new_user = User(
            username=user.username,
            password=user.password,
            disabled=disabled,
            hashed_password=get_password_hash(user.password)
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    finally:
        db.close()
    

def user_exists(username: str):
    return get_user(username) is not None

