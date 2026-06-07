const Spinner = ({ size = 'md', color = 'primary' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
    xl: 'w-14 h-14 border-4',
  }
  const colors = {
    primary: 'border-primary-600 border-t-transparent',
    white:   'border-white border-t-transparent',
    slate:   'border-slate-400 border-t-transparent',
  }

  return (
    <div
      className={`
        ${sizes[size]} ${colors[color]}
        rounded-full animate-spin inline-block
      `}
    />
  )
}

export const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
    <Spinner size="lg" />
    <p className="text-sm text-slate-400">Loading...</p>
  </div>
)

export const ButtonSpinner = () => (
  <Spinner size="sm" color="white" />
)

export default Spinner