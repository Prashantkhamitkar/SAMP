import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { User, Mail, Hash, BookOpen, Lock, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getStudentProfileApi,
  updateStudentProfileApi,
} from '../../api/studentApi'
import { updateUser } from '../../store/slices/authSlice'
import PageHeader from '../../components/ui/PageHeader'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import { RoleBadge } from '../../components/ui/Badge'
import { PageLoader } from '../../components/ui/Spinner'
import { getInitials, formatDate } from '../../utils/helpers'

const MAJOR_OPTIONS = [
  { value: 'Computer Science',        label: 'Computer Science'        },
  { value: 'Information Technology',  label: 'Information Technology'  },
  { value: 'Software Engineering',    label: 'Software Engineering'    },
  { value: 'Data Science',            label: 'Data Science'            },
  { value: 'Cybersecurity',           label: 'Cybersecurity'           },
  { value: 'Business Administration', label: 'Business Administration' },
  { value: 'Mathematics',             label: 'Mathematics'             },
  { value: 'Other',                   label: 'Other'                   },
]

const YEAR_OPTIONS = [
  { value: '1', label: 'Year 1 — Freshman'  },
  { value: '2', label: 'Year 2 — Sophomore' },
  { value: '3', label: 'Year 3 — Junior'    },
  { value: '4', label: 'Year 4 — Senior'    },
  { value: '5', label: 'Year 5'             },
  { value: '6', label: 'Year 6'             },
]

const StudentProfile = () => {
  const dispatch      = useDispatch()
  const queryClient   = useQueryClient()

  const [form, setForm]       = useState({})
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  })
  const [errors, setErrors]     = useState({})
  const [passErrors, setPassErrors] = useState({})

  const { data: profile, isLoading } = useQuery({
    queryKey: ['studentProfile'],
    queryFn:  () => getStudentProfileApi().then((r) => r.data.data),
  })

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || '',
        lastName:  profile.lastName  || '',
        email:     profile.email     || '',
        major:     profile.major     || '',
        year:      profile.year?.toString() || '',
      })
    }
  }, [profile])

  const { mutate: updateProfile, isPending: saving } = useMutation({
    mutationFn: (data) => updateStudentProfileApi(data),
    onSuccess: (res) => {
      toast.success('Profile updated successfully')
      dispatch(updateUser({
        fullName: `${form.firstName} ${form.lastName}`,
        email:    form.email,
      }))
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Update failed')
    },
  })

  const { mutate: changePassword, isPending: changingPass } = useMutation({
    mutationFn: (data) => updateStudentProfileApi(data),
    onSuccess: () => {
      toast.success('Password changed successfully')
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPassErrors({})
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Password change failed')
    },
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handlePassChange = (e) => {
    const { name, value } = e.target
    setPassForm((prev) => ({ ...prev, [name]: value }))
    if (passErrors[name]) setPassErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateProfile = () => {
    const e = {}
    if (!form.firstName?.trim()) e.firstName = 'First name is required'
    if (!form.lastName?.trim())  e.lastName  = 'Last name is required'
    if (!form.email?.trim())     e.email     = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Invalid email format'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validatePassword = () => {
    const e = {}
    if (!passForm.currentPassword) e.currentPassword = 'Current password required'
    if (!passForm.newPassword)     e.newPassword     = 'New password required'
    else if (passForm.newPassword.length < 8) {
      e.newPassword = 'At least 8 characters'
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      e.confirmPassword = 'Passwords do not match'
    }
    setPassErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSaveProfile = () => {
    if (!validateProfile()) return
    updateProfile({
      firstName: form.firstName,
      lastName:  form.lastName,
      email:     form.email,
      major:     form.major || null,
      year:      form.year ? parseInt(form.year) : null,
    })
  }

  const handleChangePassword = () => {
    if (!validatePassword()) return
    changePassword({
      currentPassword: passForm.currentPassword,
      newPassword:     passForm.newPassword,
    })
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6 max-w-3xl">

      <PageHeader
        title="My Profile"
        subtitle="Manage your personal and academic information"
      />

      {/* Avatar card */}
      <div className="card flex items-center gap-5">
        <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center shrink-0">
          <span className="text-2xl font-bold text-white">
            {getInitials(`${form.firstName} ${form.lastName}`)}
          </span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {form.firstName} {form.lastName}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">{form.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <RoleBadge role="STUDENT" />
            {profile?.studentId && (
              <span className="text-xs text-slate-400 font-mono">
                ID: {profile.studentId}
              </span>
            )}
          </div>
        </div>
        <div className="ml-auto text-right hidden sm:block">
          <p className="text-xs text-slate-400">Member since</p>
          <p className="text-sm font-medium text-slate-600 mt-0.5">
            {formatDate(profile?.createdAt)}
          </p>
        </div>
      </div>

      {/* Personal info form */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
          <User className="w-5 h-5 text-primary-600" />
          <h3 className="text-base font-semibold text-slate-900">
            Personal Information
          </h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First name"
              name="firstName"
              value={form.firstName || ''}
              onChange={handleChange}
              error={errors.firstName}
              icon={User}
              required
            />
            <Input
              label="Last name"
              name="lastName"
              value={form.lastName || ''}
              onChange={handleChange}
              error={errors.lastName}
              required
            />
          </div>

          <Input
            label="Email address"
            name="email"
            type="email"
            value={form.email || ''}
            onChange={handleChange}
            error={errors.email}
            icon={Mail}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Student ID"
              value={profile?.studentId || ''}
              icon={Hash}
              disabled
              hint="Student ID cannot be changed"
            />
            <Select
              label="Year of study"
              name="year"
              options={YEAR_OPTIONS}
              value={form.year || ''}
              onChange={handleChange}
            />
          </div>

          <Select
            label="Major"
            name="major"
            options={MAJOR_OPTIONS}
            value={form.major || ''}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
          <Button
            onClick={handleSaveProfile}
            loading={saving}
            icon={Save}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Password form */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
          <Lock className="w-5 h-5 text-primary-600" />
          <h3 className="text-base font-semibold text-slate-900">
            Change Password
          </h3>
        </div>

        <div className="space-y-4">
          <Input
            label="Current password"
            name="currentPassword"
            type="password"
            placeholder="Enter your current password"
            icon={Lock}
            value={passForm.currentPassword}
            onChange={handlePassChange}
            error={passErrors.currentPassword}
          />
          <Input
            label="New password"
            name="newPassword"
            type="password"
            placeholder="At least 8 characters"
            icon={Lock}
            value={passForm.newPassword}
            onChange={handlePassChange}
            error={passErrors.newPassword}
            hint="Must contain uppercase, lowercase and a number"
          />
          <Input
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            placeholder="Repeat new password"
            icon={Lock}
            value={passForm.confirmPassword}
            onChange={handlePassChange}
            error={passErrors.confirmPassword}
          />
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
          <Button
            onClick={handleChangePassword}
            loading={changingPass}
            variant="secondary"
            icon={Lock}
          >
            Change Password
          </Button>
        </div>
      </div>

    </div>
  )
}

export default StudentProfile