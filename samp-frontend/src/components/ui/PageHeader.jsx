const PageHeader = ({
  title,
  subtitle,
  actions,
  backButton,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

      <div className="flex items-start gap-3">
        {backButton && (
          <div className="mt-0.5">{backButton}</div>
        )}
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && (
            <p className="page-subtitle">{subtitle}</p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}

    </div>
  )
}

export default PageHeader