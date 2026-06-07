import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Users, BookOpen, ClipboardList,
  BarChart3, Calendar, ChevronRight,
  GraduationCap, UserCheck, TrendingUp,
  Shield
} from 'lucide-react'
import { getAdminDashboardApi } from '../../api/adminApi'
import { selectUser } from '../../store/slices/authSlice'
import StatCard from '../../components/ui/StatCard'
import { PageLoader } from '../../components/ui/Spinner'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const user     = useSelector(selectUser)

  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn:  () => getAdminDashboardApi().then((r) => r.data.data),
  })

  if (isLoading) return <PageLoader />

  const NAV_CARDS = [
    {
      title:       'User Management',
      description: 'Create, edit and manage all student and faculty accounts',
      icon:        Users,
      path:        '/admin/users',
      bg:          'bg-blue-50',
      color:       'text-blue-600',
      border:      'hover:border-blue-200',
      stat:        `${data?.totalStudents ?? 0} students · ${data?.totalFaculty ?? 0} faculty`,
    },
    {
      title:       'Course Management',
      description: 'Manage the full course catalog for all semesters',
      icon:        BookOpen,
      path:        '/admin/courses',
      bg:          'bg-emerald-50',
      color:       'text-emerald-600',
      border:      'hover:border-emerald-200',
      stat:        `${data?.totalActiveCourses ?? 0} active · ${data?.totalCourses ?? 0} total`,
    },
    {
      title:       'Enrollment Reports',
      description: 'View all enrollment records and grade distributions',
      icon:        BarChart3,
      path:        '/admin/reports',
      bg:          'bg-purple-50',
      color:       'text-purple-600',
      border:      'hover:border-purple-200',
      stat:        `${data?.totalActiveEnrollments ?? 0} active enrollments`,
    },
    {
      title:       'Academic Calendar',
      description: 'Manage semester dates, enrollment windows and deadlines',
      icon:        Calendar,
      path:        '/admin/calendar',
      bg:          'bg-amber-50',
      color:       'text-amber-600',
      border:      'hover:border-amber-200',
      stat:        'Manage semesters',
    },
  ]

  return (
    <div className="space-y-6">

      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-800 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-purple-300 text-sm font-medium">
              Administrator Panel
            </p>
            <h1 className="text-2xl font-bold mt-0.5">
              {user?.fullName}
            </h1>
            <p className="text-purple-300 text-sm mt-1">
              Full system access · SAMP v1.0
            </p>
          </div>
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
            <Shield className="w-9 h-9 text-white" />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={data?.totalStudents ?? 0}
          subtitle="registered accounts"
          icon={GraduationCap}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Total Faculty"
          value={data?.totalFaculty ?? 0}
          subtitle="active faculty members"
          icon={UserCheck}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Active Courses"
          value={data?.totalActiveCourses ?? 0}
          subtitle={`of ${data?.totalCourses ?? 0} total`}
          icon={BookOpen}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Active Enrollments"
          value={data?.totalActiveEnrollments ?? 0}
          subtitle="across all courses"
          icon={TrendingUp}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* Navigation grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {NAV_CARDS.map((card) => (
          <button
            key={card.path}
            onClick={() => navigate(card.path)}
            className={`card flex items-center gap-4 text-left transition-all
              hover:shadow-card-hover ${card.border}`}
          >
            <div className={`w-14 h-14 ${card.bg} rounded-2xl flex items-center justify-center shrink-0`}>
              <card.icon className={`w-7 h-7 ${card.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900">{card.title}</p>
              <p className="text-sm text-slate-400 mt-0.5 leading-snug">
                {card.description}
              </p>
              <p className={`text-xs font-medium mt-1.5 ${card.color}`}>
                {card.stat}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
          </button>
        ))}
      </div>

    </div>
  )
}

export default AdminDashboard