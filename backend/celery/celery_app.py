from celery import Celery
import os

# broker_url = os.getenv("CELERY_BROKER_URL")
# result_backend = os.getenv("CELERY_RESULT_BACKEND_URL")

celery_app = Celery(
    "worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    include=["backend.celery.transcribe"]
)

# Configure Celery to use JSON for serialization and deserialization
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    # result_expires=timedelta(hours=2) # backend result expiration time, default is 1 day
)