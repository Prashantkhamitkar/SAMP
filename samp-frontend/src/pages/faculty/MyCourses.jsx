import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Plus, BookMarked, Users,
  Edit, Award, Search
} from 'lucide-react'
import { getFacultyCoursesApi } from '../../api/facultyApi'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import SearchBar from '../../components/ui/SearchBar'
import { PageLoader } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'

const MyCourses = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['facultyCourses'],
    queryFn:  () => getFacultyCoursesApi().then((r) => r.data.data),
  })

  const filtered = courses.filter((c) =>
    c.courseName.toLowerCase().includes(search.toLowerCase()) ||
    c.courseCode.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">

      <PageHeader
        title="My Courses"
        subtitle={`${courses.length} course${courses.length !== 1 ? 's' : ''} assigned to you`}
        actions={
          <Button
            icon={Plus}
            onClick={() => navigate('/faculty/courses/new')}
          >
            New Course
          </Button>
        }
      />

      {courses.length > 0 && (
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by course name or code..."
          className="max-w-md"
        />
      )}

      {filtered.length === 0 && courses.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="No courses yet"
          description="Create your first course so students can enroll."
          actionLabel="Create Course"
          onAction={() => navigate('/faculty/courses/new')}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No courses match your search"
          description="Try a different course name or code."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onGrades={() => navigate(`/faculty/courses/${course.id}/grades`)}
              onEdit={() => navigate(`/faculty/courses/${course.id}/edit`)}
              onRoster={() => navigate(`/faculty/courses/${course.id}/grades`)}
            />
          ))}
        </div>
      )}

    </div>
  )
}

const CourseCard = ({ course, onGrades, onEdit }) => {
  const pct = course.maxCapacity > 0
    ? (course.enrolledCount / course.maxCapacity) * 100
    : 0

  const barColor =
    pct >= 100 ? 'bg-red-400' :
    pct >= 80  ? 'bg-amber-400' :
    'bg-emerald-400'

  return (
    <div className="card hover:shadow-card-hover transition-all duration-200">

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              {course.courseCode}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full
              ${course.active
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                : 'bg-slate-100 text-slate-400'}`}>
              {course.active ? '● Active' : '○ Inactive'}
            </span>
          </div>
          <h3 className="text-base font-semibold text-slate-900 leading-snug">
            {course.courseName}
          </h3>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-slate-900">
            {course.credits}
          </p>
          <p className="text-xs text-slate-400">credits</p>
        </div>
      </div>

      {/* Description */}
      {course.description && (
        <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
          {course.description}
        </p>
      )}

      {/* Enrollment progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Enrollment
          </span>
          <span className="text-xs font-semibold text-slate-700">
            {course.enrolledCount}
            <span className="text-slate-400 font-normal"> / {course.maxCapacity}</span>
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-slate-400">
            {course.availableSeats} seats available
          </span>
          <span className="text-xs font-medium text-slate-500">
            {Math.round(pct)}% full
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-slate-400 mb-4 pb-4 border-b border-slate-100">
        <span>📅 {course.semester}</span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          icon={Award}
          className="flex-1"
          onClick={onGrades}
        >
          Grade Entry
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={Users}
          className="flex-1"
          onClick={onGrades}
        >
          Roster
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={Edit}
          onClick={onEdit}
        >
          Edit
        </Button>
      </div>

    </div>
  )
}

export default MyCourses