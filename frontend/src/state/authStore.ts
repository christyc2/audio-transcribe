/* Store the authentication state in the browser's local storage for persistence across page reloads*/

import { create } from 'zustand'; 
import {fetchProfile, loginUser, type UserProfile} from '../api/auth';
import { setAccessToken } from '../api/client';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

export interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  status: AuthStatus;
  error?: string;
  login: (credentials: UserProfile) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
}

const ACCESS_TOKEN_STORAGE_KEY = 'audio-transcribe.accessToken';
/*
 localStorage is the browser’s built-in key/value store that persists data per origin.
 The stored data survives page reloads and browser restarts until explicitly removed.
*/

// [create] makes a custom React hook that contains the Zustand store, an in-memory (in React app) state management library
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  status: 'idle',
  error: undefined,
  login: async (credentials: UserProfile) => {
    // 1. set login status to loading
    set({ status: 'loading', error: undefined });
    try {
      // 2. try to login user using Axios instance to send login request to FastAPI backend
      const token = await loginUser(credentials);
      // 3. update access token in localStorage and module-level access token
      setAccessToken(token.access_token);
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token.access_token);
      const profile = await fetchProfile();
      // 4. set authenticateduser profile to the store
      set({
        user: profile,
        accessToken: token.access_token,
        status: 'authenticated',
        error: undefined,
      });
    } catch (error) {
      // 5. if login fails, remove access token from localStorage and module-level access token
      setAccessToken(null);
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
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
    // 1. remove access token from localStorage and module-level access token
    setAccessToken(null);
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    // 2. reset user profile in auth store
    set({
      user: null,
      accessToken: null,
      status: 'idle',
      error: undefined,
    });
  },
  // hydrate is a function used to restore the auth state from localStorage
  hydrate: async () => {
    // 1. get access token from localStorage
    const storedToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    // 2. if no access token, set module-level access token to null and reset user profile
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
    // 3. set module-level access token to the stored access token
    setAccessToken(storedToken);
    try {
      // 4. fetch user profile from protected endpoint
      const profile = await fetchProfile();
      set({
        user: profile,
        accessToken: storedToken,
        status: 'authenticated',
        error: undefined,
      });
    } catch {
      // 5. if user is not authenticated, remove access token from localStorage and module-level access token
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      setAccessToken(null);
      // 6. reset user profile and status in the auth store
      set({
        user: null,
        accessToken: null,
        status: 'idle',
        error: undefined,
      });
    }
  },
  // setUser is a function used to update the user profile in the store
  setUser: (user: UserProfile | null) => set({ user }),
}));

