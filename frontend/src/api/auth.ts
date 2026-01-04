/**
 * auth.ts provides helper functions to interact with the authentication API endpoints.
 * Uses the auto-generated OpenAPI SDK instead of direct axios calls.
 */

import { getAuthApi, getUsersApi, handleError } from './sdkClient';
import type { User, Token } from './sdk';

// Re-export types from SDK for backward compatibility
export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
}

export interface UserProfile {
  username: string;
  password: string;
  disabled?: boolean | null;
}

export const registerUser = async (payload: UserProfile): Promise<UserProfile> => {
  try {
    const authApi = getAuthApi();
    // The generated SDK method is registerAuthRegisterPost
    // We need to pass the User object (which matches UserProfile)
    const response = await authApi.registerAuthRegisterPost(payload as User);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const loginUser = async (payload: UserProfile): Promise<TokenResponse> => {
  try {
    const authApi = getAuthApi();
    // The generated method is loginForAccessTokenAuthLoginPost
    // It accepts username and password as separate parameters (handles form encoding internally)
    const response = await authApi.loginForAccessTokenAuthLoginPost(
      payload.username,
      payload.password
    );
    const tokenData = response.data as Token;
    return {
      access_token: tokenData.access_token,
      token_type: tokenData.token_type as 'bearer',
    };
  } catch (error) {
    return handleError(error);
  }
};

export const fetchProfile = async (): Promise<UserProfile> => {
  try {
    const usersApi = getUsersApi();
    // The generated method is readUsersMeUsersMeGet
    const response = await usersApi.readUsersMeUsersMeGet();
    const user = response.data as User;
    return {
      username: user.username,
      password: '', // Password should not be returned, but maintaining interface
      disabled: user.disabled ?? null,
    };
  } catch (error) {
    return handleError(error);
  }
};

