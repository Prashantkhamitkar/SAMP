import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { User, Mail, Lock, Save, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getFacultyProfileApi,
  updateFacultyProfileApi,
} from '../../api/facultyApi'
import { updateUser } from '../../store/slices/authSlice'
import PageHeader from '../../components/ui/PageHeader'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { RoleBadge } from '../../components/ui/Badge'
import { PageLoader } from '../../components/ui/Spinner'
import { getInitials, formatDate } from '../../utils/helpers'

const FacultyProfile = () => {
  const dispatch    = useDispatch()
  const queryClient = useQueryClient()

  const [form, setForm]     = useState({})
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  })
  const [errors, setErrors]         = useState({})
  const [passErrors, setPassErrors] = useState({})

  const { data: profile, isLoading } = useQuery({
    queryKey: ['facultyProfile'],
    queryFn:  () => getFacultyProfileApi().then((r) => r.data.data),
  })

  useEffect(() => {
    if (profile) {
      setForm({
        firstName:  profile.firstName  || '',
        lastName:   profile.lastName   || '',
        email:      profile.email      || '',
        department: profile.department || '',
        title:      profile.title      || '',
      })
    }
  }, [profile])

  const { mutate: updateProfile, isPending: saving } = useMutation({
    mutationFn: updateFacultyProfileApi,
    onSuccess: () => {
      toast.success('Profile updated successfully')
      dispatch(updateUser({
        fullName: `${form.firstName} ${form.lastName}`,
        email:    form.email,
      }))
      queryClient.invalidateQueries({ queryKey: ['facultyProfile'] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Update failed')
    },
  })

  const { mutate: changePassword, isPending: changingPass } = useMutation({
    mutationFn: updateFacultyProfileApi,
    onSuccess: () => {
      toast.success('Password changed successfully')
      setPassForm({
        currentPassword: '',
        newPassword:     '',
        confirmPassword: '',
      })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Password change failed')
    },
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }))
  }

  const handlePassChange = (e) => {
    const { name, value } = e.target
    setPassForm((p) => ({ ...p, [name]: value }))
    if (passErrors[name]) setPassErrors((p) => ({ ...p, [name]: '' }))
  }

  const validateProfile = () => {
    const e = {}
    if (!form.firstName?.trim()) e.firstName = 'Required'
    if (!form.lastName?.trim())  e.lastName  = 'Required'
    if (!form.email?.trim())     e.email     = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Invalid email'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validatePassword = () => {
    const e = {}
    if (!passForm.currentPassword) e.currentPassword = 'Required'
    if (!passForm.newPassword)     e.newPassword = 'Required'
    else if (passForm.newPassword.length < 8) {
      e.newPassword = 'Min 8 characters'
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
      firstName:  form.firstName,
      lastName:   form.lastName,
      email:      form.email,
      department: form.department || null,
      title:      form.title      || null,
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
        subtitle="Manage your faculty account information"
      />

      {/* Avatar card */}
      <div className="card flex items-center gap-5">
        <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
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
            <RoleBadge role="FACULTY" />
            {form.department && (
              <span className="text-xs text-slate-400">
                {form.department}
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

      {/* Profile form */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-100">
          <User className="w-5 h-5 text-emerald-600" />
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
              label="Department"
              name="department"
              placeholder="Computer Science"
              value={form.department || ''}
              onChange={handleChange}
              icon={BookOpen}
            />
            <Input
              label="Title"
              name="title"
              placeholder="Professor"
              value={form.title || ''}
              onChange={handleChange}
            />
          </div>
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
          <Lock className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-semibold text-slate-900">
            Change Password
          </h3>
        </div>
        <div className="space-y-4">
          <Input
            label="Current password"
            name="currentPassword"
            type="password"
            icon={Lock}
            value={passForm.currentPassword}
            onChange={handlePassChange}
            error={passErrors.currentPassword}
          />
          <Input
            label="New password"
            name="newPassword"
            type="password"
            icon={Lock}
            value={passForm.newPassword}
            onChange={handlePassChange}
            error={passErrors.newPassword}
            hint="Min 8 characters"
          />
          <Input
            label="Confirm new password"
            name="confirmPassword"
            type="password"
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

export default FacultyProfile