import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, BookMarked, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getFacultyCoursesApi,
  createCourseApi,
  updateCourseApi,
} from '../../api/facultyApi'
import PageHeader from '../../components/ui/PageHeader'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import Button from '../../components/ui/Button'
import { PageLoader } from '../../components/ui/Spinner'

const CREDIT_OPTIONS = [
  { value: '1', label: '1 Credit'  },
  { value: '2', label: '2 Credits' },
  { value: '3', label: '3 Credits' },
  { value: '4', label: '4 Credits' },
]

const SEMESTER_OPTIONS = [
  { value: 'Fall 2025',   label: 'Fall 2025'   },
  { value: 'Spring 2026', label: 'Spring 2026' },
  { value: 'Summer 2026', label: 'Summer 2026' },
  { value: 'Fall 2026',   label: 'Fall 2026'   },
  { value: 'Spring 2027', label: 'Spring 2027' },
]

const EMPTY_FORM = {
  courseCode:  '',
  courseName:  '',
  description: '',
  credits:     '3',
  maxCapacity: '30',
  semester:    'Fall 2026',
}

const CourseForm = () => {
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()
  const { id }       = useParams()
  const isEdit       = Boolean(id)

  const [form, setForm]     = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  // Load existing course if editing
  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ['facultyCourses'],
    queryFn:  () => getFacultyCoursesApi().then((r) => r.data.data),
    enabled:  isEdit,
  })

  useEffect(() => {
    if (isEdit && courses.length > 0) {
      const course = courses.find((c) => c.id === parseInt(id))
      if (course) {
        setForm({
          courseCode:  course.courseCode  || '',
          courseName:  course.courseName  || '',
          description: course.description || '',
          credits:     course.credits?.toString() || '3',
          maxCapacity: course.maxCapacity?.toString() || '30',
          semester:    course.semester    || 'Fall 2026',
        })
      }
    }
  }, [isEdit, courses, id])

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: createCourseApi,
    onSuccess: () => {
      toast.success('Course created successfully')
      queryClient.invalidateQueries({ queryKey: ['facultyCourses'] })
      queryClient.invalidateQueries({ queryKey: ['facultyDashboard'] })
      navigate('/faculty/courses')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create course')
    },
  })

  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: (data) => updateCourseApi(id, data),
    onSuccess: () => {
      toast.success('Course updated successfully')
      queryClient.invalidateQueries({ queryKey: ['facultyCourses'] })
      queryClient.invalidateQueries({ queryKey: ['facultyDashboard'] })
      navigate('/faculty/courses')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update course')
    },
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.courseCode.trim())  e.courseCode  = 'Course code is required'
    if (!form.courseName.trim())  e.courseName  = 'Course name is required'
    if (!form.credits)            e.credits     = 'Credits are required'
    if (!form.maxCapacity)        e.maxCapacity = 'Max capacity is required'
    else if (parseInt(form.maxCapacity) < 1)  {
      e.maxCapacity = 'Capacity must be at least 1'
    }
    if (!form.semester.trim())    e.semester    = 'Semester is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const payload = {
      courseCode:  form.courseCode.toUpperCase().trim(),
      courseName:  form.courseName.trim(),
      description: form.description.trim() || null,
      credits:     parseInt(form.credits),
      maxCapacity: parseInt(form.maxCapacity),
      semester:    form.semester,
    }
    isEdit ? update(payload) : create(payload)
  }

  if (isEdit && loadingCourses) return <PageLoader />

  const isSaving = creating || updating

  return (
    <div className="max-w-2xl space-y-6">

      <PageHeader
        title={isEdit ? 'Edit Course' : 'Create New Course'}
        subtitle={isEdit
          ? 'Update the course details below'
          : 'Fill in the details to create a new course'}
        backButton={
          <button
            onClick={() => navigate('/faculty/courses')}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
      />

      <form onSubmit={handleSubmit} noValidate>
        <div className="card space-y-5">

          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <BookMarked className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Course Details
            </h2>
          </div>

          {/* Code + Name */}
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Course Code"
              name="courseCode"
              placeholder="e.g. CS101"
              value={form.courseCode}
              onChange={handleChange}
              error={errors.courseCode}
              required
              hint="Auto-uppercased on save"
              className="col-span-1"
            />
            <Input
              label="Course Name"
              name="courseName"
              placeholder="e.g. Data Structures"
              value={form.courseName}
              onChange={handleChange}
              error={errors.courseName}
              required
              className="col-span-2"
            />
          </div>

          {/* Description */}
          <Textarea
            label="Description"
            name="description"
            placeholder="Brief description of the course content and objectives..."
            rows={3}
            value={form.description}
            onChange={handleChange}
          />

          {/* Credits + Capacity + Semester */}
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Credits"
              name="credits"
              options={CREDIT_OPTIONS}
              value={form.credits}
              onChange={handleChange}
              error={errors.credits}
              required
            />
            <Input
              label="Max Capacity"
              name="maxCapacity"
              type="number"
              placeholder="30"
              min="1"
              max="500"
              value={form.maxCapacity}
              onChange={handleChange}
              error={errors.maxCapacity}
              required
            />
            <Select
              label="Semester"
              name="semester"
              options={SEMESTER_OPTIONS}
              value={form.semester}
              onChange={handleChange}
              error={errors.semester}
              required
            />
          </div>

          {/* Preview card */}
          {form.courseCode && form.courseName && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
              <p className="text-xs font-semibold text-emerald-600 mb-1 uppercase tracking-wider">
                Preview
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-1 rounded-lg border border-emerald-200">
                  {form.courseCode.toUpperCase()}
                </span>
                <span className="text-sm font-semibold text-emerald-800">
                  {form.courseName}
                </span>
                <span className="text-xs text-emerald-600 ml-auto">
                  {form.credits} cr · {form.maxCapacity} seats · {form.semester}
                </span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/faculty/courses')}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSaving}
              icon={Save}
            >
              {isEdit ? 'Save Changes' : 'Create Course'}
            </Button>
          </div>

        </div>
      </form>

    </div>
  )
}

export default CourseForm