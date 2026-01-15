from celery import Celery
import os

broker_url = os.getenv("REDIS_BROKER_URL")
result_backend = os.getenv("REDIS_BACKEND_URL")

celery_app = Celery(
    "worker",
    broker=broker_url,
    backend=result_backend,
    include=["backend.celery.transcribe"]
)

# Configure Celery to use JSON for serialization and deserialization
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    # result_expires=timedelta(hours=2) # backend result expiration time, default is 1 day
)