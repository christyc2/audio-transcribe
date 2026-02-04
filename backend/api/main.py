"""
FastAPI app setup
"""

from dotenv import load_dotenv

load_dotenv()

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import authentication, users
from .middleware import AuthMiddleware
from backend.database.database import Base, engine

# Initialize FastAPI object
app = FastAPI()

# Allow frontend (Vite dev server) to call the API from a different origin
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://audio-transcribe-five.vercel.app",
    "https://audio-transcribe-christyc2s-projects.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # includes OPTIONS for preflight
    allow_headers=["*"],
)

app.include_router(authentication.router)
app.include_router(users.router)
app.add_middleware(AuthMiddleware)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, port=8000)