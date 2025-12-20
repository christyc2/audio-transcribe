import os
import uuid
from pathlib import Path
from typing import List
from .schemas import Job
from fastapi import HTTPException, status, UploadFile
from celery.result import AsyncResult
from backend.celery.transcribe import transcribe_audio

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB
ALLOWED_CONTENT_PREFIX = "audio/"

# Track celery tasks alongside the originating Job so we can surface metadata
# even before the worker has populated result.info.
job_task_id_map = dict()

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

    """ Add job_id into Celery queue, which uses Redis as the broker. 
    delay() schedules the job to be executed asynchronously.
    Returns AsyncResult object that can be used to get the result of the job. 
    Do not wait for the transcription to complete, return the job record immediately 
    to avoid blocking. When the transcription is complete, the result will be updated 
    in the Redis result backend by the worker.
    """
    result = transcribe_audio.delay(job_id, str(saved_path), job.model_dump()) 

    job_task_id_map[job_id] = {"task_id": result.id, "job": job}

    return job

# [list_jobs] returns all jobs that belong to the given owner
def list_jobs(owner: str) -> List[Job]:
    jobs = []
    for job_id, entry in job_task_id_map.items():
        task_id = entry.get("task_id")
        base_job = entry.get("job")
        result = transcribe_audio.AsyncResult(task_id)
        jobs.append(Job.model_validate(result.info.get('job')) if result.info else base_job)

    return [job for job in jobs if job.owner == owner]

def map_celery_state(state: str) -> str:
    return {
        "PENDING": "uploaded",
        "STARTED": "processing",
        "SUCCESS": "completed",
        "FAILURE": "failed",
    }.get(state, "unknown")

def get_job(job_id: str) -> dict:
    task_id = job_task_id_map.get(job_id, None)
    if not task_id:
        raise HTTPException(status_code=404, detail="Job not found")
    result = transcribe_audio.AsyncResult(task_id)
    status = map_celery_state(result.state)
    if status == "completed":
        return result.info.get('job')
    if status == "failure":
        return {
            "job_id": job_id,
            "status": status,
            "error": str(result.result)
        }
    return {
        "job_id": job_id,
        "status": status
    }
