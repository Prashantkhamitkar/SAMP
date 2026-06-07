const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = 'bg-primary-50',
  iconColor = 'text-primary-600',
  trend,
  trendLabel,
  className = '',
}) => {
  return (
    <div className={`stat-card ${className}`}>
      <div className="flex items-start justify-between">

        {/* Text content */}
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 truncate">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">
            {value ?? '—'}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              trend > 0 ? 'text-emerald-600' :
              trend < 0 ? 'text-red-600' :
              'text-slate-400'
            }`}>
              <span>
                {trend > 0 ? '↑' : trend < 0 ? '↓' : '—'}
                {trendLabel}
              </span>
            </div>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center shrink-0 ml-3`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        )}

      </div>
    </div>
  )
}

export default StatCard