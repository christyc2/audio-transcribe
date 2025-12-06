"""
User storage functions and temporary in-memory database
"""

from fastapi import HTTPException
from schemas import *

__all__ = ["get_user", "create_user", "user_exists"]

# [get_user] retrieves the user from the database if they are registered.
# [db] is the in memory database, [username] is the provided username
def get_user(username: str):
    if username in db:
        user_data = db[username]
        # Initialize UserInDB model
        return UserInDB(**user_data)

# [create_user] creates a new user in the database. Raises an exception if the username already exists.
def create_user(user: User):
    # Lazy import to avoid circular dependency
    from auth import get_password_hash
    
    if get_user(user.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    # add user to database
    disabled = user.disabled if user.disabled is not None else False
    db[user.username] = {
        "username": user.username,
        "password": user.password,
        "hashed_password": get_password_hash(user.password),
        "disabled": disabled
    }
    # Return User model matching the response_model in the routers/authentication.py file
    return User(
        username=user.username,
        password=user.password,
        disabled=disabled
    )

def user_exists(username: str):
    return username in db

db = {
    "test_user": {
        "username": "test_user",
        "password": "test_pw",
        "hashed_password": "$2b$12$T4zeOFFUxxQhJNchdpS.Gua72SbPBt/3pQuSBW4ELqAOdTrcOUQ5u",
        "disabled": False
    }
}