import { forwardRef, useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

const Input = forwardRef(({
  label,
  error,
  hint,
  icon: Icon,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType  = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={`w-full ${className}`}>

      {/* Label */}
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Left icon */}
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            input-field
            ${Icon ? 'pl-10' : ''}
            ${isPassword ? 'pr-10' : ''}
            ${error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20'
              : ''}
            ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}
          `}
          {...props}
        />

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword
              ? <EyeOff className="w-4 h-4" />
              : <Eye className="w-4 h-4" />
            }
          </button>
        )}

        {/* Error icon */}
        {error && !isPassword && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-400 pointer-events-none">
            <AlertCircle className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="form-error flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}

      {/* Hint */}
      {hint && !error && (
        <p className="form-hint">{hint}</p>
      )}

    </div>
  )
})

Input.displayName = 'Input'

export default Input