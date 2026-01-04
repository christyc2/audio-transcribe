/**
 * sdkClient.ts provides a wrapper around the auto-generated OpenAPI SDK.
 * It configures authentication, error handling, and provides a convenient interface
 * for interacting with the FastAPI backend.
 */

import { Configuration, AuthenticationApi, UsersApi } from './sdk';
import { AuthError } from './client';

let accessToken: string | null = null;

// [setAccessToken] updates the stored token, or clears it if token = null
export const setAccessToken = (token: string | null) => {
  accessToken = token;
  // Invalidate API instances so they get recreated with new token
  authApiInstance = null;
  usersApiInstance = null;
};

// Get the base URL from environment variable or use default
const getBaseURL = () => {
  return import.meta.env.VITE_API_BASE_URL ?? '/api';
};

// Create SDK configuration with authentication
// The SDK uses OAuth2PasswordBearer, which can accept accessToken as a string or function
// Using a function allows dynamic token retrieval
const createConfiguration = (): Configuration => {
  return new Configuration({
    basePath: getBaseURL(),
    accessToken: accessToken || undefined,
  });
};

// Create API instances (lazy initialization)
let authApiInstance: AuthenticationApi | null = null;
let usersApiInstance: UsersApi | null = null;

const getAuthApi = (): AuthenticationApi => {
  if (!authApiInstance) {
    authApiInstance = new AuthenticationApi(createConfiguration());
  } else {
    // Update configuration in case token changed
    authApiInstance.configuration = createConfiguration();
  }
  return authApiInstance;
};

const getUsersApi = (): UsersApi => {
  if (!usersApiInstance) {
    usersApiInstance = new UsersApi(createConfiguration());
  } else {
    // Update configuration in case token changed
    usersApiInstance.configuration = createConfiguration();
  }
  return usersApiInstance;
};

// Helper to handle SDK errors and convert to AuthError when appropriate
// The generated SDK uses Axios, so errors will have the Axios error structure
const handleError = (error: unknown): never => {
  if (error && typeof error === 'object') {
    // Check for Axios error structure
    if ('response' in error) {
      const axiosError = error as { response?: { status?: number; data?: unknown } };
      if (axiosError.response?.status === 401) {
        throw new AuthError('Unauthorized', 401);
      }
      // For other HTTP errors, we might want to extract a user-friendly message
      if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
        const errorData = axiosError.response.data as { detail?: string; message?: string };
        const errorMessage = errorData.detail || errorData.message || 'An error occurred';
        throw new Error(errorMessage);
      }
    }
    // Check for Axios request errors (network errors, etc.)
    if ('request' in error && !('response' in error)) {
      throw new Error('Network error: Unable to reach the server');
    }
  }
  // Re-throw other errors as-is
  throw error;
};

// Export API instances and error handler
export { getAuthApi, getUsersApi, handleError };

