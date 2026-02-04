/**
 * NavBar.tsx is a component that renders the navigation bar at the top of the page.
 * It is used to navigate between the login, register, and dashboard pages.
 * It also displays the current user's username and a logout button if the user is authenticated.
 */
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Button, Flex,AlertDialog } from "@radix-ui/themes";

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
    <header className="border-b border-rose-300/20 bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-white">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white">
          <img src="/logo.png" alt="Logo" className="h-6 w-6" />
          Audio Transcribe
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          {status === 'authenticated' && user ? (
            <>
              <span className="hidden text-neutral-400 sm:inline">
                Signed in as <span className="text-white">{user.username}</span>
              </span>
              <Link
                to="/dashboard"
                className="text-rose-300 transition hover:text-rose-200"
              >
                Dashboard
              </Link>

              <AlertDialog.Root>
                <AlertDialog.Trigger>
                  <Button className="rounded-md border border-rose-300/40 bg-rose-300/10 px-4 py-1 text-rose-300 transition hover:bg-rose-300/20 hover:text-rose-200">Logout</Button>
                </AlertDialog.Trigger>
                <AlertDialog.Content maxWidth="450px">
                  <AlertDialog.Title>Logout</AlertDialog.Title>
                  <AlertDialog.Description size="2">
                    Are you sure you want to logout?
                  </AlertDialog.Description>

                  <Flex gap="3" mt="4" justify="end">
                    <AlertDialog.Cancel>
                      <Button variant="soft" color="gray">
                        Cancel
                      </Button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action>
                      <Button variant="solid" className="rounded-md border border-rose-400/40 bg-rose-400/10 px-4 py-1 text-rose-500 transition hover:bg-rose-500/20 hover:text-rose-400" onClick={handleLogout}>
                        Logout
                      </Button>
                    </AlertDialog.Action>
                  </Flex>
                </AlertDialog.Content>
              </AlertDialog.Root>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-rose-300 transition hover:text-rose-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-md border border-rose-300/40 bg-rose-300/10 px-4 py-1 text-rose-300 transition hover:bg-rose-300/20 hover:text-rose-200"
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

