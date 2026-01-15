"""
User storage functions and temporary in-memory database
"""

from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
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
    except SQLAlchemyError as e:
        # Log database errors but don't expose internal details
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection error. Please try again later."
        ) from e
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
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")
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
    except HTTPException:
        # Re-raise HTTPException (e.g., username already exists)
        raise
    except IntegrityError as e:
        # Handle database constraint violations (e.g., duplicate username)
        db.rollback()
        error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
        if 'username' in error_msg.lower() or 'unique' in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            ) from e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Database constraint violation. Please check your input."
        ) from e
    except SQLAlchemyError as e:
        # Handle database connection/query errors
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection error. Please try again later."
        ) from e
    except Exception as e:
        # Handle any other unexpected errors
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during registration."
        ) from e
    finally:
        db.close()
    

def user_exists(username: str):
    """
    Check if a user exists in the database.
    Returns False if user doesn't exist or if there's a database error.
    """
    try:
        user = get_user(username)
        return user is not None
    except HTTPException:
        # If there's a database connection error, assume user doesn't exist
        # to avoid blocking registration attempts
        # Re-raise the exception so create_user can handle it appropriately
        raise
    except Exception:
        # For any other unexpected errors, assume user doesn't exist
        return False

