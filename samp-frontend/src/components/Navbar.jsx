import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Menu, Bell, ChevronDown,
  LogOut, User, Settings
} from 'lucide-react'
import { selectUser, selectRole } from '../store/slices/authSlice'
import { selectUnreadCount } from '../store/slices/notificationSlice'
import { logout } from '../store/slices/authSlice'
import { clearNotifications } from '../store/slices/notificationSlice'
import { getInitials } from '../utils/helpers'
import { ROLE_HOME } from '../utils/constants'

const ROLE_LABELS = {
  STUDENT: 'Student',
  FACULTY: 'Faculty',
  ADMIN:   'Administrator',
}

const ROLE_COLORS = {
  STUDENT: 'bg-blue-100 text-blue-700',
  FACULTY: 'bg-emerald-100 text-emerald-700',
  ADMIN:   'bg-purple-100 text-purple-700',
}

const Navbar = ({ onMenuClick }) => {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const user       = useSelector(selectUser)
  const role       = useSelector(selectRole)
  const unreadCount = useSelector(selectUnreadCount)

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    dispatch(clearNotifications())
    navigate('/login')
  }

  const profilePath = role === 'STUDENT'
    ? '/student/profile'
    : role === 'FACULTY'
    ? '/faculty/profile'
    : null

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6 shrink-0">

      {/* Left — hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Center — page context (desktop hides hamburger) */}
      <div className="hidden lg:block" />

      {/* Right — actions */}
      <div className="flex items-center gap-2">

        {/* Notification bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-semibold">
                {getInitials(user?.fullName)}
              </span>
            </div>

            {/* Name + role */}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-900 leading-tight">
                {user?.fullName}
              </p>
              <p className="text-xs text-slate-500 leading-tight">
                {ROLE_LABELS[role]}
              </p>
            </div>

            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-100 shadow-lg py-1.5 z-50">

              {/* User info header */}
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900">
                  {user?.fullName}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {user?.email}
                </p>
                <span className={`inline-flex mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[role]}`}>
                  {ROLE_LABELS[role]}
                </span>
              </div>

              {/* Menu items */}
              <div className="py-1">
                {profilePath && (
                  <button
                    onClick={() => { navigate(profilePath); setDropdownOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    My Profile
                  </button>
                )}

                <button
                  onClick={() => { navigate('/notifications'); setDropdownOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Bell className="w-4 h-4 text-slate-400" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-red-100 text-red-700 text-xs font-medium px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-slate-100 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar