/**
 * 6-digit OTP input field.
 */
export default function OtpInput({ value, onChange, disabled }) {
  return (
    <div>
      <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-slate-700">
        OTP Code
      </label>
      <input
        id="otp"
        type="text"
        inputMode="numeric"
        maxLength={6}
        placeholder="Enter 6-digit OTP"
        className="input-field text-center tracking-[0.5em] font-mono text-lg"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        disabled={disabled}
        required
      />
      <p className="mt-1 text-xs text-slate-400">OTP expires in 5 minutes</p>
    </div>
  );
}
