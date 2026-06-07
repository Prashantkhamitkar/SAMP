import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Guards
import ProtectedRoute from './router/ProtectedRoute'
import RoleRoute from './router/RoleRoute'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Student Pages
import StudentDashboard from './pages/student/Dashboard'
import StudentCourses from './pages/student/Courses'
import StudentEnrollments from './pages/student/Enrollments'
import StudentGrades from './pages/student/Grades'
import StudentProfile from './pages/student/Profile'

// Faculty Pages
import FacultyDashboard from './pages/faculty/Dashboard'
import FacultyMyCourses from './pages/faculty/MyCourses'
import FacultyGradeEntry from './pages/faculty/GradeEntry'
import FacultyCourseForm from './pages/faculty/CourseForm'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminCourses from './pages/admin/Courses'
import AdminReports from './pages/admin/Reports'
import AdminCalendar from './pages/admin/Calendar'

// Shared
import Notifications from './pages/Notifications'
import NotFound from './pages/NotFound'
import FacultyProfile from './pages/faculty/Profile'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public Routes ───────────────────────────────────────────── */}
        <Route element={<AuthLayout />}>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* ── Protected Routes ────────────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>

          {/* ── Student ───────────────────────────────────────────────── */}
          <Route element={<RoleRoute allowedRole="STUDENT" />}>
            <Route element={<DashboardLayout />}>
              <Route path="/student/dashboard"   element={<StudentDashboard />} />
              <Route path="/student/courses"     element={<StudentCourses />} />
              <Route path="/student/enrollments" element={<StudentEnrollments />} />
              <Route path="/student/grades"      element={<StudentGrades />} />
              <Route path="/student/profile"     element={<StudentProfile />} />
            </Route>
          </Route>

          {/* ── Faculty ───────────────────────────────────────────────── */}
          <Route element={<RoleRoute allowedRole="FACULTY" />}>
            <Route element={<DashboardLayout />}>
              <Route path="/faculty/dashboard"        element={<FacultyDashboard />} />
              <Route path="/faculty/courses"          element={<FacultyMyCourses />} />
              <Route path="/faculty/courses/new"      element={<FacultyCourseForm />} />
              <Route path="/faculty/courses/:id/edit" element={<FacultyCourseForm />} />
              <Route path="/faculty/courses/:id/grades" element={<FacultyGradeEntry />} />
              <Route path="/faculty/profile" element={<FacultyProfile />} />
            </Route>
          </Route>

          {/* ── Admin ─────────────────────────────────────────────────── */}
          <Route element={<RoleRoute allowedRole="ADMIN" />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users"     element={<AdminUsers />} />
              <Route path="/admin/courses"   element={<AdminCourses />} />
              <Route path="/admin/reports"   element={<AdminReports />} />
              <Route path="/admin/calendar"  element={<AdminCalendar />} />
            </Route>
          </Route>

          {/* ── Shared ────────────────────────────────────────────────── */}
          <Route element={<DashboardLayout />}>
            <Route path="/notifications" element={<Notifications />} />
          </Route>

        </Route>

        {/* ── Redirects ───────────────────────────────────────────────── */}
        <Route path="/"  element={<Navigate to="/login" replace />} />
        <Route path="*"  element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App