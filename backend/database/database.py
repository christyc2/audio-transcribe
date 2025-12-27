import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
load_dotenv()

database_url = os.getenv("DATABASE_URL")

if not database_url:
    raise RuntimeError("DATABASE_URL environment variable is not set.")

# Engine used throughout the app (and by Alembic) for connection resources.
engine = create_engine(database_url, pool_pre_ping=True)

# Session for maintaining ORM objects
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# A base class that is given a metaclass that produces appropriate Table objects and makes appropriate Mapper calls
Base = declarative_base()

# Yields a database session for each FastAPI request 
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() # close the session