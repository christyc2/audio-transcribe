import { Link } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';

const Register = () => (
  <div className="min-h-screen bg-neutral-950 px-4 py-12 text-white">
    <div className="mx-auto w-full max-w-md rounded-2xl border border-rose-300/30 bg-rose-300/20 p-8 shadow-xl shadow-rose-300/20">
      <h1 className="text-2xl font-semibold text-white">Create an account</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Already registered?{' '}
        <Link to="/login" className="text-rose-300 hover:text-rose-200">
           Log in
        </Link>
      </p>
      <div className="mt-6">
        <RegisterForm />
      </div>
    </div>
  </div>
);

export default Register;

