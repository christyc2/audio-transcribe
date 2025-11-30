import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
} from 'react';
import { useAuthStore, type AuthState } from '../state/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const auth = useAuthStore();
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate().catch(() => {
      /* swallow errors; store already handles state */
    });
  }, [hydrate]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

