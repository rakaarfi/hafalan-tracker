import { BrowserRouter } from 'react-router-dom'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { LoginPage } from '@/pages/LoginPage'
import { TeacherDashboard } from '@/pages/TeacherDashboard'
import { StudentDetailPage } from '@/pages/StudentDetailPage'
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
            path="/teacher/students/:studentId"
            element={isAuthenticated ? <StudentDetailPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/parent/*"
            element={isAuthenticated ? <div>Parent Dashboard</div> : <Navigate to="/login" replace />}
          />
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  )
}

export default App
