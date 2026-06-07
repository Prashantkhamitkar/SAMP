import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getMyEnrollmentsApi,
  dropCourseApi,
} from '../../api/studentApi'
import PageHeader from '../../components/ui/PageHeader'
import Table from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import { EnrollmentStatusBadge, GradeBadge } from '../../components/ui/Badge'
import { ConfirmModal } from '../../components/ui/Modal'
import { PageLoader } from '../../components/ui/Spinner'
import { formatDate } from '../../utils/helpers'

const StudentEnrollments = () => {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()

  const [dropping, setDropping]     = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [activeTab, setActiveTab]   = useState('ACTIVE')

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['myEnrollments'],
    queryFn:  () => getMyEnrollmentsApi().then((r) => r.data.data),
  })

  const { mutate: drop, isPending: dropLoading } = useMutation({
    mutationFn: (courseId) => dropCourseApi(courseId),
    onSuccess: () => {
      toast.success('Course dropped successfully')
      queryClient.invalidateQueries({ queryKey: ['myEnrollments'] })
      queryClient.invalidateQueries({ queryKey: ['studentDashboard'] })
      setConfirmOpen(false)
      setDropping(null)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to drop course')
      setConfirmOpen(false)
    },
  })

  const handleDropClick = (enrollment) => {
    setDropping(enrollment)
    setConfirmOpen(true)
  }

  const filtered = enrollments.filter((e) => e.status === activeTab)

  const tabs = [
    { key: 'ACTIVE',    label: 'Active',    count: enrollments.filter(e => e.status === 'ACTIVE').length    },
    { key: 'COMPLETED', label: 'Completed', count: enrollments.filter(e => e.status === 'COMPLETED').length },
    { key: 'DROPPED',   label: 'Dropped',   count: enrollments.filter(e => e.status === 'DROPPED').length   },
  ]

  const columns = [
    {
      key:   'courseCode',
      title: 'Code',
      width: 'w-28',
      render: (val) => (
        <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">
          {val}
        </span>
      ),
    },
    {
      key:   'courseName',
      title: 'Course Name',
      render: (val, row) => (
        <div>
          <p className="font-medium text-slate-900">{val}</p>
          <p className="text-xs text-slate-400 mt-0.5">{row.facultyName}</p>
        </div>
      ),
    },
    {
      key:    'credits',
      title:  'Credits',
      width:  'w-20',
      render: (val) => (
        <span className="text-sm font-medium text-slate-600">{val} cr</span>
      ),
    },
    {
      key:    'semester',
      title:  'Semester',
      width:  'w-32',
      render: (val) => (
        <span className="text-sm text-slate-500">{val}</span>
      ),
    },
    {
      key:    'grade',
      title:  'Grade',
      width:  'w-24',
      render: (val) => <GradeBadge grade={val} />,
    },
    {
      key:    'status',
      title:  'Status',
      width:  'w-28',
      render: (val) => <EnrollmentStatusBadge status={val} />,
    },
    {
      key:    'enrolledAt',
      title:  'Enrolled',
      width:  'w-32',
      render: (val) => (
        <span className="text-xs text-slate-400">{formatDate(val)}</span>
      ),
    },
    {
      key:    'actions',
      title:  '',
      width:  'w-24',
      render: (_, row) =>
        row.status === 'ACTIVE' ? (
          <Button
            variant="danger"
            size="xs"
            onClick={() => handleDropClick(row)}
          >
            Drop
          </Button>
        ) : null,
    },
  ]

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">

      <PageHeader
        title="My Enrollments"
        subtitle={`${enrollments.length} total enrollment records`}
        actions={
          <Button
            variant="primary"
            icon={BookOpen}
            onClick={() => navigate('/student/courses')}
          >
            Browse Courses
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-150
              ${activeTab === tab.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'}
            `}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                ${activeTab === tab.key
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-slate-200 text-slate-500'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filtered}
        loading={isLoading}
        emptyMessage={`No ${activeTab.toLowerCase()} enrollments`}
        emptyIcon={ClipboardList}
      />

      {/* Confirm drop */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setDropping(null) }}
        onConfirm={() => drop(dropping?.courseId)}
        title="Drop Course"
        message={`Are you sure you want to drop ${dropping?.courseName}? This action cannot be undone.`}
        confirmLabel="Yes, Drop Course"
        variant="danger"
        loading={dropLoading}
      />

    </div>
  )
}

export default StudentEnrollments