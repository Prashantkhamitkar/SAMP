import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectRole } from '../store/slices/authSlice'
import { ROLE_HOME } from '../utils/constants'
import { GraduationCap, ArrowLeft } from 'lucide-react'

const NotFound = () => {
  const navigate = useNavigate()
  const role = useSelector(selectRole)

  const handleBack = () => {
    navigate(role ? ROLE_HOME[role] : '/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-6">
        <GraduationCap className="w-9 h-9 text-white" />
      </div>
      <h1 className="text-6xl font-bold text-slate-200 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-slate-800 mb-2">
        Page not found
      </h2>
      <p className="text-slate-500 text-sm mb-8 text-center">
        The page you're looking for doesn't exist or you don't have access.
      </p>
      <button onClick={handleBack} className="btn-primary">
        <ArrowLeft className="w-4 h-4" />
        Go back home
      </button>
    </div>
  )
}

export default NotFound