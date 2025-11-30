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
    className={`flex w-full items-center justify-center rounded-md bg-sky-500 px-4 py-2 text-base font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading ? 'Please wait…' : children}
  </button>
);

