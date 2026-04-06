import { useState, useEffect } from 'react'
import { ChildProgressCard } from '@/components/parent/ChildProgressCard'
import { MobileNav } from '@/components/common/MobileNav'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from 'react-i18next'
import { parentsApi } from '@/lib/api'
import { Users, Baby, AlertCircle } from 'lucide-react'

interface Child {
  student: {
    ID: string
    Name: string
    ClassName: string
  }
  recent_tests: Array<{
    ID: number
    UnitType: string
    SurahName?: string
    Status: string
    Notes: string
    TestDate: string
  }>
  total_tests: number
  average_score: number
  latest_test?: any
}

export function ParentDashboard() {
  const { t } = useTranslation()
  const { user, logout } = useAuthStore()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchChildren()
  }, [])

  const fetchChildren = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await parentsApi.getMyChildren()
      setChildren(data)
    } catch (err: any) {
      console.error('Failed to fetch children:', err)
      setError('Gagal memuat data anak')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - SOLID BORDER, NO SHADOW */}
      <header className="border-b-2 border-border bg-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold">{t('parent.dashboard')}</h1>
            <p className="text-sm text-gray-600">
              {t('auth.welcome')}, {user?.name || user?.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Desktop logout button */}
            <button
              onClick={logout}
              className="hidden lg:block px-4 py-2 border-2 border-border hover:bg-gray-50 min-h-[44px] min-w-[44px]"
            >
              Keluar
            </button>
            {/* Mobile menu button */}
            <MobileNav />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-6 px-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border-2 border-border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary text-white flex items-center justify-center">
                <Baby size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold">{children.length}</div>
                <div className="text-sm text-gray-600">Total Anak</div>
              </div>
            </div>
          </div>

          <div className="border-2 border-border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 text-white flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {children.length > 0
                    ? Math.round(children.reduce((sum, child) => sum + (child.total_tests || 0), 0) / children.length)
                    : 0}
                </div>
                <div className="text-sm text-gray-600">Rata-rata Total Tes</div>
              </div>
            </div>
          </div>

          <div className="border-2 border-border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {children.reduce((sum, child) => sum + (child.total_tests || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Total Tes Semua Anak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Children List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="border-2 border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={fetchChildren}
              className="mt-4 px-4 py-2 border-2 border-red-300 text-red-700 hover:bg-red-100 min-h-[44px] min-w-[44px]"
            >
              Coba Lagi
            </button>
          </div>
        ) : children.length === 0 ? (
          <div className="border-2 border-border bg-white p-6 text-center">
            <Baby size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Belum ada data anak</p>
            <p className="text-sm text-gray-400 mt-2">Silakan hubungi admin untuk penambahan data anak</p>
          </div>
        ) : (
          <div className="space-y-4">
            {children.map((child) => (
              <ChildProgressCard key={child.student.ID} child={child} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
