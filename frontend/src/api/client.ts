import axios, { type AxiosError, type AxiosResponse } from 'axios';

let accessToken: string | null = null;

export class AuthError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

// [setAccessToken] updates the stored token, or clears it if token = null
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// Create an instance of axios with the base URL of the API, and set the headers to json
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api', // should read API base URL from .env
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response, // success handler
  (error: AxiosError) => { // error handler
    // if server responded with HTTP 401, reject the promise with AuthError('Unauthorized', 401)
    if (error.response?.status === 401) {
      return Promise.reject(new AuthError('Unauthorized', 401));
    }
    return Promise.reject(error);
  },
);

export default api;

