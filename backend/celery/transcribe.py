from .celery_app import celery_app
import time
from backend.api.job_store import get_job, update_job
from fastapi import HTTPException, status

# @celery_app.task decorator binds the function to the celery app. Set bind=True so the task object is passed to the function
@celery_app.task(bind=True)
def transcribe_audio(self, job_id: str, file_path: str):
    print(f"Processing job {job_id} from {file_path}")

    # update DB job status to "processing"
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Job {job_id} not found")
    job.status = "processing"
    update_job(job_id, job)

    # TODO: transcribe with Whisper
    # Simulate task for now
    time.sleep(10)

    result = f"Temporary transcription result for job {job_id}"

    # update DB job status to "completed" and store the transcription result
    job.status = "completed"
    job.transcript = result
    update_job(job_id, job)

    return