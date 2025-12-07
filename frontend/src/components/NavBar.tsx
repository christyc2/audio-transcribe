/**
 * NavBar.tsx is a component that renders the navigation bar at the top of the page.
 * It is used to navigate between the login, register, and dashboard pages.
 * It also displays the current user's username and a logout button if the user is authenticated.
 */
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export const NavBar = () => {
  const { status, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const hideNav = location.pathname === '/login' || location.pathname === '/register';
  if (hideNav) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-white">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          Audio Transcribe
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          {status === 'authenticated' && user ? (
            <>
              <span className="hidden text-slate-400 sm:inline">
                Signed in as <span className="text-white">{user.username}</span>
              </span>
              <Link
                to="/dashboard"
                className="text-sky-400 transition hover:text-sky-300"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-md border border-slate-700 px-4 py-1 text-slate-200 transition hover:border-slate-500"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sky-400 transition hover:text-sky-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-md border border-slate-700 px-4 py-1 text-slate-200 transition hover:border-slate-500"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

