"""
Use APIRouter for protected user endpoints
"""

from typing import List
from fastapi import APIRouter, Depends, File, UploadFile, status, Depends
from ..schemas import *
from ..auth import *
from ..jobs import create_job, list_jobs, get_job
from backend.database.database import SessionLocal, get_db 

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

@router.get("/me/jobs/", response_model=List[Job])
async def read_jobs(
    current_user: UserInDB = Depends(get_current_active_user),
    db: SessionLocal = Depends(get_db)
):
    return list_jobs(current_user.username, db)

@router.post("/me/jobs/", response_model=Job, status_code=status.HTTP_201_CREATED)
async def upload_job(
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(get_current_active_user),
    db: SessionLocal = Depends(get_db)
    ):
    return await create_job(current_user.username, file, db)

@router.get("/me/jobs/{job_id}/", response_model=Job)
async def return_job(job_id: str, current_user: UserInDB = Depends(get_current_active_user)):
    return get_job(job_id)