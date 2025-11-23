from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

# Data encoded by token
class TokenData(BaseModel):
    username: str | None = None

class User(BaseModel):
    username: str
    password: str
    disabled: bool | None = None

class UserInDB(User):
    hashed_password: str

    