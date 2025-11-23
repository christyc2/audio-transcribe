import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from passlib.context import CryptContext
from datetime import timedelta, datetime
from jose import JWTError, jwt
from schemas import *
from storage import *
# from fastapi.middleware.cors import CORSMiddleware
# from typing import List

SECRET_KEY = "2bd7137b29233d56b34dc9f4c56cc52601e22b8a22ba456c79e4a71b09fd2c48"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# "bcrypt" is crypto graphy algorithm
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# Defines where to retrieve access token
oauth_2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Initialize FastAPI object
app = FastAPI()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# [authenticate_user] authenticates the user's credentials. [db] is the database, 
# [username] is the provided username, [password] is the provided password
def authenticate_user(db, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    
    return user

# [create_access_token] creates the access token. [data] is the data we want to encode, 
# [expires_delta] is the diff. between current time and expiration time
def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=15)): 
    to_encode = data.copy()
    expire_time = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire_time})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# creates an access token based on login data

# [get_current_user] gets a user from an access token (depends on oauth_2_scheme to parse the token)
async def get_current_user(token: str = Depends(oauth_2_scheme)):
    credential_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    try:
        # decode token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # get user that was encoded in the token
        username: str = payload.get("sub")
        if not username:
            raise credential_exception
        # use TokenData model to store the username
        token_data = TokenData(username=username)
    except JWTError:
        raise credential_exception
    user = get_user(db, username=token_data.username)
    if not user:
        raise credential_exception
    return user

# [get_current_active_user] checks if a current user is active (can login)
async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Called when signing in with username and password and return access token (to be used during active duration)
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # the data that we're going to accept to generate a jwt token is going to be a username and password. 
    # depends on OAuth2PasswordRequestForm to parse the data
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail="Incorrect username or password", headers={"WWW-Authenticate": "Bearer"})
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
    # automatically converted to Token object
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me/", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    # relies on get_current_active_user which relies on get_current_user which relies 
    # on oauth_2_scheme which relies on token. So, need to first access token by *logging in*
    return current_user

@app.get("/users/me/items/")
async def read_own_items(current_user: User = Depends(get_current_active_user)):
    return [{"item_id": "test item", "owner": current_user.username}]

@app.post("/register/")
async def register(user: User):
    # check if user already exists
    if get_user(db, user.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    return create_user(db, user)