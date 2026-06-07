import { useQuery } from '@tanstack/react-query'
import { Award, TrendingUp, BookOpen } from 'lucide-react'
import { getMyGradesApi } from '../../api/studentApi'
import { getStudentDashboardApi } from '../../api/studentApi'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import { GradeBadge, EnrollmentStatusBadge } from '../../components/ui/Badge'
import { PageLoader } from '../../components/ui/Spinner'
import { formatGpa, getGradeLabel } from '../../utils/helpers'

const GPA_SCALE = [
  { grade: 'A',  points: 4.0, range: '90-100' },
  { grade: 'B',  points: 3.0, range: '80-89'  },
  { grade: 'C',  points: 2.0, range: '70-79'  },
  { grade: 'D',  points: 1.0, range: '60-69'  },
  { grade: 'F',  points: 0.0, range: 'Below 60' },
  { grade: 'I',  points: 0.0, range: 'Incomplete' },
  { grade: 'W',  points: 0.0, range: 'Withdrawn'  },
]

const StudentGrades = () => {

  const { data: enrollments = [], isLoading: gradesLoading } = useQuery({
    queryKey: ['myGrades'],
    queryFn:  () => getMyGradesApi().then((r) => r.data.data),
  })

  const { data: dashboard } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn:  () => getStudentDashboardApi().then((r) => r.data.data),
  })

  const gpa           = dashboard?.gpa ?? 0
  const creditsEarned = dashboard?.totalCreditsEarned ?? 0

  const gradedCount = enrollments.filter((e) => e.grade).length
  const totalEnrollments = enrollments.length

  const getGpaColor = (g) =>
    g >= 3.5 ? 'text-emerald-600' :
    g >= 2.5 ? 'text-blue-600'    :
    g >= 1.5 ? 'text-amber-600'   : 'text-red-600'

  if (gradesLoading) return <PageLoader />

  return (
    <div className="space-y-6">

      <PageHeader
        title="My Grades"
        subtitle="Your complete academic grade record"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cumulative GPA"
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
          title="Credits Earned"
          value={creditsEarned}
          subtitle="completed credits"
          icon={Award}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Graded Courses"
          value={`${gradedCount}/${totalEnrollments}`}
          subtitle="grades posted"
          icon={BookOpen}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title="GPA Standing"
          value={
            gpa >= 3.5 ? "Dean's List" :
            gpa >= 3.0 ? 'Honors'      :
            gpa >= 2.0 ? 'Good Standing' : 'At Risk'
          }
          subtitle={`GPA ${formatGpa(gpa)}`}
          icon={Award}
          iconBg={gpa >= 3.5 ? 'bg-amber-50' : 'bg-slate-50'}
          iconColor={gpa >= 3.5 ? 'text-amber-600' : 'text-slate-400'}
        />
      </div>

      {/* GPA progress bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-slate-700">GPA Progress</p>
          <span className={`text-sm font-bold ${getGpaColor(gpa)}`}>
            {formatGpa(gpa)} / 4.00
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${
              gpa >= 3.5 ? 'bg-emerald-500' :
              gpa >= 2.5 ? 'bg-blue-500'    :
              gpa >= 1.5 ? 'bg-amber-500'   : 'bg-red-500'
            }`}
            style={{ width: `${Math.min((gpa / 4.0) * 100, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-slate-400">0.0</span>
          <span className="text-xs text-slate-400">4.0</span>
        </div>
      </div>

      {/* Grades table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">
            Grade Transcript
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Code', 'Course Name', 'Semester', 'Credits', 'Grade', 'Points', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left table-header">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <Award className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No grade records found</p>
                  </td>
                </tr>
              ) : (
                enrollments.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-cell">
                      <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">
                        {e.courseCode}
                      </span>
                    </td>
                    <td className="table-cell">
                      <p className="font-medium text-slate-900">{e.courseName}</p>
                      <p className="text-xs text-slate-400">{e.facultyName}</p>
                    </td>
                    <td className="table-cell text-slate-500">{e.semester}</td>
                    <td className="table-cell">
                      <span className="font-medium">{e.credits}</span>
                    </td>
                    <td className="table-cell">
                      <GradeBadge grade={e.grade} />
                    </td>
                    <td className="table-cell">
                      <span className="font-mono text-sm font-semibold text-slate-700">
                        {e.grade ? e.grade.gradePoints ?? getGradeLabel(e.grade) : '—'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <EnrollmentStatusBadge status={e.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* GPA scale */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
            GPA Scale Reference
          </p>
          <div className="flex flex-wrap gap-3">
            {GPA_SCALE.map((s) => (
              <div key={s.grade} className="flex items-center gap-1.5">
                <GradeBadge grade={s.grade} />
                <span className="text-xs text-slate-400">
                  = {s.points.toFixed(1)} ({s.range})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}

export default StudentGrades