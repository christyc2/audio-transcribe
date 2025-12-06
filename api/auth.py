"""
Authentication & JWT token handling
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from storage import get_user
from schemas import TokenData, UserInDB
import os

# Initialization
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required. Please set it in your .env file.")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# a CryptContext instance, can hash and verify passwords using "bcrypt" (a cryptography algorithm). 
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# Defines where to retrieve access token
oauth_2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# [get_password_hash] hashes the password using the CryptContext instance
def get_password_hash(password):
    return pwd_context.hash(password)

# [authenticate_user] authenticates the user's credentials.
# [username] is the provided username, [password] is the provided password
def authenticate_user(username: str, password: str):
    user = get_user(username)
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

# [get_current_user] gets a user from an access token (depends on oauth_2_scheme to parse the token)
async def get_current_user(token: str = Depends(oauth_2_scheme)):
    credential_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    try:
        # decodes and validates the JWT using SECRET_KEY
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # get user that was encoded in the token
        username: str = payload.get("sub")
        if not username:
            raise credential_exception
        # use TokenData model to store the username and validate that the decoded payload matches the schema 
        token_data = TokenData(username=username)
    except JWTError:
        raise credential_exception
    user = get_user(username=token_data.username)
    if not user:
        raise credential_exception
    return user

# [get_current_active_user] checks if a current user is active (can login)
async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user