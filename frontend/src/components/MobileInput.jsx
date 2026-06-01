/**
 * Indian mobile number input with +91 prefix.
 */
export default function MobileInput({ value, onChange, disabled, id = 'mobile' }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        Mobile Number
      </label>
      <div className="flex rounded-lg border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500">
        <span className="inline-flex items-center bg-slate-100 px-3 text-sm text-slate-600 border-r border-slate-300">
          +91
        </span>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="9876543210"
          className="flex-1 border-0 px-4 py-2.5 text-sm focus:outline-none focus:ring-0"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
          disabled={disabled}
          required
        />
      </div>
    </div>
  );
}
