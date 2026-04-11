import { BrowserRouter } from 'react-router-dom'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { LoginPage } from '@/pages/LoginPage'
import { TeacherDashboard } from '@/pages/TeacherDashboard'
import { StudentDetailPage } from '@/pages/StudentDetailPage'
import { ParentDashboard } from '@/pages/ParentDashboard'
import { ChildDetailPage } from '@/pages/ChildDetailPage'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminOverviewPage } from '@/pages/admin/AdminOverviewPage'
import { StudentListPage } from '@/pages/admin/StudentListPage'
import { StudentViewPage } from '@/pages/admin/StudentViewPage'
import { StudentFormPage } from '@/pages/admin/StudentFormPage'
import { ParentListPage } from '@/pages/admin/ParentListPage'
import { ParentFormPage } from '@/pages/admin/ParentFormPage'
import { TeacherListPage } from '@/pages/admin/TeacherListPage'
import { TeacherFormPage } from '@/pages/admin/TeacherFormPage'
import { ClassListPage } from '@/pages/admin/ClassListPage'
import { ClassFormPage } from '@/pages/admin/ClassFormPage'
import { ReportsPage } from '@/pages/admin/ReportsPage'
import { SettingsPage } from '@/pages/admin/SettingsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { useAuthStore } from '@/stores/authStore'

// Protected Route Component for Role-Based Access
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    if (user.role === 'teacher') {
      return <Navigate to="/teacher/dashboard" replace />
    } else if (user.role === 'parent') {
      return <Navigate to="/parent/dashboard" replace />
    } else {
      return <Navigate to="/login" replace />
    }
  }

  return <>{children}</>
}

// Profile Redirect Component - Redirects to role-appropriate profile page
function ProfileRedirect() {
  const { user } = useAuthStore()

  // Admin goes to admin profile (with sidebar)
  if (user?.role === 'admin') {
    return <Navigate to="/admin/profile" replace />
  }

  // Teacher and Parent stay on /profile (standalone page)
  return <ProfilePage />
}

// Public Route - redirect to dashboard if already authenticated
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'teacher') {
      return <Navigate to="/teacher/dashboard" replace />
    } else if (user.role === 'parent') {
      return <Navigate to="/parent/dashboard" replace />
    } else if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    }
  }

  return <>{children}</>
}

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 border-x border-border">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/students/:studentId"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <StudentDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Parent Routes */}
          <Route
            path="/parent"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/dashboard"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ParentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/children/:childId"
            element={
              <ProtectedRoute allowedRoles={['parent']}>
                <ChildDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes - Admin Only! */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverviewPage />} />
            <Route path="dashboard" element={<AdminOverviewPage />} />
            <Route path="students" element={<StudentListPage />} />
            <Route path="students/new" element={<StudentFormPage />} />
            <Route path="students/:studentId" element={<StudentViewPage />} />
            <Route path="students/:studentId/edit" element={<StudentFormPage />} />
            <Route path="parents" element={<ParentListPage />} />
            <Route path="parents/new" element={<ParentFormPage />} />
            <Route path="parents/:parentId/edit" element={<ParentFormPage />} />
            <Route path="teachers" element={<TeacherListPage />} />
            <Route path="teachers/new" element={<TeacherFormPage />} />
            <Route path="teachers/:teacherId/edit" element={<TeacherFormPage />} />
            <Route path="classes" element={<ClassListPage />} />
            <Route path="classes/new" element={<ClassFormPage />} />
            <Route path="classes/:classId/edit" element={<ClassFormPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage embedded={true} />} />
          </Route>

          {/* Profile Routes - Role-based redirect */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileRedirect />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  )
}

export default App
