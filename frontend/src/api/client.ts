/**
 * client.ts creates an instance of axios with the base URL of the API, and sets the headers to json.
 * It also provides `setAccessToken` helper function to update the stored token, or clear it if token = null.
 * It also provides `AuthError` class to handle authentication errors.
 */

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

/* Create an instance of axios with the base URL of the API, and set the headers to json.
   This api instance will be used to make requests to the FastAPI backend
*/
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api', // should read API base URL from .env
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios interceptors are functions that run before and after a request is made.
/* Every time the frontend calls api.get(...)/api.post(...), this interceptor runs first. 
If setAccessToken has stored a token, the interceptor injects Authorization: Bearer <token> 
so protected FastAPI routes see the JWT. */
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/* Every time the frontend receives a response from the backend, this interceptor runs.
If the backend responds with HTTP 401, the interceptor rejects the promise with 
AuthError('Unauthorized', 401) (custom error class). */
api.interceptors.response.use(
  (response: AxiosResponse) => response, // success handler (returns the response)
  (error: AxiosError) => { // error handler
    // If server responded with HTTP 401, reject the promise with AuthError('Unauthorized', 401)
    if (error.response?.status === 401) {
      return Promise.reject(new AuthError('Unauthorized', 401));
    }
    return Promise.reject(error);
  },
);

export default api;

