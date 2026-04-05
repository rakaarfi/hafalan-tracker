import { ChildProgressCard } from '@/components/parent/ChildProgressCard'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from 'react-i18next'

export function ParentDashboard() {
  const { t } = useTranslation()
  const { user, logout } = useAuthStore()

  // Mock data - will fetch from API
  const children = [
    {
      id: '1',
      name: 'Ahmad Fauzi',
      class_name: 'Kelas 6A',
      overall_progress: {
        percent: 40,
        total_units: 114, // 30 juz
        completed: 45
      },
      recent_status: [
        { date: '2026-04-01', unit: 'Juz 30', status: 'fluent' },
        { date: '2026-03-28', unit: 'An-Naba', status: 'good' },
        { date: '2026-03-25', unit: 'Al-Baqarah 1-10', status: 'fluent' }
      ]
    },
    {
      id: '2',
      name: 'Siti Aminah',
      class_name: 'Kelas 6A',
      overall_progress: {
        percent: 25,
        total_units: 114,
        completed: 28
      },
      recent_status: [
        { date: '2026-04-03', unit: 'Al-Fatihah', status: 'good' },
        { date: '2026-03-30', unit: 'Juz 1', status: 'needs_improvement' },
        { date: '2026-03-27', unit: 'Yasin', status: 'good' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - SOLID BORDER, NO SHADOW */}
      <header className="border-b-2 border-border bg-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{t('parent.dashboard')}</h1>
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

      {/* Main content - SNAPSHOT VIEW, NOT detailed analytics */}
      <main className="container mx-auto py-6 px-4">
        <h2 className="text-xl font-semibold mb-4">{t('parent.children')}</h2>

        {/* STATUS SNAPSHOT - one card per child */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child) => (
            <ChildProgressCard key={child.id} child={child} />
          ))}
        </div>
      </main>
    </div>
  )
}
