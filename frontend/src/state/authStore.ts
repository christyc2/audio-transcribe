import { create } from 'zustand';
import {
  fetchProfile,
  loginUser,
  type LoginPayload,
  type UserProfile,
} from '../api/auth';
import { setAccessToken } from '../api/client';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

export interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  status: AuthStatus;
  error?: string;
  login: (credentials: LoginPayload) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
}

const ACCESS_TOKEN_STORAGE_KEY = 'audio-transcribe.accessToken';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  status: 'idle',
  error: undefined,
  login: async (credentials: LoginPayload) => {
    set({ status: 'loading', error: undefined });
    try {
      const token = await loginUser(credentials);
      setAccessToken(token.access_token);
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token.access_token);
      const profile = await fetchProfile();
      set({
        user: profile,
        accessToken: token.access_token,
        status: 'authenticated',
        error: undefined,
      });
    } catch (error) {
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      setAccessToken(null);
      set({
        user: null,
        accessToken: null,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unable to login',
      });
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    setAccessToken(null);
    set({
      user: null,
      accessToken: null,
      status: 'idle',
      error: undefined,
    });
  },
  hydrate: async () => {
    const storedToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!storedToken) {
      setAccessToken(null);
      set({
        accessToken: null,
        user: null,
        status: 'idle',
        error: undefined,
      });
      return;
    }
    if (get().status === 'loading') {
      return;
    }
    set({
      status: 'loading',
      error: undefined,
    });
    setAccessToken(storedToken);
    try {
      const profile = await fetchProfile();
      set({
        user: profile,
        accessToken: storedToken,
        status: 'authenticated',
        error: undefined,
      });
    } catch {
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      setAccessToken(null);
      set({
        user: null,
        accessToken: null,
        status: 'idle',
        error: undefined,
      });
    }
  },
  setUser: (user: UserProfile | null) => set({ user }),
}));

