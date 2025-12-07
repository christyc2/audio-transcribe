import { type ChangeEvent, useState } from 'react';
import { TextField } from './TextField';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  name?: string;
  placeholder?: string;
  autoComplete?: string;
}

export const PasswordField = ({
  label,
  value,
  onChange,
  error,
  name,
  placeholder,
  autoComplete,
}: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <TextField
        label={label}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        error={error}
        name={name}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      {/* Button toggles password visibility via setShowPassword */}
      <button
        type="button"
        className="absolute right-3 top-9 text-xs font-semibold uppercase text-sky-400"
        onClick={() => setShowPassword((prev) => !prev)}
      >
        {showPassword ? 'Hide' : 'Show'}
      </button>
    </div>
  );
};

