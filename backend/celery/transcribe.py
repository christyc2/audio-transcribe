from .celery_app import celery_app
import time
from fastapi import HTTPException, status
from faster_whisper import WhisperModel

# If loading here, then model will be loaded every time this script is loaded. Better to load only when the worker is initialized
_model : WhisperModel | None = None

# @celery_app.task decorator binds the function to the celery app. Set bind=True so the task object is passed to the function
@celery_app.task(bind=True)
def transcribe_audio(self, job_id: str, file_path: str, job: dict):
    self.update_state(meta={'job': job})
    
    global _model
    if not _model:
        print("Loading model...")
        model_size="tiny"
        _model = WhisperModel(model_size, device="cpu", compute_type="int8")
        print("Model loaded")
    model = _model

    print(f"Processing job {job_id} from {file_path}")

    # TODO:update DB job status to "processing"
    # job = get_job(job_id)
    # if not job:
    #     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Job {job_id} not found")
    # job.status = "processing"
    # update_job(job_id, job)
    self.update_state(state="STARTED",
                      meta={'job': {**job, 'status': "processing"}})


    # transcribe with Whisper
    segments, info = model.transcribe(file_path, best_of=5) # segments is a generator so the transcription only starts when you iterate over it
    print("Detected language '%s'" % (info.language))
    result = "".join([segment.text for segment in segments]) # The transcription will actually run here
    
    # TODO:update DB job status to "completed" and store the transcription result
    # job.status = "completed"
    # job.transcript = result
    # update_job(job_id, job)
    self.update_state(state="SUCCESS",
                      meta={'job': {**job, 'status': "completed", 'transcript': result}})

    return {
        "job_id": job_id,
        "transcript": result,
    }