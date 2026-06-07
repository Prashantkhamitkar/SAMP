import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users, UserPlus, Mail, Hash,
  ShieldCheck, ShieldOff, Search
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getAllUsersApi,
  createUserApi,
  deactivateUserApi,
  activateUserApi,
} from '../../api/adminApi'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import SearchBar from '../../components/ui/SearchBar'
import Table from '../../components/ui/Table'
import Modal, { ConfirmModal } from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { RoleBadge, ActiveBadge } from '../../components/ui/Badge'
import { PageLoader } from '../../components/ui/Spinner'
import { formatDate, getInitials } from '../../utils/helpers'

const ROLE_OPTIONS = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'FACULTY', label: 'Faculty' },
  { value: 'ADMIN',   label: 'Admin'   },
]

const MAJOR_OPTIONS = [
  { value: 'Computer Science',        label: 'Computer Science'        },
  { value: 'Information Technology',  label: 'Information Technology'  },
  { value: 'Software Engineering',    label: 'Software Engineering'    },
  { value: 'Data Science',            label: 'Data Science'            },
  { value: 'Cybersecurity',           label: 'Cybersecurity'           },
  { value: 'Other',                   label: 'Other'                   },
]

const EMPTY_FORM = {
  firstName:  '',
  lastName:   '',
  email:      '',
  password:   '',
  role:       'STUDENT',
  studentId:  '',
  major:      '',
  year:       '',
  department: '',
  title:      '',
}

