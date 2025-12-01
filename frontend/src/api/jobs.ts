import api from './client';

export interface UserJob {
  job_id: string;
  filename: string;
  status: string;
  transcript?: string | null;
}

export const uploadJob = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<UserJob>('/users/me/jobs/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
};

export const fetchUserJobs = async () => {
  const { data } = await api.get<UserJob[]>('/users/me/jobs/');
  return data;
};

