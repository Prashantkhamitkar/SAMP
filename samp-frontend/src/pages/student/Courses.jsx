import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Users, Award, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getStudentCoursesApi,
  enrollCourseApi,
  getMyEnrollmentsApi,
} from '../../api/studentApi'
import PageHeader from '../../components/ui/PageHeader'
import SearchBar from '../../components/ui/SearchBar'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { ConfirmModal } from '../../components/ui/Modal'
import { PageLoader } from '../../components/ui/Spinner'
import { getSeatsBadgeClass, truncate } from '../../utils/helpers'

const CourseCard = ({ course, isEnrolled, onEnroll, enrolling }) => {
  const seatsBadge = getSeatsBadgeClass(
    course.availableSeats,
    course.maxCapacity
  )
  const isFull = course.availableSeats === 0

  return (
    <div className="card hover:shadow-card-hover transition-all duration-200 flex flex-col">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">
              {course.courseCode}
            </span>
            <Badge variant={course.active ? 'green' : 'gray'} size="sm">
              {course.active ? 'Open' : 'Closed'}
            </Badge>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mt-2 leading-snug">
            {course.courseName}
          </h3>
        </div>
      </div>

      {/* Description */}
      {course.description && (
        <p className="text-xs text-slate-500 leading-relaxed mb-3">
          {truncate(course.description, 80)}
        </p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-3 mb-4 mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Award className="w-3.5 h-3.5 text-slate-400" />
          {course.credits} credit{course.credits !== 1 ? 's' : ''}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className={`font-medium ${
            isFull ? 'text-red-600' :
            course.availableSeats <= 5 ? 'text-amber-600' :
            'text-emerald-600'
          }`}>
            {isFull ? 'Full' : `${course.availableSeats} seats left`}
          </span>
          <span className="text-slate-300">·</span>
          <span>{course.enrolledCount}/{course.maxCapacity}</span>
        </div>
      </div>

      {/* Faculty */}
      <p className="text-xs text-slate-400 mb-4 truncate">
        👨‍🏫 {course.facultyName}
      </p>

      {/* Semester */}
      <p className="text-xs text-slate-400 mb-4">
        📅 {course.semester}
      </p>

      {/* Action */}
      {isEnrolled ? (
        <div className="w-full py-2 text-center text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-100">
          ✓ Enrolled
        </div>
      ) : (
        <Button
          variant={isFull ? 'secondary' : 'primary'}
          fullWidth
          disabled={isFull || !course.active}
          loading={enrolling}
          onClick={() => onEnroll(course)}
          size="sm"
        >
          {isFull ? 'Course Full' : 'Enroll Now'}
        </Button>
      )}

    </div>
  )
}

const StudentCourses = () => {
  const queryClient = useQueryClient()
  const [search, setSearch]         = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['studentCourses'],
    queryFn:  () => getStudentCoursesApi().then((r) => r.data.data),
  })

  const { data: enrollments = [] } = useQuery({
    queryKey: ['myEnrollments'],
    queryFn:  () => getMyEnrollmentsApi().then((r) => r.data.data),
  })

  const enrolledCourseIds = new Set(
    enrollments
      .filter((e) => e.status === 'ACTIVE')
      .map((e) => e.courseId)
  )

  const { mutate: enroll, isPending: enrolling } = useMutation({
    mutationFn: (courseId) => enrollCourseApi(courseId),
    onSuccess: () => {
      toast.success(`Successfully enrolled in ${selectedCourse?.courseName}!`)
      queryClient.invalidateQueries({ queryKey: ['myEnrollments'] })
      queryClient.invalidateQueries({ queryKey: ['studentDashboard'] })
      queryClient.invalidateQueries({ queryKey: ['studentCourses'] })
      setConfirmOpen(false)
      setSelectedCourse(null)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Enrollment failed')
      setConfirmOpen(false)
    },
  })

  const handleEnrollClick = (course) => {
    setSelectedCourse(course)
    setConfirmOpen(true)
  }

  const handleConfirmEnroll = () => {
    if (selectedCourse) enroll(selectedCourse.id)
  }

  const filtered = courses.filter((c) =>
    c.courseName.toLowerCase().includes(search.toLowerCase()) ||
    c.courseCode.toLowerCase().includes(search.toLowerCase()) ||
    c.facultyName?.toLowerCase().includes(search.toLowerCase())
  )

  if (coursesLoading) return <PageLoader />

  return (
    <div className="space-y-6">

      <PageHeader
        title="Course Catalog"
        subtitle={`${courses.length} courses available this semester`}
      />

      {/* Search */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by course name, code or faculty..."
        className="max-w-md"
      />

      {/* Stats row */}
      <div className="flex gap-4 flex-wrap">
        {[
          { label: 'Total Courses',    value: courses.length,                    color: 'text-slate-700'   },
          { label: 'You\'re Enrolled', value: enrolledCourseIds.size,            color: 'text-primary-600' },
          { label: 'Still Available',  value: courses.filter(c => c.availableSeats > 0).length, color: 'text-emerald-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-2 text-sm">
            <span className={`font-bold text-lg ${color}`}>{value}</span>
            <span className="text-slate-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Course grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <Search className="w-12 h-12 text-slate-200 mb-3" />
          <p className="text-slate-400 font-medium">No courses match your search</p>
          <button
            onClick={() => setSearch('')}
            className="mt-2 text-sm text-primary-600 hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled={enrolledCourseIds.has(course.id)}
              onEnroll={handleEnrollClick}
              enrolling={enrolling && selectedCourse?.id === course.id}
            />
          ))}
        </div>
      )}

      {/* Confirm modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setSelectedCourse(null) }}
        onConfirm={handleConfirmEnroll}
        title="Confirm Enrollment"
        message={`Are you sure you want to enroll in ${selectedCourse?.courseName} (${selectedCourse?.courseCode})? This will count toward your semester load.`}
        confirmLabel="Yes, Enroll Me"
        cancelLabel="Cancel"
        variant="primary"
        loading={enrolling}
      />

    </div>
  )
}

export default StudentCourses