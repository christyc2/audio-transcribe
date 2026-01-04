"""
Use APIRouter for user registration and login endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from ..schemas import User, Token
from ..auth import authenticate_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from ..storage import create_user

router = APIRouter(prefix="/auth", tags=["authentication"])

# Registration endpoint
@router.post("/register", response_model=User)
async def register(user: User):
    new_user = create_user(user)
    # Return the original user data (not the database object)
    return user

# Login endpoint
# Called when signing in with username and password and return access token (to be used during active duration)
@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # the data that we're going to accept to generate a jwt token is going to be a username and password. 
    # depends on OAuth2PasswordRequestForm to parse the data
    user = authenticate_user(form_data.username, form_data.password)
    if user == None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                            detail="User not registered", headers={"WWW-Authenticate": "Bearer"})
    elif user == False:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail="Incorrect username or password", headers={"WWW-Authenticate": "Bearer"})
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
    # automatically converted to Token object
    return {"access_token": access_token, "token_type": "bearer"}

