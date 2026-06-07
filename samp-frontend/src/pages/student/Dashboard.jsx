import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, ClipboardList, Award,
  Bell, TrendingUp, ChevronRight,
  GraduationCap, Calendar
} from 'lucide-react'
import { getStudentDashboardApi } from '../../api/studentApi'
import { selectUser } from '../../store/slices/authSlice'
import StatCard from '../../components/ui/StatCard'
import { PageLoader } from '../../components/ui/Spinner'
import { GradeBadge, EnrollmentStatusBadge } from '../../components/ui/Badge'
import { formatGpa, timeAgo, formatDate } from '../../utils/helpers'

const NOTIF_ICONS = {
  GRADE_POSTED:         { icon: Award,        bg: 'bg-emerald-50', color: 'text-emerald-600' },
  GRADE_UPDATED:        { icon: TrendingUp,   bg: 'bg-blue-50',    color: 'text-blue-600'    },
  ENROLLMENT_CONFIRMED: { icon: ClipboardList, bg: 'bg-primary-50', color: 'text-primary-600' },
  COURSE_DROPPED:       { icon: BookOpen,     bg: 'bg-red-50',     color: 'text-red-600'     },
  GENERAL:              { icon: Bell,         bg: 'bg-slate-100',  color: 'text-slate-500'   },
}

const StudentDashboard = () => {
  const navigate = useNavigate()
  const user     = useSelector(selectUser)

  const { data, isLoading } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn:  () => getStudentDashboardApi().then((r) => r.data.data),
  })

  if (isLoading) return <PageLoader />

  const gpa                = data?.gpa ?? 0
  const activeEnrollments  = data?.activeEnrollments ?? 0
  const totalCreditsEarned = data?.totalCreditsEarned ?? 0
  const unread             = data?.unreadNotifications ?? 0
  const notifications      = data?.recentNotifications ?? []
  const currentEnrollments = data?.currentEnrollments ?? []

  const getGpaColor = (g) =>
    g >= 3.5 ? 'text-emerald-600' :
    g >= 2.5 ? 'text-blue-600'    :
    g >= 1.5 ? 'text-amber-600'   : 'text-red-600'

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-primary-200 text-sm font-medium">Welcome back,</p>
            <h1 className="text-2xl font-bold mt-0.5">{user?.fullName}</h1>
            <p className="text-primary-200 text-sm mt-1">
              {data?.major && `${data.major} · `}
              {data?.studentNumber && `ID: ${data.studentNumber}`}
            </p>
          </div>
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current GPA"
          value={
            <span className={`text-3xl font-bold ${getGpaColor(gpa)}`}>
              {formatGpa(gpa)}
            </span>
          }
          subtitle="out of 4.00"
          icon={TrendingUp}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Active Courses"
          value={activeEnrollments}
          subtitle="enrolled this semester"
          icon={BookOpen}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Credits Earned"
          value={totalCreditsEarned}
          subtitle="total credits"
          icon={Award}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Notifications"
          value={unread}
          subtitle="unread messages"
          icon={Bell}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Current enrollments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Current Enrollments
            </h2>
            <button
              onClick={() => navigate('/student/enrollments')}
              className="text-xs text-primary-600 font-medium flex items-center gap-1 hover:text-primary-700"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {currentEnrollments.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <BookOpen className="w-10 h-10 text-slate-200 mb-2" />
              <p className="text-sm text-slate-400">No active enrollments</p>
              <button
                onClick={() => navigate('/student/courses')}
                className="mt-3 text-xs text-primary-600 font-medium hover:underline"
              >
                Browse courses →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {currentEnrollments.slice(0, 5).map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {e.courseName}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {e.courseCode} · {e.facultyName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-xs text-slate-400">
                      {e.credits} cr
                    </span>
                    <GradeBadge grade={e.grade} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent notifications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Recent Notifications
            </h2>
            <button
              onClick={() => navigate('/notifications')}
              className="text-xs text-primary-600 font-medium flex items-center gap-1 hover:text-primary-700"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Bell className="w-10 h-10 text-slate-200 mb-2" />
              <p className="text-sm text-slate-400">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => {
                const config = NOTIF_ICONS[n.type] || NOTIF_ICONS.GENERAL
                const Icon   = config.icon
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-colors
                      ${!n.read ? 'bg-primary-50 border border-primary-100' : 'bg-slate-50'}`}
                  >
                    <div className={`w-8 h-8 ${config.bg} rounded-lg flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 leading-snug">
                        {n.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-1" />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/student/courses')}
          className="card flex items-center gap-4 hover:border-primary-200 hover:shadow-card-hover transition-all text-left"
        >
          <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Browse Courses</p>
            <p className="text-sm text-slate-400 mt-0.5">
              Explore and enroll in available courses
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 ml-auto" />
        </button>

        <button
          onClick={() => navigate('/student/grades')}
          className="card flex items-center gap-4 hover:border-primary-200 hover:shadow-card-hover transition-all text-left"
        >
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">View Grades</p>
            <p className="text-sm text-slate-400 mt-0.5">
              Check your grades and GPA
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 ml-auto" />
        </button>
      </div>

    </div>
  )
}

export default StudentDashboard