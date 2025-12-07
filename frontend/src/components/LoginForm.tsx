import { type FormEvent, useState } from 'react';
import { useNavigate, useLocation, type Location } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { TextField } from './TextField';
import { PasswordField } from './PasswordField';
import { FormButton } from './FormButton';
import { FormError } from './FormError';
import { useAuth } from './AuthProvider';

export const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  // useLocation is a React hook that returns the current location object, which contains the current URL and its parameters
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // React handles form submission different from default, so prevent
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ username, password });
      const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (isAxiosError(err)) {
        const detail =
          err.response?.data?.detail ??
          err.response?.data?.message ??
          'Incorrect username or password.';
        setError(
          typeof detail === 'string'
            ? detail
            : 'Incorrect username or password.',
        );
      } else {
        setError(err instanceof Error ? err.message : 'Unable to sign in.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextField
        label="Username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        name="username"
        placeholder="Enter your username"
        autoComplete="username"
      />
      <PasswordField
        label="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        name="password"
        placeholder="Enter your password"
        autoComplete="current-password"
      />
      <FormError message={error} />
      <FormButton type="submit" loading={isSubmitting}>
        Log in
      </FormButton>
    </form>
  );
};

