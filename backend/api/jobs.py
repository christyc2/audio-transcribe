import os
import uuid
from pathlib import Path
from typing import List
from backend.database.model import Job
from fastapi import HTTPException, status, UploadFile, Depends
from backend.celery.transcribe import transcribe_audio
from backend.database.database import SessionLocal, get_db

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB
ALLOWED_CONTENT_PREFIX = "audio/"

job_ids: list[str] = []

# [create_job] validates the uploaded file and returns a Job object.
async def create_job(owner: str, file: UploadFile, db: SessionLocal = Depends(get_db)) -> dict:
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
        filename=original_name,
        status="uploaded",
        transcript="",
        owner=owner,
        stored_filename=stored_filename
    )

    # add the job to the database
    db.add(job)
    # commit the transaction
    db.commit()
    # After db.commit(), SQLAlchemy expires in‑memory objects, so refresh the job object to get the id
    db.refresh(job)
    job_id = str(job.id)
    
    """ Add job_id into Celery queue, which uses Redis as the broker. 
    delay() schedules the job to be executed asynchronously.
    Returns AsyncResult object that can be used to get the result of the job. 
    Do not wait for the transcription to complete, return the job record immediately 
    to avoid blocking. When the transcription is complete, the result will be updated 
    in the Redis result backend by the worker.
    """
    transcribe_audio.delay(job_id, str(saved_path)) 

    return {
        "job_id": job_id,
        "filename": original_name,
        "status": job.status,
        "transcript": job.transcript,
        "owner": job.owner,
        "stored_filename": job.stored_filename,
        "error_message": job.error_message,
    }

# [list_jobs] returns all jobs that belong to the given owner
def list_jobs(owner: str, db: SessionLocal = Depends(get_db)) -> List[dict]:
    jobs = (
        db.query(Job)
        .filter(Job.owner == owner)
        .order_by(Job.created_at.desc())
        .all()
    )

    return [
        {
            "job_id": str(job.id),
            "filename": job.filename,
            "status": job.status,
            "transcript": job.transcript,
            "owner": job.owner,
            "stored_filename": job.stored_filename,
            "error_message": job.error_message,
        }
        for job in jobs
    ]

def get_job(job_id: str) -> dict:
    db = SessionLocal()
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "job_id": str(job.id),
        "filename": job.filename,
        "status": job.status,
        "transcript": job.transcript,
        "owner": job.owner,
        "stored_filename": job.stored_filename,
        "error_message": job.error_message,
    }
