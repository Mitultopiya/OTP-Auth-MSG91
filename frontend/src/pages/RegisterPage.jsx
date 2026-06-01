import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import MobileInput from '../components/MobileInput';
import OtpInput from '../components/OtpInput';
import LoadingSpinner from '../components/LoadingSpinner';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { showError, showSuccess } from '../utils/errorHandler';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showError({ message: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    try {
      const { data } = await authService.sendRegisterOtp(mobile);
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.register({
        fullName,
        mobileNumber: mobile,
        password,
        otp,
      });
      setAuth(data.data);
      showSuccess('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle={step === 1 ? 'Enter your details to get started' : 'Verify your mobile number'}
    >
      {step === 1 ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-slate-700">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              className="input-field"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              required
              minLength={2}
            />
          </div>
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
              minLength={8}
            />
            <p className="mt-1 text-xs text-slate-400">
              Min 8 chars, uppercase, lowercase, and number
            </p>
          </div>
          <div>
            <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-slate-700">
              Confirm Password
            </label>
            <input
              id="confirm"
              type="password"
              className="input-field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : 'Send OTP & Continue'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <p className="text-sm text-slate-600">
            Enter OTP sent to <span className="font-medium">+91 {mobile}</span>
          </p>
          <OtpInput value={otp} onChange={setOtp} disabled={loading} />
          <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : 'Verify & Create Account'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => setStep(1)} disabled={loading}>
            Back
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
