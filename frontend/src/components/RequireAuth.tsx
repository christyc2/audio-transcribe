/**
 * RequireAuth.tsx is a component that checks if the user is authenticated and redirects to the login page if not.
 * It is used to protect routes that require authentication.
 */

import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface RequireAuthProps {
  children: ReactNode;
}

// RequireAuth checks at current route level if the user is authenticated
export const RequireAuth = ({ children }: RequireAuthProps) => {
  const auth = useAuth();
  const location = useLocation();

  // if auth status is loading, show loading spinner
  if (auth.status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="animate-spin rounded-full border-4 border-slate-700 border-t-sky-400 p-4" />
      </div>
    );
  }

  // if user is not authenticated or does not have a user profile, redirect to login page
  if (auth.status !== 'authenticated' || !auth.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

