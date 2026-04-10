import { useState, useEffect } from 'react'
import { StudentList } from '@/components/teacher/StudentList'
import { UserDropdown } from '@/components/common/UserDropdown'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from 'react-i18next'
import { teacherApi, Student, Class } from '@/lib/api'
import { GraduationCap, Users } from 'lucide-react'

export function TeacherDashboard() {
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAuthStore()
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (isAuthenticated) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [studentsData, classesData] = await Promise.all([
        teacherApi.getMyStudents(),
        teacherApi.getMyClasses()
      ])
      setStudents(studentsData)
      setClasses(classesData)
    } catch (err: any) {
      console.error('Failed to fetch data:', err)
      // Don't show error if it's a 401 (user will be redirected to login)
      if (err.response?.status !== 401) {
        setError('Gagal memuat data')
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = selectedClass === 'all'
    ? students
    : students.filter(student => student.class_id === selectedClass)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - SOLID BORDER, NO SHADOW */}
      <header className="border-b-2 border-border bg-white p-4">
        <div className="container mx-auto flex justify-between items-center max-w-7xl">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold">{t('teacher.dashboard')}</h1>
            <p className="text-sm text-gray-600">
              {t('auth.welcome')}, {user?.name || user?.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* User dropdown */}
            <UserDropdown user={user} />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-6 px-4 max-w-7xl">
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

        {/* Class Tabs - Only show if teacher has more than 1 class */}
        {!loading && classes.length > 1 && (
          <div className="mb-6">
            <div className="border-2 border-border bg-white">
              <div className="flex overflow-x-auto">
                <button
                  onClick={() => setSelectedClass('all')}
                  className={`px-6 py-3 min-w-[120px] text-sm font-medium border-r-2 border-border transition-colors ${
                    selectedClass === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Semua Kelas ({students.length})
                </button>
                {classes.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClass(cls.id)}
                    className={`px-6 py-3 min-w-[120px] text-sm font-medium border-r-2 border-border last:border-r-0 transition-colors ${
                      selectedClass === cls.id
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {cls.name} ({students.filter(s => s.class_id === cls.id).length})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

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
              onClick={fetchData}
              className="mt-4 px-4 py-2 border-2 border-red-300 text-red-700 hover:bg-red-100 min-h-[44px] min-w-[44px]"
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="border-2 border-border bg-white p-6 text-center">
            <GraduationCap size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Belum ada murid</p>
          </div>
        ) : (
          <StudentList students={filteredStudents} />
        )}
      </main>
    </div>
  )
}
