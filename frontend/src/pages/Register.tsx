import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';

const Register = () => (
  <div className="min-h-screen bg-slate-950 px-4 py-12 text-white">
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl shadow-slate-900/40">
      <h1 className="text-2xl font-semibold">Create an account</h1>
      <p className="mt-1 text-sm text-slate-400">
        Already registered?{' '}
        <Link to="/login" className="text-sky-400 hover:text-sky-300">
          Sign in
        </Link>
      </p>
      <div className="mt-6">
        <RegisterForm />
      </div>
    </div>
  </div>
);

export default Register;

