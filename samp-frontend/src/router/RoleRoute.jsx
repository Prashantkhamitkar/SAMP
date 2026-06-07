import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectRole } from '../store/slices/authSlice'
import { ROLE_HOME } from '../utils/constants'

const RoleRoute = ({ allowedRole }) => {
  const role = useSelector(selectRole)

  if (role !== allowedRole) {
    const redirectPath = ROLE_HOME[role] || '/login'
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet />
}

export default RoleRoute