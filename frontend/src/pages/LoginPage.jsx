import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import MobileInput from '../components/MobileInput';
import OtpInput from '../components/OtpInput';
import LoadingSpinner from '../components/LoadingSpinner';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { showError, showSuccess } from '../utils/errorHandler';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [mode, setMode] = useState('password'); // 'password' | 'otp'
  const [step, setStep] = useState(1); // OTP: 1=mobile, 2=verify
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.loginPassword(mobile, password);
      setAuth(data.data);
      showSuccess('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.sendLoginOtp(mobile);
      showSuccess('OTP sent to your mobile');
      if (data.data?.devOtp) {
        showSuccess(`Dev OTP: ${data.data.devOtp}`);
      }
      setStep(2);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.loginOtp(mobile, otp);
      setAuth(data.data);
      showSuccess('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle={mode === 'otp' ? 'Login with OTP sent to your mobile' : 'Enter your credentials'}
    >
      {/* Mode toggle */}
      <div className="mb-6 flex rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            mode === 'password' ? 'bg-white shadow text-primary-600' : 'text-slate-600'
          }`}
          onClick={() => { setMode('password'); setStep(1); }}
        >
          Password
        </button>
        <button
          type="button"
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            mode === 'otp' ? 'bg-white shadow text-primary-600' : 'text-slate-600'
          }`}
          onClick={() => { setMode('otp'); setStep(1); }}
        >
          OTP
        </button>
      </div>

      {mode === 'password' ? (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <MobileInput value={mobile} onChange={setMobile} disabled={loading} />
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : 'Sign in'}
          </button>
        </form>
      ) : step === 1 ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <MobileInput value={mobile} onChange={setMobile} disabled={loading} />
          <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <p className="text-sm text-slate-600">
            OTP sent to <span className="font-medium">+91 {mobile}</span>
            <button type="button" className="ml-2 text-primary-600 hover:underline" onClick={() => setStep(1)}>
              Change
            </button>
          </p>
          <OtpInput value={otp} onChange={setOtp} disabled={loading} />
          <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : 'Verify & Sign in'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            disabled={loading}
            onClick={handleSendOtp}
          >
            Resend OTP
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