const AdminUsers = () => {
  const queryClient = useQueryClient()
  const [search, setSearch]         = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [createOpen, setCreateOpen] = useState(false)
  const [confirmUser, setConfirmUser] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [errors, setErrors]         = useState({})

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn:  () => getAllUsersApi().then((r) => r.data.data),
  })

  const { mutate: createUser, isPending: creating } = useMutation({
    mutationFn: createUserApi,
    onSuccess: () => {
      toast.success('User created successfully')
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
      setCreateOpen(false)
      setForm(EMPTY_FORM)
      setErrors({})
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create user')
    },
  })

  const { mutate: toggleUser, isPending: toggling } = useMutation({
    mutationFn: ({ id, active }) =>
      active ? deactivateUserApi(id) : activateUserApi(id),
    onSuccess: (_, vars) => {
      toast.success(
        vars.active ? 'User deactivated' : 'User activated'
      )
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Action failed')
    },
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'Required'
    if (!form.lastName.trim())  e.lastName  = 'Required'
    if (!form.email.trim())     e.email     = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Invalid email'
    }
    if (!form.password)         e.password  = 'Required'
    else if (form.password.length < 8) {
      e.password = 'Min 8 characters'
    }
    if (form.role === 'STUDENT' && !form.studentId.trim()) {
      e.studentId = 'Student ID is required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleCreate = () => {
    if (!validate()) return
    const payload = {
      firstName:  form.firstName.trim(),
      lastName:   form.lastName.trim(),
      email:      form.email.trim(),
      password:   form.password,
      role:       form.role,
      ...(form.role === 'STUDENT' && {
        studentId: form.studentId.trim(),
        major:     form.major || null,
        year:      form.year ? parseInt(form.year) : null,
      }),
      ...(form.role === 'FACULTY' && {
        department: form.department || null,
        title:      form.title || null,
      }),
    }
    createUser(payload)
  }

  const handleToggleClick = (user) => {
    setConfirmUser(user)
    setConfirmAction(user.active ? 'deactivate' : 'activate')
  }

  const handleConfirmToggle = () => {
    toggleUser({ id: confirmUser.id, active: confirmUser.active })
    setConfirmUser(null)
  }

  // Filter
  const filtered = users.filter((u) => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter
    const matchSearch =
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.studentId?.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  const TABS = [
    { key: 'ALL',     label: 'All',     count: users.length                               },
    { key: 'STUDENT', label: 'Students', count: users.filter((u) => u.role === 'STUDENT').length },
    { key: 'FACULTY', label: 'Faculty',  count: users.filter((u) => u.role === 'FACULTY').length },
    { key: 'ADMIN',   label: 'Admins',   count: users.filter((u) => u.role === 'ADMIN').length   },
  ]

  const columns = [
    {
      key:   'fullName',
      title: 'User',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold
            ${row.role === 'STUDENT' ? 'bg-blue-100 text-blue-700'   :
              row.role === 'FACULTY' ? 'bg-emerald-100 text-emerald-700' :
              'bg-purple-100 text-purple-700'}`}>
            {getInitials(val)}
          </div>
          <div>
            <p className="font-medium text-slate-900 text-sm">{val}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {row.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key:   'role',
      title: 'Role',
      width: 'w-32',
      render: (val) => <RoleBadge role={val} />,
    },
    {
      key:   'studentId',
      title: 'Student ID',
      width: 'w-36',
      render: (val) => val
        ? <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{val}</span>
        : <span className="text-slate-300">—</span>,
    },
    {
      key:   'active',
      title: 'Status',
      width: 'w-24',
      render: (val) => <ActiveBadge active={val} />,
    },
    {
      key:   'createdAt',
      title: 'Joined',
      width: 'w-32',
      render: (val) => (
        <span className="text-xs text-slate-400">{formatDate(val)}</span>
      ),
    },
    {
      key:   'actions',
      title: '',
      width: 'w-28',
      render: (_, row) => (
        <Button
          variant={row.active ? 'danger' : 'success'}
          size="xs"
          icon={row.active ? ShieldOff : ShieldCheck}
          onClick={() => handleToggleClick(row)}
        >
          {row.active ? 'Deactivate' : 'Activate'}
        </Button>
      ),
    },
  ]

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">

      <PageHeader
        title="User Management"
        subtitle={`${users.length} total users in the system`}
        actions={
          <Button
            icon={UserPlus}
            onClick={() => setCreateOpen(true)}
          >
            Add User
          </Button>
        }
      />

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
                font-medium transition-all duration-150
                ${roleFilter === tab.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'}
              `}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                ${roleFilter === tab.key
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-slate-200 text-slate-500'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email or student ID..."
          className="w-full sm:w-72"
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filtered}
        loading={isLoading}
        emptyMessage="No users found"
        emptyIcon={Users}
      />

      {/* Create User Modal */}
      <Modal
        isOpen={createOpen}
        onClose={() => { setCreateOpen(false); setForm(EMPTY_FORM); setErrors({}) }}
        title="Create New User"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => { setCreateOpen(false); setForm(EMPTY_FORM); setErrors({}) }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              loading={creating}
              onClick={handleCreate}
              icon={UserPlus}
            >
              Create User
            </Button>
          </>
        }
      >
        <div className="space-y-4">

          {/* Role selector */}
          <Select
            label="Role"
            name="role"
            options={ROLE_OPTIONS}
            value={form.role}
            onChange={handleChange}
            required
          />

          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name"
              name="firstName"
              placeholder="John"
              value={form.firstName}
              onChange={handleChange}
              error={errors.firstName}
              required
            />
            <Input
              label="Last name"
              name="lastName"
              placeholder="Doe"
              value={form.lastName}
              onChange={handleChange}
              error={errors.lastName}
              required
            />
          </div>

          {/* Email + Password */}
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="user@samp.edu"
            icon={Mail}
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            required
          />

          {/* Student-specific fields */}
          {form.role === 'STUDENT' && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Student Details
              </p>
              <Input
                label="Student ID"
                name="studentId"
                placeholder="STU-2024-001"
                icon={Hash}
                value={form.studentId}
                onChange={handleChange}
                error={errors.studentId}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Major"
                  name="major"
                  options={MAJOR_OPTIONS}
                  value={form.major}
                  onChange={handleChange}
                />
                <Select
                  label="Year"
                  name="year"
                  options={[
                    { value: '1', label: 'Year 1' },
                    { value: '2', label: 'Year 2' },
                    { value: '3', label: 'Year 3' },
                    { value: '4', label: 'Year 4' },
                  ]}
                  value={form.year}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* Faculty-specific fields */}
          {form.role === 'FACULTY' && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Faculty Details
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Department"
                  name="department"
                  placeholder="Computer Science"
                  value={form.department}
                  onChange={handleChange}
                />
                <Input
                  label="Title"
                  name="title"
                  placeholder="Professor"
                  value={form.title}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

        </div>
      </Modal>

      {/* Confirm toggle */}
      <ConfirmModal
        isOpen={!!confirmUser}
        onClose={() => setConfirmUser(null)}
        onConfirm={handleConfirmToggle}
        title={confirmAction === 'deactivate' ? 'Deactivate User' : 'Activate User'}
        message={
          confirmAction === 'deactivate'
            ? `Are you sure you want to deactivate ${confirmUser?.fullName}? They will no longer be able to log in.`
            : `Are you sure you want to activate ${confirmUser?.fullName}? They will be able to log in again.`
        }
        confirmLabel={confirmAction === 'deactivate' ? 'Deactivate' : 'Activate'}
        variant={confirmAction === 'deactivate' ? 'danger' : 'success'}
        loading={toggling}
      />

    </div>
  )
}

export default AdminUsers