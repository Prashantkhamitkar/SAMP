import { Search, X } from 'lucide-react'

const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10 pr-9"
      />
      {value && (
        <button
          onClick={() => { onChange(''); onClear?.() }}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default SearchBar