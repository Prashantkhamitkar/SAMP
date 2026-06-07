import { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'

const Textarea = forwardRef(({
  label,
  error,
  hint,
  rows = 4,
  required = false,
  disabled = false,
  placeholder,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          input-field resize-none
          ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''}
          ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}
        `}
        {...props}
      />

      {error && (
        <p className="form-error flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="form-hint">{hint}</p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export default Textarea