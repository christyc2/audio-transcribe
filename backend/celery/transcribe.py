from .celery_app import celery_app
import time, os
import tempfile
import boto3
from faster_whisper import WhisperModel
from backend.database.database import SessionLocal
from backend.database.model import Job

s3 = boto3.client("s3")
S3_BUCKET = os.environ["S3_BUCKET"]

# If loading here, then model will be loaded every time this script is loaded. Better to load only when the worker is initialized
_model : WhisperModel | None = None

# @celery_app.task decorator binds the function to the celery app. Set bind=True so the task object is passed to the function
@celery_app.task(bind=True)
def transcribe_audio(self, job_id: str, s3_key: str):
    """Download audio from S3, transcribe it, and update the job status."""
    db = SessionLocal()
    job = None
    result = None
    temp_file_path = None
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return {"job_id": job_id, "error": "Job not found"}
    
        global _model
        if not _model:
            print("Loading model...")
            model_size="tiny"
            _model = WhisperModel(model_size, device="cpu", compute_type="int8")
            print("Model loaded")
        model = _model

        print(f"Processing job {job_id}, downloading from S3: {s3_key}")
        job.status = "processing"
        job.error_message = None
        db.commit()

        # Download file from S3 to a temp file
        extension = os.path.splitext(s3_key)[1]
        with tempfile.NamedTemporaryFile(suffix=extension, delete=False) as tmp:
            temp_file_path = tmp.name
            s3.download_fileobj(S3_BUCKET, s3_key, tmp)
        
        # transcribe with Whisper
        segments, info = model.transcribe(temp_file_path, best_of=5) # segments is a generator so the transcription only starts when you iterate over it
        print("Detected language '%s'" % (info.language))
        result = "".join([segment.text for segment in segments]) # The transcription will actually run here

        # update DB job status to "completed" and store the transcription result
        job.status = "completed"
        job.transcript = result
        db.commit()
    except Exception as exc:
        if job:
            job.status = "failed"
            job.error_message = str(exc)
            db.commit()
        raise
    finally:
        db.close()
        # Clean up temp file
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        
    return {
        "job_id": job_id,
        "transcript": result,
    }