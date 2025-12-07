import os
import uuid
from pathlib import Path
from typing import List
from .schemas import Job
from fastapi import HTTPException, status, UploadFile
from backend.api.job_store import add_job, get_all_jobs

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB
ALLOWED_CONTENT_PREFIX = "audio/"

# [create_job] validates the uploaded file and returns a Job object.
async def create_job(owner: str, file: UploadFile) -> Job:
    from backend.celery.transcribe import transcribe_audio
   
    if not file.content_type or not file.content_type.startswith(ALLOWED_CONTENT_PREFIX):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}. Please upload an audio file.",
        )
    
    # check if file is too large 
    if file.size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is too large. Please upload a file smaller than 5MB.",
        )

    # generate job ID, file's original name, extension, and stored filename
    contents = await file.read()
    job_id = str(uuid.uuid4())
    original_name = file.filename or "audio-file"
    extension = os.path.splitext(original_name)[1]
    stored_filename = f"{job_id}{extension}"
    saved_path = UPLOAD_DIR / stored_filename

    # opens/create the file in binary write mode
    with open(saved_path, "wb") as buffer:
        # write raw bytes from file.read() to filesystem
        buffer.write(contents)

    job = Job(
        job_id=job_id,
        filename=original_name,
        status="uploaded",
        transcript="",
        owner=owner,
        stored_filename=stored_filename
    )
    add_job(job_id, job)

    # Add job_id into Celery queue, which uses Redis as the broker. delay() schedules the job to be executed asynchronously.
    transcribe_audio.delay(job_id, str(saved_path))
    # Do not wait for the transcription to complete, return the job record immediately to avoid blocking.
    # When the transcription is complete, the result will be updated in the database by the worker.

    return job

# [list_jobs] returns all jobs that belong to the given owner
def list_jobs(owner: str) -> List[Job]:
    return [job for job in get_all_jobs() if job.owner == owner]
