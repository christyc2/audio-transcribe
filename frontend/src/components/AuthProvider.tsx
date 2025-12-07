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

// context is a way to pass data through the component tree without having to pass props down manually at every level
// context connects auth store and frontend components
const AuthContext = createContext<AuthState | null>(null);

// AuthProvider is a component that provides the auth context to its children
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const auth = useAuthStore();
  const hydrate = useAuthStore((state) => state.hydrate);

  // hydrate the auth store when the AuthProvider first mounts
  useEffect(() => {
    hydrate().catch(() => {
      // catch errors and do nothing because the store already handles state errors
    });
  }, [hydrate]);

  // AuthContext.Provider is a component that provides the auth context to its children
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// useAuth is a custom React hook that returns the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};