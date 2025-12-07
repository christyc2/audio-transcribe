import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { registerUser } from '../api/auth';
import { TextField } from './TextField';
import { PasswordField } from './PasswordField';
import { FormButton } from './FormButton';
import { FormError } from './FormError';

export const RegisterForm = () => {
  // useNavigate is a React hook that returns a navigate function so components can change the current route from event handlers
  const navigate = useNavigate();  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    // check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords must match.');
      return;
    }
    // set isSubmitting is true to disable the submit button and show 'Please wait...'
    setIsSubmitting(true);
    try {
      // hits register endpoint, which creates a new user
      await registerUser({ username, password });
      // redirect to login page with if successful registration
      navigate('/login', { replace: true, state: { registered: true } });
    } catch (err) {
      if (isAxiosError(err)) {
        const detail =
          err.response?.data?.detail ??
          err.response?.data?.message ??
          'Unable to register right now.';
        setError(
          typeof detail === 'string' ? detail : 'Unable to register right now.'); // set error message
      } else {
        setError('Unable to register right now.');
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
        placeholder="Enter a username"
        autoComplete="username"
      />
      <PasswordField
        label="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        name="password"
        placeholder="Create a password"
        autoComplete="new-password"
      />
      <PasswordField
        label="Confirm password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        name="confirmPassword"
        placeholder="Repeat your password"
        autoComplete="new-password"
        error={password && confirmPassword && password !== confirmPassword ? 'Passwords must match.' : undefined}
      />
      <FormError message={error} />
      <FormButton type="submit" loading={isSubmitting}>
        Create account
      </FormButton>
    </form>
  );
};

