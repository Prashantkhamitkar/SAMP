import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calendar, Plus, Edit,
  Globe, EyeOff, CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getCalendarsApi,
  createCalendarApi,
  updateCalendarApi,
  publishCalendarApi,
  unpublishCalendarApi,
} from '../../api/adminApi'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import { PageLoader } from '../../components/ui/Spinner'
import { formatDate } from '../../utils/helpers'

const EMPTY_FORM = {
  semesterName:         '',
  startDate:            '',
  endDate:              '',
  enrollmentOpenDate:   '',
  enrollmentCloseDate:  '',
  dropDeadline:         '',
}

const AdminCalendar = () => {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen]   = useState(false)
  const [editing, setEditing]       = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [errors, setErrors]         = useState({})

  const { data: calendars = [], isLoading } = useQuery({
    queryKey: ['adminCalendars'],
    queryFn:  () => getCalendarsApi().then((r) => r.data.data),
  })

  const { mutate: saveCalendar, isPending: saving } = useMutation({
    mutationFn: (payload) =>
      editing
        ? updateCalendarApi(editing.id, payload)
        : createCalendarApi(payload),
    onSuccess: () => {
      toast.success(editing ? 'Calendar updated' : 'Semester created')
      queryClient.invalidateQueries({ queryKey: ['adminCalendars'] })
      closeModal()
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Save failed')
    },
  })

  const { mutate: togglePublish, isPending: publishing } = useMutation({
    mutationFn: ({ id, published }) =>
      published ? unpublishCalendarApi(id) : publishCalendarApi(id),
    onSuccess: (_, vars) => {
      toast.success(vars.published ? 'Semester unpublished' : 'Semester published!')
      queryClient.invalidateQueries({ queryKey: ['adminCalendars'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Action failed')
    },
  })

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    setForm(EMPTY_FORM)
    setErrors({})
  }

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (cal) => {
    setEditing(cal)
    setForm({
      semesterName:        cal.semesterName        || '',
      startDate:           cal.startDate           || '',
      endDate:             cal.endDate             || '',
      enrollmentOpenDate:  cal.enrollmentOpenDate  || '',
      enrollmentCloseDate: cal.enrollmentCloseDate || '',
      dropDeadline:        cal.dropDeadline        || '',
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
    if (!form.semesterName.trim())        e.semesterName        = 'Required'
    if (!form.startDate)                  e.startDate           = 'Required'
    if (!form.endDate)                    e.endDate             = 'Required'
    if (!form.enrollmentOpenDate)         e.enrollmentOpenDate  = 'Required'
    if (!form.enrollmentCloseDate)        e.enrollmentCloseDate = 'Required'
    if (!form.dropDeadline)               e.dropDeadline        = 'Required'
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      e.endDate = 'End date must be after start date'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    saveCalendar(form)
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">

      <PageHeader
        title="Academic Calendar"
        subtitle="Manage semester dates, enrollment windows and deadlines"
        actions={
          <Button icon={Plus} onClick={openCreate}>
            New Semester
          </Button>
        }
      />

      {/* Calendar cards */}
      {calendars.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <Calendar className="w-12 h-12 text-slate-200 mb-3" />
          <p className="text-slate-400 font-medium">No semesters configured</p>
          <Button className="mt-4" icon={Plus} onClick={openCreate}>
            Create First Semester
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {calendars.map((cal) => (
            <div
              key={cal.id}
              className={`card border-2 transition-all
                ${cal.published
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : 'border-slate-100'}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      {cal.semesterName}
                    </h3>
                    {cal.published && (
                      <Badge variant="green" dot>Published</Badge>
                    )}
                    {!cal.published && (
                      <Badge variant="gray">Draft</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {formatDate(cal.startDate)} — {formatDate(cal.endDate)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  icon={Edit}
                  onClick={() => openEdit(cal)}
                  disabled={cal.published}
                >
                  Edit
                </Button>
              </div>

              {/* Date grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  {
                    label: 'Semester Start',
                    value: formatDate(cal.startDate),
                    icon:  '📅',
                  },
                  {
                    label: 'Semester End',
                    value: formatDate(cal.endDate),
                    icon:  '🏁',
                  },
                  {
                    label: 'Enrollment Opens',
                    value: formatDate(cal.enrollmentOpenDate),
                    icon:  '🔓',
                  },
                  {
                    label: 'Enrollment Closes',
                    value: formatDate(cal.enrollmentCloseDate),
                    icon:  '🔒',
                  },
                  {
                    label: 'Drop Deadline',
                    value: formatDate(cal.dropDeadline),
                    icon:  '⚠️',
                  },
                ].map(({ label, value, icon }) => (
                  <div
                    key={label}
                    className="bg-white rounded-lg p-3 border border-slate-100"
                  >
                    <p className="text-xs text-slate-400 mb-1">
                      {icon} {label}
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Publish toggle */}
              <Button
                variant={cal.published ? 'secondary' : 'success'}
                size="sm"
                fullWidth
                icon={cal.published ? EyeOff : Globe}
                loading={publishing}
                onClick={() =>
                  togglePublish({ id: cal.id, published: cal.published })
                }
              >
                {cal.published ? 'Unpublish Semester' : 'Publish Semester'}
              </Button>

            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Semester' : 'Create New Semester'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button loading={saving} onClick={handleSave} icon={CheckCircle}>
              {editing ? 'Save Changes' : 'Create Semester'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">

          <Input
            label="Semester Name"
            name="semesterName"
            placeholder="e.g. Fall 2026"
            value={form.semesterName}
            onChange={handleChange}
            error={errors.semesterName}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              error={errors.startDate}
              required
            />
            <Input
              label="End Date"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              error={errors.endDate}
              required
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Enrollment Window
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Enrollment Opens"
                name="enrollmentOpenDate"
                type="date"
                value={form.enrollmentOpenDate}
                onChange={handleChange}
                error={errors.enrollmentOpenDate}
                required
              />
              <Input
                label="Enrollment Closes"
                name="enrollmentCloseDate"
                type="date"
                value={form.enrollmentCloseDate}
                onChange={handleChange}
                error={errors.enrollmentCloseDate}
                required
              />
            </div>
          </div>

          <Input
            label="Drop Deadline"
            name="dropDeadline"
            type="date"
            value={form.dropDeadline}
            onChange={handleChange}
            error={errors.dropDeadline}
            required
            hint="Last date students can drop a course without penalty"
          />

        </div>
      </Modal>

    </div>
  )
}

export default AdminCalendar