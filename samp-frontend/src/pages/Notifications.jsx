import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Bell, Award, TrendingUp,
  ClipboardList, XCircle, CheckCircle,
  CheckCheck, BellOff
} from 'lucide-react'
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  selectNotifications,
  selectNotifLoading,
  selectUnreadCount,
} from '../store/slices/notificationSlice'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import { PageLoader } from '../components/ui/Spinner'
import { timeAgo } from '../utils/helpers'

const TYPE_CONFIG = {
  GRADE_POSTED: {
    icon:  Award,
    bg:    'bg-emerald-50',
    color: 'text-emerald-600',
    label: 'Grade Posted',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  GRADE_UPDATED: {
    icon:  TrendingUp,
    bg:    'bg-blue-50',
    color: 'text-blue-600',
    label: 'Grade Updated',
    badge: 'bg-blue-100 text-blue-700',
  },
  ENROLLMENT_CONFIRMED: {
    icon:  ClipboardList,
    bg:    'bg-primary-50',
    color: 'text-primary-600',
    label: 'Enrolled',
    badge: 'bg-primary-100 text-primary-700',
  },
  COURSE_DROPPED: {
    icon:  XCircle,
    bg:    'bg-red-50',
    color: 'text-red-500',
    label: 'Course Dropped',
    badge: 'bg-red-100 text-red-700',
  },
  GENERAL: {
    icon:  Bell,
    bg:    'bg-slate-100',
    color: 'text-slate-500',
    label: 'General',
    badge: 'bg-slate-100 text-slate-600',
  },
}

const Notifications = () => {
  const dispatch      = useDispatch()
  const notifications = useSelector(selectNotifications)
  const isLoading     = useSelector(selectNotifLoading)
  const unreadCount   = useSelector(selectUnreadCount)

  useEffect(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  const handleMarkRead = (id) => {
    dispatch(markNotificationRead(id))
  }

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead())
  }

  const unread = notifications.filter((n) => !n.read)
  const read   = notifications.filter((n) => n.read)

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6 max-w-3xl">

      <PageHeader
        title="Notifications"
        subtitle={
          unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
            : 'All caught up!'
        }
        actions={
          unreadCount > 0 && (
            <Button
              variant="secondary"
              icon={CheckCheck}
              onClick={handleMarkAllRead}
            >
              Mark all as read
            </Button>
          )
        }
      />

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <BellOff className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-base font-semibold text-slate-600">
            No notifications yet
          </p>
          <p className="text-sm text-slate-400 mt-1">
            You'll see grade updates and enrollment confirmations here
          </p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Unread */}
          {unread.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-slate-700">
                  Unread
                </h2>
                <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {unread.length}
                </span>
              </div>
              <div className="space-y-2">
                {unread.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onMarkRead={handleMarkRead}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Read */}
          {read.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-400 mb-3">
                Earlier
              </h2>
              <div className="space-y-2">
                {read.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onMarkRead={handleMarkRead}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  )
}

const NotificationItem = ({ notification, onMarkRead }) => {
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.GENERAL
  const Icon   = config.icon

  return (
    <div className={`
      flex items-start gap-4 p-4 rounded-xl border transition-all duration-200
      ${!notification.read
        ? 'bg-white border-primary-100 shadow-sm'
        : 'bg-slate-50 border-transparent'}
    `}>

      {/* Icon */}
      <div className={`
        w-10 h-10 rounded-xl flex items-center justify-center shrink-0
        ${config.bg}
      `}>
        <Icon className={`w-5 h-5 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.badge}`}>
            {config.label}
          </span>
          {!notification.read && (
            <span className="w-2 h-2 bg-primary-500 rounded-full" />
          )}
        </div>
        <p className={`text-sm leading-relaxed ${
          notification.read ? 'text-slate-500' : 'text-slate-800 font-medium'
        }`}>
          {notification.message}
        </p>
        <p className="text-xs text-slate-400 mt-1.5">
          {timeAgo(notification.createdAt)}
        </p>
      </div>

      {/* Mark read button */}
      {!notification.read && (
        <button
          onClick={() => onMarkRead(notification.id)}
          className="shrink-0 w-8 h-8 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-colors"
          title="Mark as read"
        >
          <CheckCircle className="w-4 h-4" />
        </button>
      )}

    </div>
  )
}

export default Notifications