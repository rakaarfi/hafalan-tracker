import { useState, useEffect } from 'react'
import { StudentList } from '@/components/teacher/StudentList'
import { MobileNav } from '@/components/common/MobileNav'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from 'react-i18next'
import { teacherApi } from '@/lib/api'
import { GraduationCap, Users } from 'lucide-react'

interface Student {
  id: string
  name: string
  class_name: string
  last_test_date?: string
  last_status?: string
}

export function TeacherDashboard() {
  const { t } = useTranslation()
  const { user, logout } = useAuthStore()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await teacherApi.getMyStudents()
      setStudents(data)
    } catch (err: any) {
      console.error('Failed to fetch students:', err)
      setError('Gagal memuat data murid')
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
            <h1 className="text-xl md:text-2xl font-bold">{t('teacher.dashboard')}</h1>
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
                <Users size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold">{students.length}</div>
                <div className="text-sm text-gray-600">Total Murid</div>
              </div>
            </div>
          </div>

          <div className="border-2 border-border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 text-white flex items-center justify-center">
                <GraduationCap size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {students.filter(s => s.last_status === 'fluent').length}
                </div>
                <div className="text-sm text-gray-600">Hafalan Lancar</div>
              </div>
            </div>
          </div>

          <div className="border-2 border-border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-600 text-white flex items-center justify-center">
                <GraduationCap size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {students.filter(s => s.last_status === 'good' || s.last_status === 'needs_improvement').length}
                </div>
                <div className="text-sm text-gray-600">Perlu Perhatian</div>
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="border-2 border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={fetchStudents}
              className="mt-4 px-4 py-2 border-2 border-red-300 text-red-700 hover:bg-red-100 min-h-[44px] min-w-[44px]"
            >
              Coba Lagi
            </button>
          </div>
        ) : students.length === 0 ? (
          <div className="border-2 border-border bg-white p-6 text-center">
            <GraduationCap size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Belum ada murid</p>
          </div>
        ) : (
          <StudentList students={students} />
        )}
      </main>
    </div>
  )
}
