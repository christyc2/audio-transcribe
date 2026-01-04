/**
 * jobs.ts provides helper functions to interact with the jobs API endpoints.
 * Uses the auto-generated OpenAPI SDK instead of direct axios calls.
 * It provides `uploadJob` helper function to upload a new job to the backend.
 * It also provides `fetchUserJobs` helper function to fetch the list of jobs for the current user.
 */
import { getUsersApi, handleError } from './sdkClient';
import type { Job } from './sdk';

// Re-export interface for backward compatibility
export interface UserJob {
  job_id: string;
  filename: string;
  status: string;
  transcript?: string | null;
  owner: string;
}

// Helper to convert SDK Job type to UserJob interface
const jobToUserJob = (job: Job): UserJob => ({
  job_id: job.job_id,
  filename: job.filename,
  status: job.status,
  transcript: job.transcript ?? null,
  owner: job.owner,
});

export const uploadJob = async (file: File): Promise<UserJob> => {
  try {
    const usersApi = getUsersApi();
    // The generated method is uploadJobUsersMeJobsPost
    // It accepts a File directly (handles multipart/form-data internally)
    const response = await usersApi.uploadJobUsersMeJobsPost(file);
    const job = response.data as Job;
    return jobToUserJob(job);
  } catch (error) {
    return handleError(error);
  }
};

// [fetchUserJobs] fetches the list of jobs for the current user
export const fetchUserJobs = async (): Promise<UserJob[]> => {
  try {
    const usersApi = getUsersApi();
    // The generated method is readJobsUsersMeJobsGet
    const response = await usersApi.readJobsUsersMeJobsGet();
    const jobs = (response.data as Job[]) || [];
    return jobs.map(jobToUserJob);
  } catch (error) {
    return handleError(error);
  }
};

