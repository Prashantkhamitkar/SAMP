import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, Filter, Download } from 'lucide-react'
import { getAllEnrollmentsApi } from '../../api/adminApi'
import { getAllCoursesAdminApi } from '../../api/adminApi'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Table from '../../components/ui/Table'
import { GradeBadge, EnrollmentStatusBadge } from '../../components/ui/Badge'
import { PageLoader } from '../../components/ui/Spinner'
import { formatDate } from '../../utils/helpers'

const AdminReports = () => {
  const [courseFilter, setCourseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['adminEnrollments'],
    queryFn:  () => getAllEnrollmentsApi().then((r) => r.data.data),
  })

  const { data: courses = [] } = useQuery({
    queryKey: ['adminCourses'],
    queryFn:  () => getAllCoursesAdminApi().then((r) => r.data.data),
  })

  const courseOptions = [
    ...new Map(
      courses.map((c) => [c.id, { value: c.id.toString(), label: `${c.courseCode} — ${c.courseName}` }])
    ).values(),
  ]

  const STATUS_OPTIONS = [
    { value: 'ACTIVE',    label: 'Active'    },
    { value: 'DROPPED',   label: 'Dropped'   },
    { value: 'COMPLETED', label: 'Completed' },
  ]

  const filtered = enrollments.filter((e) => {
    const matchCourse = courseFilter ? e.courseId?.toString() === courseFilter : true
    const matchStatus = statusFilter ? e.status === statusFilter : true
    return matchCourse && matchStatus
  })

  // Grade distribution stats
  const gradeStats = ['A', 'B', 'C', 'D', 'F', 'I', 'W'].map((g) => ({
    grade: g,
    count: filtered.filter((e) => e.grade === g).length,
  }))
  const totalGraded = filtered.filter((e) => e.grade).length
  const totalActive  = filtered.filter((e) => e.status === 'ACTIVE').length
  const totalDropped = filtered.filter((e) => e.status === 'DROPPED').length

  // CSV export
  const handleExport = () => {
    const headers = [
      'Student Name', 'Student ID', 'Course Code',
      'Course Name', 'Semester', 'Status', 'Grade', 'Enrolled Date',
    ]
    const rows = filtered.map((e) => [
      e.studentName, e.studentNumber, e.courseCode,
      e.courseName, e.semester, e.status,
      e.grade || 'Not Posted', formatDate(e.enrolledAt),
    ])
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `samp-enrollment-report-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast?.success?.('Report exported')
  }

  const columns = [
    {
      key:   'studentName',
      title: 'Student',
      render: (val, row) => (
        <div>
          <p className="font-medium text-slate-900 text-sm">{val}</p>
          <p className="text-xs text-slate-400 font-mono">{row.studentNumber}</p>
        </div>
      ),
    },
    {
      key:   'courseCode',
      title: 'Course',
      width: 'w-28',
      render: (val, row) => (
        <div>
          <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">
            {val}
          </span>
          <p className="text-xs text-slate-400 mt-1">{row.courseName}</p>
        </div>
      ),
    },
    {
      key:   'facultyName',
      title: 'Faculty',
      width: 'w-36',
      render: (val) => <span className="text-sm text-slate-500">{val}</span>,
    },
    {
      key:   'semester',
      title: 'Semester',
      width: 'w-28',
      render: (val) => <span className="text-xs text-slate-500">{val}</span>,
    },
    {
      key:   'status',
      title: 'Status',
      width: 'w-28',
      render: (val) => <EnrollmentStatusBadge status={val} />,
    },
    {
      key:   'grade',
      title: 'Grade',
      width: 'w-20',
      render: (val) => <GradeBadge grade={val} />,
    },
    {
      key:   'enrolledAt',
      title: 'Enrolled',
      width: 'w-28',
      render: (val) => (
        <span className="text-xs text-slate-400">{formatDate(val)}</span>
      ),
    },
  ]

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">

      <PageHeader
        title="Enrollment Reports"
        subtitle="View and export all enrollment and grade data"
        actions={
          <Button
            variant="secondary"
            icon={Download}
            onClick={handleExport}
          >
            Export CSV
          </Button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Records',  value: enrollments.length, color: 'text-slate-900'    },
          { label: 'Active',         value: totalActive,         color: 'text-emerald-600'  },
          { label: 'Dropped',        value: totalDropped,        color: 'text-red-600'      },
          { label: 'Grades Posted',  value: totalGraded,         color: 'text-primary-600'  },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Grade distribution */}
      <div className="card">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">
          Grade Distribution
        </h3>
        <div className="flex items-end gap-3 flex-wrap">
          {gradeStats.map(({ grade, count }) => {
            const pct = totalGraded > 0 ? (count / totalGraded) * 100 : 0
            const color =
              grade === 'A' ? 'bg-emerald-400' :
              grade === 'B' ? 'bg-blue-400'    :
              grade === 'C' ? 'bg-amber-400'   :
              grade === 'D' ? 'bg-orange-400'  :
              grade === 'F' ? 'bg-red-400'     :
              'bg-slate-300'

            return (
              <div key={grade} className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-slate-700">{count}</span>
                <div className="w-10 bg-slate-100 rounded-t-sm" style={{ height: '60px' }}>
                  <div
                    className={`w-full ${color} rounded-t-sm transition-all duration-500`}
                    style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                  />
                </div>
                <GradeBadge grade={grade} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <Select
          label="Filter by Course"
          options={courseOptions}
          placeholder="All courses"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="w-72"
        />
        <Select
          label="Filter by Status"
          options={STATUS_OPTIONS}
          placeholder="All statuses"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-48"
        />
        {(courseFilter || statusFilter) && (
          <Button
            variant="ghost"
            onClick={() => { setCourseFilter(''); setStatusFilter('') }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filtered}
        loading={isLoading}
        emptyMessage="No enrollment records found"
        emptyIcon={BarChart3}
      />

    </div>
  )
}

export default AdminReports