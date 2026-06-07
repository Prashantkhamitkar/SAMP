const VARIANTS = {
  green:  'bg-emerald-50 text-emerald-700 border border-emerald-100',
  blue:   'bg-blue-50 text-blue-700 border border-blue-100',
  red:    'bg-red-50 text-red-700 border border-red-100',
  amber:  'bg-amber-50 text-amber-700 border border-amber-100',
  purple: 'bg-purple-50 text-purple-700 border border-purple-100',
  gray:   'bg-slate-100 text-slate-600 border border-slate-200',
  navy:   'bg-navy-600 text-white border border-navy-700',
}

const SIZES = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
}

const Badge = ({
  children,
  variant = 'gray',
  size = 'md',
  dot = false,
  className = '',
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${VARIANTS[variant] || VARIANTS.gray}
        ${SIZES[size]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'green'  ? 'bg-emerald-500' :
            variant === 'blue'   ? 'bg-blue-500'    :
            variant === 'red'    ? 'bg-red-500'      :
            variant === 'amber'  ? 'bg-amber-500'   :
            variant === 'purple' ? 'bg-purple-500'  :
            'bg-slate-400'
          }`}
        />
      )}
      {children}
    </span>
  )
}

// Pre-built status badges
export const EnrollmentStatusBadge = ({ status }) => {
  const map = {
    ACTIVE:    { variant: 'green',  label: 'Active'    },
    DROPPED:   { variant: 'red',    label: 'Dropped'   },
    COMPLETED: { variant: 'blue',   label: 'Completed' },
  }
  const config = map[status] || { variant: 'gray', label: status }
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  )
}

export const GradeBadge = ({ grade }) => {
  const map = {
    A: 'green', B: 'blue', C: 'amber',
    D: 'amber', F: 'red',  I: 'gray', W: 'gray',
  }
  if (!grade) return <span className="text-slate-400 text-xs">Not posted</span>
  return <Badge variant={map[grade] || 'gray'}>{grade}</Badge>
}

export const RoleBadge = ({ role }) => {
  const map = {
    STUDENT: { variant: 'blue',   label: 'Student'       },
    FACULTY: { variant: 'green',  label: 'Faculty'       },
    ADMIN:   { variant: 'purple', label: 'Administrator' },
  }
  const config = map[role] || { variant: 'gray', label: role }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

export const ActiveBadge = ({ active }) => (
  <Badge variant={active ? 'green' : 'red'} dot>
    {active ? 'Active' : 'Inactive'}
  </Badge>
)

export default Badge