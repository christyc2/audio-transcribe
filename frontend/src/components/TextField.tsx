// TextField.tsx is a reusable text input component that can be used in the application
import { forwardRef, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/* forwardRef is a React hook that allows a component to receive a ref from its parent, but I can 
later remove the ref and forwardRef wrapper is never used
*/
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-200">
      <span>{label}</span>
      <input
        ref={ref}
        className={`w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-base text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </label>
  ),
);

TextField.displayName = 'TextField';

