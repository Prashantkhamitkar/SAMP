import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Mail, Lock, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  loginThunk,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated,
  selectRole,
  clearError,
} from '../../store/slices/authSlice'
import { ROLE_HOME } from '../../utils/constants'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const Login = () => {
  const dispatch       = useDispatch()
  const navigate       = useNavigate()
  const location       = useLocation()
  const isLoading      = useSelector(selectAuthLoading)
  const error          = useSelector(selectAuthError)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const role           = useSelector(selectRole)

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && role) {
      const from = location.state?.from?.pathname || ROLE_HOME[role]
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, role, navigate, location])

  // Show backend error as toast
  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const validate = () => {
    const newErrors = {}
    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format'
    }
    if (!form.password) {
      newErrors.password = 'Password is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const result = await dispatch(loginThunk(form))
    if (loginThunk.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.fullName}!`)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <h2 className="text-xl font-bold text-slate-900">
          Sign in to your account
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Enter your credentials to continue
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">

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
          disabled={isLoading}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          icon={Lock}
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          required
          disabled={isLoading}
        />

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          className="mt-2"
        >
          Sign in
        </Button>

      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-slate-400">
            New to SAMP?
          </span>
        </div>
      </div>

      {/* Register link */}
      <Link to="/register">
        <Button variant="secondary" fullWidth>
          Create a student account
        </Button>
      </Link>

      {/* Demo credentials */}
      <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
        <p className="text-xs font-semibold text-slate-500 mb-2.5 uppercase tracking-wider">
          Demo credentials
        </p>
        <div className="space-y-2">
          {[
            { role: 'Admin',   email: 'admin@samp.edu',   pass: 'Admin@1234',   color: 'bg-purple-100 text-purple-700' },
            { role: 'Faculty', email: 'faculty@samp.edu', pass: 'Faculty@1234', color: 'bg-emerald-100 text-emerald-700' },
            { role: 'Student', email: 'student@samp.edu', pass: 'Student@1234', color: 'bg-blue-100 text-blue-700' },
          ].map(({ role, email, pass, color }) => (
            <button
              key={role}
              type="button"
              onClick={() => setForm({ email, password: pass })}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200 text-left"
            >
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color} shrink-0`}>
                {role}
              </span>
              <span className="text-xs text-slate-500 font-mono truncate">
                {email}
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}

export default Login