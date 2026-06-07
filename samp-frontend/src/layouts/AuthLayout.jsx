import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectRole } from '../store/slices/authSlice'
import { ROLE_HOME } from '../utils/constants'
import { GraduationCap } from 'lucide-react'

const AuthLayout = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const role = useSelector(selectRole)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(ROLE_HOME[role], { replace: true })
    }
  }, [isAuthenticated, role, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-100 rounded-full opacity-30" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-100 rounded-full opacity-30" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">SAMP</h1>
          <p className="text-sm text-slate-500 mt-1">
            Student Academic Management Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 SAMP — Capstone Project · GCU
        </p>
      </div>
    </div>
  )
}

export default AuthLayout