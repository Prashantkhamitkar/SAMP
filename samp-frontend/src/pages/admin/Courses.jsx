import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen, Plus, Edit, Trash2,
  ToggleLeft, ToggleRight, Users
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getAllCoursesAdminApi,
  createCourseAdminApi,
  updateCourseAdminApi,
  toggleCourseAdminApi,
  deleteCourseAdminApi,
} from '../../api/adminApi'
import { getAllUsersApi } from '../../api/adminApi'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import SearchBar from '../../components/ui/SearchBar'
import Table from '../../components/ui/Table'
import Modal, { ConfirmModal } from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import { ActiveBadge } from '../../components/ui/Badge'
import { PageLoader } from '../../components/ui/Spinner'
import { truncate } from '../../utils/helpers'

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
  facultyId:   '',
}

const AdminCourses = () => {
  const queryClient = useQueryClient()
  const [search, setSearch]         = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [deleteTarget, setDeleteTarget]   = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [errors, setErrors]         = useState({})

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['adminCourses'],
    queryFn:  () => getAllCoursesAdminApi().then((r) => r.data.data),
  })

  const { data: facultyUsers = [] } = useQuery({
    queryKey: ['adminUsers'],
    queryFn:  () => getAllUsersApi().then((r) => r.data.data),
    select:   (data) => data.filter((u) => u.role === 'FACULTY'),
  })

  const facultyOptions = facultyUsers.map((f) => ({
    value: f.facultyProfileId?.toString() || '',
    label: f.fullName,
  }))

  const { mutate: saveCourse, isPending: saving } = useMutation({
    mutationFn: (payload) =>
      editingCourse
        ? updateCourseAdminApi(editingCourse.id, payload)
        : createCourseAdminApi(payload),
    onSuccess: () => {
      toast.success(editingCourse ? 'Course updated' : 'Course created')
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
      closeModal()
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Operation failed')
    },
  })

  const { mutate: toggleCourse, isPending: toggling } = useMutation({
    mutationFn: (id) => toggleCourseAdminApi(id),
    onSuccess: () => {
      toast.success('Course status updated')
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Toggle failed')
    },
  })

  const { mutate: deleteCourse, isPending: deleting } = useMutation({
    mutationFn: (id) => deleteCourseAdminApi(id),
    onSuccess: () => {
      toast.success('Course deleted')
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
      setDeleteTarget(null)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Delete failed')
    },
  })

  const closeModal = () => {
    setModalOpen(false)
    setEditingCourse(null)
    setForm(EMPTY_FORM)
    setErrors({})
  }

  const openCreate = () => {
    setEditingCourse(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (course) => {
    setEditingCourse(course)
    setForm({
      courseCode:  course.courseCode  || '',
      courseName:  course.courseName  || '',
      description: course.description || '',
      credits:     course.credits?.toString() || '3',
      maxCapacity: course.maxCapacity?.toString() || '30',
      semester:    course.semester    || 'Fall 2026',
      facultyId:   course.facultyId?.toString() || '',
    })
    setModalOpen(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.courseCode.trim())  e.courseCode  = 'Required'
    if (!form.courseName.trim())  e.courseName  = 'Required'
    if (!form.credits)            e.credits     = 'Required'
    if (!form.maxCapacity || parseInt(form.maxCapacity) < 1) {
      e.maxCapacity = 'Min 1'
    }
    if (!form.semester.trim())    e.semester    = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    saveCourse({
      courseCode:  form.courseCode.toUpperCase().trim(),
      courseName:  form.courseName.trim(),
      description: form.description || null,
      credits:     parseInt(form.credits),
      maxCapacity: parseInt(form.maxCapacity),
      semester:    form.semester,
      facultyId:   form.facultyId ? parseInt(form.facultyId) : null,
    })
  }

  const filtered = courses.filter((c) => {
    const matchActive = showInactive ? true : c.active
    const matchSearch =
      c.courseName.toLowerCase().includes(search.toLowerCase()) ||
      c.courseCode.toLowerCase().includes(search.toLowerCase()) ||
      c.facultyName?.toLowerCase().includes(search.toLowerCase())
    return matchActive && matchSearch
  })

  const columns = [
    {
      key:   'courseCode',
      title: 'Code',
      width: 'w-28',
      render: (val) => (
        <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg">
          {val}
        </span>
      ),
    },
    {
      key:   'courseName',
      title: 'Course Name',
      render: (val, row) => (
        <div>
          <p className="font-medium text-slate-900 text-sm">{val}</p>
          {row.description && (
            <p className="text-xs text-slate-400 mt-0.5">
              {truncate(row.description, 60)}
            </p>
          )}
        </div>
      ),
    },
    {
      key:   'facultyName',
      title: 'Faculty',
      width: 'w-40',
      render: (val) => (
        <span className="text-sm text-slate-600">{val || 'Unassigned'}</span>
      ),
    },
    {
      key:   'credits',
      title: 'Credits',
      width: 'w-20',
      render: (val) => (
        <span className="text-sm font-medium text-slate-600">{val} cr</span>
      ),
    },
    {
      key:   'enrolledCount',
      title: 'Enrollment',
      width: 'w-28',
      render: (val, row) => (
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-sm text-slate-600">
            {val}/{row.maxCapacity}
          </span>
        </div>
      ),
    },
    {
      key:   'semester',
      title: 'Semester',
      width: 'w-28',
      render: (val) => (
        <span className="text-xs text-slate-500">{val}</span>
      ),
    },
    {
      key:   'active',
      title: 'Status',
      width: 'w-24',
      render: (val) => <ActiveBadge active={val} />,
    },
    {
      key:   'actions',
      title: '',
      width: 'w-32',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            icon={Edit}
            onClick={() => openEdit(row)}
          />
          <Button
            variant="ghost"
            size="xs"
            icon={row.active ? ToggleRight : ToggleLeft}
            onClick={() => toggleCourse(row.id)}
          />
          <Button
            variant="ghost"
            size="xs"
            icon={Trash2}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => setDeleteTarget(row)}
          />
        </div>
      ),
    },
  ]

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">

      <PageHeader
        title="Course Management"
        subtitle={`${courses.length} total courses in the system`}
        actions={
          <Button icon={Plus} onClick={openCreate}>
            Add Course
          </Button>
        }
      />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search courses, faculty..."
          className="w-full sm:w-72"
        />
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          Show inactive courses
        </label>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filtered}
        loading={isLoading}
        emptyMessage="No courses found"
        emptyIcon={BookOpen}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingCourse ? 'Edit Course' : 'Create Course'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button loading={saving} onClick={handleSave} icon={Plus}>
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Code"
              name="courseCode"
              placeholder="CS101"
              value={form.courseCode}
              onChange={handleChange}
              error={errors.courseCode}
              required
            />
            <Input
              label="Course Name"
              name="courseName"
              placeholder="Data Structures"
              value={form.courseName}
              onChange={handleChange}
              error={errors.courseName}
              required
              className="col-span-2"
            />
          </div>
          <Textarea
            label="Description"
            name="description"
            rows={2}
            placeholder="Course description..."
            value={form.description}
            onChange={handleChange}
          />
          <div className="grid grid-cols-3 gap-3">
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
              label="Capacity"
              name="maxCapacity"
              type="number"
              min="1"
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
          <Select
            label="Assign Faculty (optional)"
            name="facultyId"
            options={facultyOptions}
            placeholder="Select faculty member"
            value={form.facultyId}
            onChange={handleChange}
          />
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteCourse(deleteTarget?.id)}
        title="Delete Course"
        message={`Are you sure you want to permanently delete ${deleteTarget?.courseName}? This cannot be undone.`}
        confirmLabel="Delete Course"
        variant="danger"
        loading={deleting}
      />

    </div>
  )
}

export default AdminCourses