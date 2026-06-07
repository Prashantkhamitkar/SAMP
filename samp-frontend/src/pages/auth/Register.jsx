import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Mail, Lock, User, Hash,
  BookOpen, GraduationCap, ChevronRight, ChevronLeft
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  registerThunk,
  selectAuthLoading,
  selectAuthError,
  clearError,
} from '../../store/slices/authSlice'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'

const YEAR_OPTIONS = [
  { value: '1', label: 'Year 1 — Freshman'  },
  { value: '2', label: 'Year 2 — Sophomore' },
  { value: '3', label: 'Year 3 — Junior'    },
  { value: '4', label: 'Year 4 — Senior'    },
  { value: '5', label: 'Year 5'             },
  { value: '6', label: 'Year 6'             },
]

const MAJOR_OPTIONS = [
  { value: 'Computer Science',        label: 'Computer Science'         },
  { value: 'Information Technology',  label: 'Information Technology'   },
  { value: 'Software Engineering',    label: 'Software Engineering'     },
  { value: 'Data Science',            label: 'Data Science'             },
  { value: 'Cybersecurity',           label: 'Cybersecurity'            },
  { value: 'Business Administration', label: 'Business Administration'  },
  { value: 'Mathematics',             label: 'Mathematics'              },
  { value: 'Other',                   label: 'Other'                    },
]

const STEPS = ['Personal Info', 'Account Setup', 'Academic Info']

const Register = () => {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const isLoading = useSelector(selectAuthLoading)
  const error     = useSelector(selectAuthError)

  const [step, setStep] = useState(0)

  const [form, setForm] = useState({
    firstName: '',
    lastName:  '',
    email:     '',
    password:  '',
    confirmPassword: '',
    studentId: '',
    major:     '',
    year:      '',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // ── Per-step validation ─────────────────────────────────────────────────────

  const validateStep0 = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'First name is required'
    else if (form.firstName.length < 2) e.firstName = 'At least 2 characters'
    if (!form.lastName.trim()) e.lastName = 'Last name is required'
    else if (form.lastName.length < 2) e.lastName = 'At least 2 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep1 = () => {
    const e = {}
    if (!form.email.trim()) {
      e.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Invalid email format'
    }
    if (!form.password) {
      e.password = 'Password is required'
    } else if (form.password.length < 8) {
      e.password = 'At least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      e.password = 'Must contain uppercase, lowercase and a number'
    }
    if (!form.confirmPassword) {
      e.confirmPassword = 'Please confirm your password'
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = 'Passwords do not match'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = () => {
    const e = {}
    if (!form.studentId.trim()) e.studentId = 'Student ID is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    const valid =
      step === 0 ? validateStep0() :
      step === 1 ? validateStep1() :
      validateStep2()
    if (valid) setStep((s) => s + 1)
  }

  const handleBack = () => {
    setErrors({})
    setStep((s) => s - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep2()) return

    const payload = {
      firstName: form.firstName.trim(),
      lastName:  form.lastName.trim(),
      email:     form.email.trim(),
      password:  form.password,
      studentId: form.studentId.trim(),
      major:     form.major || null,
      year:      form.year  ? parseInt(form.year) : null,
    }

    const result = await dispatch(registerThunk(payload))
    if (registerThunk.fulfilled.match(result)) {
      toast.success('Account created successfully! Welcome to SAMP.')
      navigate('/student/dashboard', { replace: true })
    }
  }

  // ── Step indicator ──────────────────────────────────────────────────────────

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-7">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
              transition-all duration-200
              ${i < step  ? 'bg-primary-600 text-white'         :
                i === step ? 'bg-primary-600 text-white ring-4 ring-primary-100' :
                             'bg-slate-100 text-slate-400'}
            `}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-[10px] mt-1 font-medium whitespace-nowrap
              ${i === step ? 'text-primary-600' : 'text-slate-400'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-10 h-0.5 mx-1 mb-4 transition-all duration-300
              ${i < step ? 'bg-primary-600' : 'bg-slate-200'}`}
            />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">
          Create your account
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Student registration — step {step + 1} of {STEPS.length}
        </p>
      </div>

      <StepIndicator />

      <form onSubmit={handleSubmit} noValidate>

        {/* ── Step 0: Personal Info ─────────────────────────────────────── */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                name="firstName"
                placeholder="John"
                icon={User}
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
          </div>
        )}

        {/* ── Step 1: Account Setup ─────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="you@example.com"
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
              icon={Lock}
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              required
              hint="Must contain uppercase, lowercase and a number"
            />
            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              icon={Lock}
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />
          </div>
        )}

        {/* ── Step 2: Academic Info ─────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <Input
              label="Student ID"
              name="studentId"
              placeholder="e.g. STU-2024-001"
              icon={Hash}
              value={form.studentId}
              onChange={handleChange}
              error={errors.studentId}
              required
              hint="This must match your institution's student ID"
            />
            <Select
              label="Major"
              name="major"
              options={MAJOR_OPTIONS}
              placeholder="Select your major"
              value={form.major}
              onChange={handleChange}
            />
            <Select
              label="Year of study"
              name="year"
              options={YEAR_OPTIONS}
              placeholder="Select your year"
              value={form.year}
              onChange={handleChange}
            />
          </div>
        )}

        {/* ── Navigation buttons ────────────────────────────────────────── */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              disabled={isLoading}
              icon={ChevronLeft}
              className="flex-1"
            >
              Back
            </Button>
          )}

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              icon={ChevronRight}
              iconPosition="right"
              className="flex-1"
            >
              Continue
            </Button>
          ) : (
            <Button
              type="submit"
              loading={isLoading}
              icon={GraduationCap}
              className="flex-1"
            >
              Create account
            </Button>
          )}
        </div>

      </form>

      {/* Login link */}
      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
        >
          Sign in
        </Link>
      </p>

    </div>
  )
}

export default Register