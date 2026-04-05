import { StudentList } from '@/components/teacher/StudentList'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from 'react-i18next'

export function TeacherDashboard() {
  const { t } = useTranslation()
  const { user, logout } = useAuthStore()

  // Mock data - will fetch from API
  const students = [
    {
      id: '1',
      name: 'Ahmad Fauzi',
      class_name: 'Kelas 6A',
      last_test_date: '2026-04-01',
      last_status: 'fluent'
    },
    {
      id: '2',
      name: 'Siti Aminah',
      class_name: 'Kelas 6A',
      last_test_date: '2026-04-03',
      last_status: 'good'
    },
    {
      id: '3',
      name: 'Muhammad Rizki',
      class_name: 'Kelas 6B',
      last_test_date: '2026-03-28',
      last_status: 'needs_improvement'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - SOLID BORDER, NO SHADOW */}
      <header className="border-b-2 border-border bg-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t('teacher.dashboard')}</h1>
            <p className="text-sm text-gray-600">
              {t('auth.welcome')}, {user?.name || user?.email}
            </p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 border-2 border-border hover:bg-gray-50 min-h-[44px] min-w-[44px]"
          >
            {t('auth.logout')}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-6 px-4">
        <h2 className="text-xl font-semibold mb-4">{t('teacher.studentList')}</h2>

        {/* LIST VIEW - tap to drill down */}
        <StudentList students={students} />
      </main>
    </div>
  )
}
