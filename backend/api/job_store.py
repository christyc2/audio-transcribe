import redis
from typing import List, Optional
from backend.api.schemas import Job

# Create a Redis client instance (enable automatic decode to str).
redis_client = redis.Redis.from_url("redis://localhost:6379/0", decode_responses=True)

# [get_job] retrieves a job from the database if it exists.
def get_job(job_id: str) -> Optional[Job]:
    job_data = redis_client.hgetall(f"job:{job_id}")
    if not job_data:
        return None
    return Job.model_validate(job_data)


# [add_job] sets a job in the database.
def add_job(job_id: str, job: Job):
    redis_client.hset(f"job:{job_id}", mapping=job.model_dump())


# [get_all_jobs] retrieves all jobs from the database.
def get_all_jobs() -> List[Job]:
    jobs: List[Job] = []
    for key in redis_client.scan_iter(match=f"job:*"):
        data = redis_client.hgetall(key)
        if not data:
            continue
        jobs.append(Job.model_validate(data))
    return jobs

def update_job(job_id: str, job: Job):
    redis_client.hset(f"job:{job_id}", mapping=job.model_dump())