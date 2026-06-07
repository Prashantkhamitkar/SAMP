import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Users, Award, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getCourseRosterApi,
  enterGradeApi,
  getFacultyCoursesApi,
} from '../../api/facultyApi'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import { GradeBadge } from '../../components/ui/Badge'
import { PageLoader } from '../../components/ui/Spinner'
import { getInitials } from '../../utils/helpers'

const GRADE_OPTIONS = ['A', 'B', 'C', 'D', 'F', 'I', 'W']

const GRADE_COLORS = {
  A: 'border-emerald-300 text-emerald-700 bg-emerald-50',
  B: 'border-blue-300 text-blue-700 bg-blue-50',
  C: 'border-amber-300 text-amber-700 bg-amber-50',
  D: 'border-orange-300 text-orange-700 bg-orange-50',
  F: 'border-red-300 text-red-700 bg-red-50',
  I: 'border-slate-300 text-slate-600 bg-slate-50',
  W: 'border-slate-300 text-slate-600 bg-slate-50',
}

const GradeEntry = () => {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()

  // Local grade state: { [enrollmentId]: gradeValue }
  const [grades, setGrades]       = useState({})
  const [changed, setChanged]     = useState(new Set())
  const [saving, setSaving]       = useState(false)

  // Get course info
  const { data: courses = [] } = useQuery({
    queryKey: ['facultyCourses'],
    queryFn:  () => getFacultyCoursesApi().then((r) => r.data.data),
  })
  const course = courses.find((c) => c.id === parseInt(id))

  // Get roster
  const { data: roster = [], isLoading } = useQuery({
    queryKey: ['courseRoster', id],
    queryFn:  () => getCourseRosterApi(id).then((r) => r.data.data),
  })

  // Pre-fill existing grades
  useEffect(() => {
    if (roster.length > 0) {
      const initial = {}
      roster.forEach((e) => {
        initial[e.id] = e.grade || ''
      })
      setGrades(initial)
    }
  }, [roster])

  const { mutateAsync: enterGrade } = useMutation({
    mutationFn: enterGradeApi,
  })

  const handleGradeChange = (enrollmentId, grade) => {
    setGrades((prev) => ({ ...prev, [enrollmentId]: grade }))
    setChanged((prev) => new Set(prev).add(enrollmentId))
  }

  const handleSaveAll = async () => {
    if (changed.size === 0) {
      toast('No changes to save', { icon: 'ℹ️' })
      return
    }

    setSaving(true)
    let successCount = 0
    let errorCount   = 0

    for (const enrollmentId of changed) {
      const grade = grades[enrollmentId]
      if (!grade) continue
      try {
        await enterGrade({ enrollmentId: parseInt(enrollmentId), grade })
        successCount++
      } catch {
        errorCount++
      }
    }

    setSaving(false)
    setChanged(new Set())

    if (successCount > 0) {
      toast.success(
        `${successCount} grade${successCount !== 1 ? 's' : ''} saved successfully`
      )
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} grade${errorCount !== 1 ? 's' : ''} failed to save`)
    }

    queryClient.invalidateQueries({ queryKey: ['courseRoster', id] })
    queryClient.invalidateQueries({ queryKey: ['facultyDashboard'] })
  }

  const handleSaveOne = async (enrollmentId) => {
    const grade = grades[enrollmentId]
    if (!grade) {
      toast.error('Please select a grade first')
      return
    }
    try {
      await enterGrade({ enrollmentId: parseInt(enrollmentId), grade })
      setChanged((prev) => {
        const next = new Set(prev)
        next.delete(enrollmentId)
        return next
      })
      toast.success('Grade saved')
      queryClient.invalidateQueries({ queryKey: ['courseRoster', id] })
      queryClient.invalidateQueries({ queryKey: ['facultyDashboard'] })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save grade')
    }
  }

  const gradedCount   = roster.filter((e) => e.grade).length
  const pendingCount  = roster.length - gradedCount

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">

      <PageHeader
        title="Grade Entry"
        subtitle={course
          ? `${course.courseCode} — ${course.courseName}`
          : 'Loading course...'}
        backButton={
          <button
            onClick={() => navigate('/faculty/courses')}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
        actions={
          <Button
            icon={Save}
            loading={saving}
            onClick={handleSaveAll}
            disabled={changed.size === 0}
          >
            Save All Changes
            {changed.size > 0 && (
              <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                {changed.size}
              </span>
            )}
          </Button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Students</p>
              <p className="text-xl font-bold text-slate-900">{roster.length}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Graded</p>
              <p className="text-xl font-bold text-emerald-600">{gradedCount}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center
              ${pendingCount > 0 ? 'bg-amber-50' : 'bg-slate-50'}`}>
              <Award className={`w-5 h-5 ${pendingCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Pending</p>
              <p className={`text-xl font-bold ${pendingCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                {pendingCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {roster.length > 0 && (
        <div className="card py-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-slate-700">Grading Progress</span>
            <span className="font-semibold text-slate-900">
              {gradedCount}/{roster.length} graded
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${roster.length > 0 ? (gradedCount / roster.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Roster table */}
      <div className="card p-0 overflow-hidden">

        {/* Table header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">
            Student Roster
          </h2>
          {changed.size > 0 && (
            <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
              {changed.size} unsaved change{changed.size !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {roster.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <Users className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-sm text-slate-400">No students enrolled in this course</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-left table-header">Student</th>
                  <th className="px-4 py-3 text-left table-header w-32">Student ID</th>
                  <th className="px-4 py-3 text-left table-header w-48">Select Grade</th>
                  <th className="px-4 py-3 text-left table-header w-24">Current</th>
                  <th className="px-4 py-3 text-left table-header w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {roster.map((enrollment) => {
                  const isChanged  = changed.has(enrollment.id)
                  const gradeValue = grades[enrollment.id] || ''
                  const gradeStyle = gradeValue
                    ? GRADE_COLORS[gradeValue]
                    : 'border-slate-200 text-slate-400 bg-white'

                  return (
                    <tr
                      key={enrollment.id}
                      className={`transition-colors ${
                        isChanged
                          ? 'bg-amber-50/40'
                          : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      {/* Student */}
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-primary-700">
                              {getInitials(enrollment.studentName)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">
                              {enrollment.studentName}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {enrollment.semester}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Student ID */}
                      <td className="table-cell">
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                          {enrollment.studentNumber}
                        </span>
                      </td>

                      {/* Grade selector */}
                      <td className="table-cell">
                        <div className="flex gap-1 flex-wrap">
                          {GRADE_OPTIONS.map((g) => (
                            <button
                              key={g}
                              onClick={() => handleGradeChange(enrollment.id, g)}
                              className={`
                                w-9 h-9 rounded-lg text-sm font-bold border-2 transition-all
                                hover:scale-110 active:scale-95
                                ${gradeValue === g
                                  ? `${GRADE_COLORS[g]} border-2 ring-2 ring-offset-1 ${
                                      g === 'A' ? 'ring-emerald-300' :
                                      g === 'B' ? 'ring-blue-300'    :
                                      g === 'C' ? 'ring-amber-300'   :
                                      g === 'D' ? 'ring-orange-300'  :
                                      g === 'F' ? 'ring-red-300'     :
                                      'ring-slate-300'
                                    }`
                                  : 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'
                                }
                              `}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* Current grade */}
                      <td className="table-cell">
                        <GradeBadge grade={enrollment.grade} />
                      </td>

                      {/* Save button */}
                      <td className="table-cell">
                        <Button
                          variant={isChanged ? 'success' : 'secondary'}
                          size="xs"
                          onClick={() => handleSaveOne(enrollment.id)}
                          disabled={!isChanged}
                        >
                          {isChanged ? 'Save' : 'Saved'}
                        </Button>
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Bottom save button */}
      {roster.length > 0 && (
        <div className="flex justify-end">
          <Button
            icon={Save}
            loading={saving}
            onClick={handleSaveAll}
            disabled={changed.size === 0}
            size="lg"
          >
            Save All Changes
            {changed.size > 0 && ` (${changed.size})`}
          </Button>
        </div>
      )}

    </div>
  )
}

export default GradeEntry