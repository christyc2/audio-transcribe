import { Link, useLocation } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';

const Login = () => {
  const location = useLocation();
  // treat state object like it has registered property, if it exists from the router state, set registered to true
  const registered = Boolean((location.state as { registered?: boolean })?.registered);

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-12 text-white">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-rose-300/30 bg-rose-300/20 p-8 shadow-xl shadow-rose-300/20">
        <h1 className="text-2xl font-semibold text-white">Log in</h1>
        <p className="mt-1 text-sm text-neutral-400">
          New here?{' '}
          <Link to="/register" className="text-rose-300 hover:text-rose-200">
            Create an account
          </Link>
        </p>
        {registered ? (
          <div className="mt-3 rounded-md border border-rose-300/40 bg-rose-300/10 px-3 py-2 text-sm text-rose-300">
            Account created! You can log in now.
          </div>
        ) : null}
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;

