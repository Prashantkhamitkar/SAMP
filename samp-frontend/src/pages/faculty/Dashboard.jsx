import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  BookMarked, Users, Clock,
  ChevronRight, GraduationCap,
  BarChart3, Plus
} from 'lucide-react'
import { getFacultyDashboardApi } from '../../api/facultyApi'
import { selectUser } from '../../store/slices/authSlice'
import StatCard from '../../components/ui/StatCard'
import Button from '../../components/ui/Button'
import { PageLoader } from '../../components/ui/Spinner'

const FacultyDashboard = () => {
  const navigate = useNavigate()
  const user     = useSelector(selectUser)

  const { data, isLoading } = useQuery({
    queryKey: ['facultyDashboard'],
    queryFn:  () => getFacultyDashboardApi().then((r) => r.data.data),
  })

  if (isLoading) return <PageLoader />

  const courses       = data?.myCourses       ?? []
  const totalStudents = data?.totalStudentsEnrolled ?? 0
  const pendingGrades = data?.pendingGradeEntries   ?? 0

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-emerald-200 text-sm font-medium">
              Faculty Portal
            </p>
            <h1 className="text-2xl font-bold mt-0.5">
              {user?.fullName}
            </h1>
            <p className="text-emerald-200 text-sm mt-1">
              {data?.department && `${data.department}`}
              {data?.title && ` · ${data.title}`}
            </p>
          </div>
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="My Courses"
          value={courses.length}
          subtitle="assigned this semester"
          icon={BookMarked}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Total Students"
          value={totalStudents}
          subtitle="across all courses"
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Pending Grades"
          value={pendingGrades}
          subtitle="awaiting grade entry"
          icon={Clock}
          iconBg={pendingGrades > 0 ? 'bg-amber-50' : 'bg-slate-50'}
          iconColor={pendingGrades > 0 ? 'text-amber-600' : 'text-slate-400'}
        />
      </div>

      {/* Pending grades alert */}
      {pendingGrades > 0 && (
        <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              {pendingGrades} grade{pendingGrades !== 1 ? 's' : ''} pending
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Students are waiting for their grades to be posted
            </p>
          </div>
          <Button
            variant="warning"
            size="sm"
            onClick={() => navigate('/faculty/courses')}
          >
            Enter Grades
          </Button>
        </div>
      )}

      {/* My courses */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-slate-900">
            My Courses
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate('/faculty/courses/new')}
            >
              New Course
            </Button>
            <button
              onClick={() => navigate('/faculty/courses')}
              className="text-xs text-primary-600 font-medium flex items-center gap-1 hover:text-primary-700"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center py-10">
            <BookMarked className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-sm text-slate-400 mb-3">
              No courses assigned yet
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate('/faculty/courses/new')}
            >
              Create your first course
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.slice(0, 6).map((course) => (
              <div
                key={course.id}
                className="border border-slate-100 rounded-xl p-4 hover:border-emerald-200 hover:shadow-card transition-all"
              >
                {/* Course code */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {course.courseCode}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                    ${course.active
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-slate-100 text-slate-400'}`}>
                    {course.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Name */}
                <h3 className="text-sm font-semibold text-slate-900 leading-snug mb-3">
                  {course.courseName}
                </h3>

                {/* Enrollment bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Enrolled</span>
                    <span className="font-medium">
                      {course.enrolledCount}/{course.maxCapacity}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        course.enrolledCount === course.maxCapacity
                          ? 'bg-red-400'
                          : course.enrolledCount / course.maxCapacity >= 0.8
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{
                        width: `${Math.min(
                          (course.enrolledCount / course.maxCapacity) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Credits + semester */}
                <p className="text-xs text-slate-400 mb-4">
                  {course.credits} credits · {course.semester}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="xs"
                    className="flex-1"
                    onClick={() =>
                      navigate(`/faculty/courses/${course.id}/grades`)
                    }
                  >
                    Grades
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="flex-1"
                    onClick={() =>
                      navigate(`/faculty/courses/${course.id}/edit`)
                    }
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/faculty/courses/new')}
          className="card flex items-center gap-4 hover:border-emerald-200 hover:shadow-card-hover transition-all text-left"
        >
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
            <Plus className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Create New Course</p>
            <p className="text-sm text-slate-400 mt-0.5">
              Add a course for students to enroll in
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 ml-auto" />
        </button>

        <button
          onClick={() => navigate('/faculty/courses')}
          className="card flex items-center gap-4 hover:border-blue-200 hover:shadow-card-hover transition-all text-left"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Manage Courses</p>
            <p className="text-sm text-slate-400 mt-0.5">
              View rosters and manage enrollments
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 ml-auto" />
        </button>
      </div>

    </div>
  )
}

export default FacultyDashboard