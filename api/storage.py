from schemas import *
# [get_user] retrieves the user from the database if they are registered.
# [db] is the database, [username] is the provided username
def get_user(db, username: str):
    if username in db:
        user_data = db[username]
        # Initialize UserInDB model
        return UserInDB(**user_data)

def create_user(db, user: User):
    if get_user(db, user.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    # add user to database (store hashed password, not plain password)
    db[user.username] = {
        "username": user.username,
        "password": user.password,
        "hashed_password": get_password_hash(user.password),
        "disabled": user.disabled if user.disabled is not None else False
    }
    return {"message": "User registered successfully", "db": db[user.username]}

db = {
    "test_user": {
        "username": "test_user",
        "password": "test_pw",
        "hashed_password": "$2b$12$T4zeOFFUxxQhJNchdpS.Gua72SbPBt/3pQuSBW4ELqAOdTrcOUQ5u",
        "disabled": False
    }
}