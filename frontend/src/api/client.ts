/**
 * client.ts provides backward compatibility exports for the migration to SDK.
 * The AuthError class is kept here for use by the SDK wrapper.
 * setAccessToken is re-exported from sdkClient.ts to maintain existing imports.
 * 
 * Note: Direct axios usage has been replaced with the auto-generated OpenAPI SDK.
 * See sdkClient.ts for the new SDK-based implementation.
 */

// AuthError class for handling authentication errors
export class AuthError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

// Re-export setAccessToken from sdkClient for backward compatibility
// This allows existing code (like authStore.ts) to continue importing from './client'
export { setAccessToken } from './sdkClient';

