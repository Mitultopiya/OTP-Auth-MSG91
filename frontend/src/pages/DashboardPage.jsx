import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';
import { showError, showSuccess } from '../utils/errorHandler';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await authService.getProfile();
        setProfile(data.data);
      } catch (err) {
        showError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      showSuccess('Logged out successfully');
      navigate('/login');
    } catch (err) {
      showError(err);
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const displayUser = profile || user;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
              A
            </span>
            <span className="font-semibold text-slate-800">OTP Auth</span>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 flex items-center gap-2"
          >
            {loggingOut ? <LoadingSpinner size="sm" /> : 'Logout'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-slate-100">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Welcome, {displayUser?.fullName || 'User'}!
          </h1>
          <p className="text-slate-500 text-sm mb-8">Your profile is protected by JWT authentication.</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <ProfileField label="Full Name" value={displayUser?.fullName} />
            <ProfileField label="Mobile Number" value={`+91 ${displayUser?.mobileNumber}`} />
            <ProfileField
              label="Mobile Verified"
              value={displayUser?.isMobileVerified ? 'Yes' : 'Pending'}
            />
            <ProfileField
              label="Member Since"
              value={
                displayUser?.createdAt
                  ? new Date(displayUser.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '—'
              }
            />
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-primary-50 border border-primary-100 p-4 text-sm text-primary-800">
          <strong>Security features active:</strong> bcrypt passwords, JWT access tokens, refresh
          tokens, OTP rate limiting, and login audit logs.
        </div>
      </main>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value || '—'}</p>
    </div>
  );
}
