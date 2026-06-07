import { ButtonSpinner } from './Spinner'

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
}) => {
  const base = `
    inline-flex items-center justify-center gap-2 font-medium
    rounded-lg transition-all duration-150 active:scale-[0.98]
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  const variants = {
    primary:   'bg-primary-600 text-white hover:bg-primary-700 shadow-sm',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm',
    danger:    'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    ghost:     'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    success:   'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
    warning:   'bg-amber-500 text-white hover:bg-amber-600 shadow-sm',
    outline:   'border border-primary-600 text-primary-600 hover:bg-primary-50',
  }

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${base}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <>
          <ButtonSpinner />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left'  && <Icon className="w-4 h-4 shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  )
}

export default Button