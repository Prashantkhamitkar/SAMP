import Spinner from './Spinner'
import { SearchX } from 'lucide-react'

const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon: EmptyIcon = SearchX,
}) => {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-100 shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full">

          {/* Header */}
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`
                    px-4 py-3 text-left table-header
                    ${col.width ? col.width : ''}
                  `}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Spinner size="lg" />
                    <p className="text-sm text-slate-400">Loading data...</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <EmptyIcon className="w-10 h-10 text-slate-200" />
                    <p className="text-sm text-slate-400">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className="bg-white hover:bg-slate-50 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`table-cell ${col.className || ''}`}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key] ?? '—'
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  )
}

export default Table