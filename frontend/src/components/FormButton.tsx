import { type ButtonHTMLAttributes } from 'react';

interface FormButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const FormButton = ({
  loading = false,
  children,
  className = '',
  ...props
}: FormButtonProps) => (
  <button
    className={`flex w-full items-center justify-center rounded-md bg-rose-300 px-4 py-2 text-base font-semibold text-neutral-950 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    disabled={loading} 
    {...props}
  >
    {loading ? 'Please wait...' : children} {/* if submission in progress, show 'Please wait...' */}
  </button>
);

