import uuid
from sqlalchemy import Column, String, DateTime, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from backend.database.database import Base
from sqlalchemy import ForeignKey

class Job(Base):
    __tablename__ = "jobs_table"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    filename = Column(String, nullable=False)
    status = Column(String, nullable=False) # uploaded | processing | completed | failed
    transcript = Column(Text, nullable=True)
    owner = Column(ForeignKey("users_table.id"))
    stored_filename = Column(String, nullable=False)

    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class User(Base):
    __tablename__ = "users_table"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    username = Column(String, nullable=False)
    password = Column(String, nullable=False)
    disabled = Column(Boolean, nullable=True, default=False)

    hashed_password = Column(String, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())