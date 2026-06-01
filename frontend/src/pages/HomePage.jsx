import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="text-center max-w-lg">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 text-2xl font-bold text-white mb-6">
          A
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
          Secure Mobile OTP Authentication
        </h1>
        <p className="text-slate-600 mb-8">
          Production-ready auth with password login, OTP verification, JWT tokens, and PostgreSQL.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/login" className="btn-primary inline-block text-center sm:w-auto sm:px-8">
            Sign in
          </Link>
          <Link to="/register" className="btn-secondary inline-block text-center sm:w-auto sm:px-8">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
