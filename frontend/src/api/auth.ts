/**
 * auth.ts provides helper functions to interact with the authentication API endpoints.
 */

import api from './client';

export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
}

export interface UserProfile {
  username: string;
  password: string;
  disabled?: boolean | null;
}

export const registerUser = async (payload: UserProfile) => {
  // redirect to register endpoint by calling api.post, which returns the new user profile
  const { data } = await api.post<UserProfile>('/auth/register', payload);
  return data;
};

export const loginUser = async (payload: UserProfile) => {
  // login requires form-encoded credentials
  const formData = new URLSearchParams();
  formData.append('username', payload.username);
  formData.append('password', payload.password);
  // redirects login request to login endpoint,which authenticates the user and returns JWT token
  const { data } = await api.post<TokenResponse>('/auth/login', formData, {
    // explicitly override default json header with form-encoded header
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return data;
};

export const fetchProfile = async () => {
  const { data } = await api.get<UserProfile>('/users/me/');
  return data;
};

