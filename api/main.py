"""
FastAPI app setup
"""

from dotenv import load_dotenv
load_dotenv()

import uvicorn
from fastapi import FastAPI
from .routers import authentication, users
from middleware import AuthMiddleware

# Initialize FastAPI object
app = FastAPI()

app.include_router(authentication.router)
app.include_router(users.router)
app.add_middleware(AuthMiddleware)

# # verify the API is running and reachable
# @app.get("/")
# async def health_check():
#     return {"status": "ok", "message": "API is running"}