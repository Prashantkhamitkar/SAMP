import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectRole } from '../store/slices/authSlice'
import {
  GraduationCap, LayoutDashboard, BookOpen,
  ClipboardList, BarChart3, Bell, User,
  Users, BookMarked, Calendar, FileText,
  X, Award
} from 'lucide-react'

const NAV_ITEMS = {
  STUDENT: [
    { to: '/student/dashboard',   icon: LayoutDashboard, label: 'Dashboard'    },
    { to: '/student/courses',     icon: BookOpen,        label: 'Course Catalog' },
    { to: '/student/enrollments', icon: ClipboardList,   label: 'My Enrollments' },
    { to: '/student/grades',      icon: Award,           label: 'My Grades'    },
    { to: '/notifications',       icon: Bell,            label: 'Notifications' },
    { to: '/student/profile',     icon: User,            label: 'Profile'      },
  ],
  FACULTY: [
    { to: '/faculty/dashboard',   icon: LayoutDashboard, label: 'Dashboard'    },
    { to: '/faculty/courses',     icon: BookMarked,      label: 'My Courses'   },
    { to: '/notifications',       icon: Bell,            label: 'Notifications' },
  ],
  ADMIN: [
    { to: '/admin/dashboard',     icon: LayoutDashboard, label: 'Dashboard'    },
    { to: '/admin/users',         icon: Users,           label: 'Users'        },
    { to: '/admin/courses',       icon: BookOpen,        label: 'Courses'      },
    { to: '/admin/reports',       icon: BarChart3,       label: 'Reports'      },
    { to: '/admin/calendar',      icon: Calendar,        label: 'Calendar'     },
    { to: '/notifications',       icon: Bell,            label: 'Notifications' },
  ],
}

const ROLE_LABELS = {
  STUDENT: 'Student Portal',
  FACULTY: 'Faculty Portal',
  ADMIN:   'Admin Panel',
}

const ROLE_ACCENT = {
  STUDENT: 'bg-blue-600',
  FACULTY: 'bg-emerald-600',
  ADMIN:   'bg-purple-600',
}

const Sidebar = ({ open, onClose }) => {
  const role = useSelector(selectRole)
  const navItems = NAV_ITEMS[role] || []

  return (
    <>
      {/* Sidebar panel */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-white border-r border-slate-100
          flex flex-col shrink-0
          transform transition-transform duration-200 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 ${ROLE_ACCENT[role] || 'bg-primary-600'} rounded-lg flex items-center justify-center`}>
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-tight">SAMP</p>
              <p className="text-xs text-slate-400 leading-tight">
                {ROLE_LABELS[role]}
              </p>
            </div>
          </div>

          {/* Close button (mobile) */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
          <div className="space-y-0.5">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 shrink-0">
          <p className="text-xs text-slate-400 text-center">
            SAMP v1.0 · GCU Capstone
          </p>
        </div>

      </aside>
    </>
  )
}

export default Sidebar