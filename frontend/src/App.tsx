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
import { StudentFormPage } from '@/pages/admin/StudentFormPage'
import { useAuthStore } from '@/stores/authStore'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 border-x border-border">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/teacher"
            element={isAuthenticated ? <TeacherDashboard /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/teacher/dashboard"
            element={isAuthenticated ? <TeacherDashboard /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/teacher/students/:studentId"
            element={isAuthenticated ? <StudentDetailPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/parent"
            element={isAuthenticated ? <ParentDashboard /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/parent/dashboard"
            element={isAuthenticated ? <ParentDashboard /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/parent/children/:childId"
            element={isAuthenticated ? <ChildDetailPage /> : <Navigate to="/login" replace />}
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" replace />}
          >
            <Route index element={<AdminOverviewPage />} />
            <Route path="dashboard" element={<AdminOverviewPage />} />
            <Route path="students" element={<StudentListPage />} />
            <Route path="students/new" element={<StudentFormPage />} />
            <Route path="students/:studentId/edit" element={<StudentFormPage />} />
          </Route>
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  )
}

export default App
