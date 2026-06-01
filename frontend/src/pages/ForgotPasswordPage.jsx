import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import MobileInput from '../components/MobileInput';
import OtpInput from '../components/OtpInput';
import LoadingSpinner from '../components/LoadingSpinner';
import authService from '../services/authService';
import { showError, showSuccess } from '../utils/errorHandler';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.sendForgotPasswordOtp(mobile);
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

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showError({ message: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword({
        mobileNumber: mobile,
        otp,
        newPassword,
      });
      showSuccess('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle={step === 1 ? 'We will send an OTP to your registered mobile' : 'Enter OTP and new password'}
    >
      {step === 1 ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <MobileInput value={mobile} onChange={setMobile} disabled={loading} />
          <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <OtpInput value={otp} onChange={setOtp} disabled={loading} />
          <div>
            <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-slate-700">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              className="input-field"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              required
              minLength={8}
            />
          </div>
          <div>
            <label htmlFor="confirmNew" className="mb-1.5 block text-sm font-medium text-slate-700">
              Confirm New Password
            </label>
            <input
              id="confirmNew"
              type="password"
              className="input-field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : 'Reset Password'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-600">
        <Link to="/login" className="font-medium text-primary-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
