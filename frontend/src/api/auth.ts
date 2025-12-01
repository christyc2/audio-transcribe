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
  const { data } = await api.post<UserProfile>('/auth/register', payload);
  return data;
};

export const loginUser = async (payload: UserProfile) => {
  const formData = new URLSearchParams();
  formData.append('username', payload.username);
  formData.append('password', payload.password);
  // login requires form-encoded credentials and returns JWT token
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

