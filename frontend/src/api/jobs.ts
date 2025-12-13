/**
 * jobs.ts provides helper functions to interact with the jobs API endpoints.
 * It provides `uploadJob` helper function to upload a new job to the backend.
 * It also provides `fetchUserJobs` helper function to fetch the list of jobs for the current user.
 */
import api from './client';

export interface UserJob {
  job_id: string;
  filename: string;
  status: string;
  transcript?: string | null;
  owner: string;
}

export const uploadJob = async (file: File) => {
  // create a new FormData object to send the file to the backend
  const formData = new FormData();
  formData.append('file', file);

  // send the file to the backend via a POST request in multipart/form-data format
  const { data } = await api.post<UserJob>('/users/me/jobs/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
};

// [fetchUserJobs] fetches the list of jobs for the current user
export const fetchUserJobs = async () => {
  // send a GET request to the backend to fetch the list of jobs
  const { data } = await api.get<UserJob[]>('/users/me/jobs/');
  return data;
};

