import { Link } from 'react-router-dom';

/**
 * Shared layout wrapper for all auth pages.
 */
export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="mb-8 text-center">
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-lg font-bold text-white">
            A
          </span>
          <span className="text-xl font-bold text-slate-800">OTP Auth</span>
        </Link>
      </div>

      <div className="auth-card">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {children}
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        Secured with JWT &amp; OTP verification
      </p>
    </div>
  );
}
