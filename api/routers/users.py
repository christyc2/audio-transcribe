"""
Use APIRouter for protected user endpoints
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi import APIRouter, Depends
from schemas import *
from auth import *

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me/", response_model=User)
async def read_users_me(current_user: UserInDB = Depends(get_current_active_user)):
    # relies on get_current_active_user which relies on get_current_user which relies 
    # on oauth_2_scheme which relies on token. So, need to first access the token by *logging in*
    # Convert UserInDB to User (exclude hashed_password from response)
    return User(
        username=current_user.username,
        password=current_user.password,
        disabled=current_user.disabled
    )

@router.get("/me/items/")
async def read_own_items(current_user: UserInDB = Depends(get_current_active_user)):
    return [{"item_id": "test item", "owner": current_user.username}]