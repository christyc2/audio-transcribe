import api from './client';

export interface RegisterPayload {
  username: string;
  password: string;
  disabled?: boolean;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
}

export interface UserProfile {
  username: string;
  password: string;
  disabled?: boolean | null;
}

export interface UserItem {
  item_id: string;
  owner: string;
}

export const registerUser = async (payload: RegisterPayload) => {
  const { data } = await api.post<UserProfile>('/auth/register', payload);
  return data;
};

export const loginUser = async (payload: LoginPayload) => {
  const formData = new URLSearchParams();
  formData.append('username', payload.username);
  formData.append('password', payload.password);

  const { data } = await api.post<TokenResponse>('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return data;
};

export const fetchProfile = async () => {
  const { data } = await api.get<UserProfile>('/users/me/');
  return data;
};

export const fetchUserItems = async () => {
  const { data } = await api.get<UserItem[]>('/users/me/items/');
  return data;
};

