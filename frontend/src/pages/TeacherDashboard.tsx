import { useState, useEffect } from 'react'
import { StudentList } from '@/components/teacher/StudentList'
import { UserDropdown } from '@/components/common/UserDropdown'
import { useAuthStore } from '@/stores/authStore'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { teacherApi, TeacherClass, TeacherStudent } from '@/lib/api'
import { GraduationCap, Users, AlertTriangle, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function TeacherDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [students, setStudents] = useState<TeacherStudent[]>([])
  const [classes, setClasses] = useState<TeacherClass[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPasswordBanner, setShowPasswordBanner] = useState(true)

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

  // Helper function to get role badges
  const getRoleBadges = (isHomeroom: boolean, isQuran: boolean) => {
    const badges = []

    if (isHomeroom && isQuran) {
      badges.push(
        <Badge key="both" variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
          📚 Wali & Guru Quran
        </Badge>
      )
    } else if (isHomeroom) {
      badges.push(
        <Badge key="homeroom" variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
          📚 Wali Kelas
        </Badge>
      )
    } else if (isQuran) {
      badges.push(
        <Badge key="quran" variant="secondary" className="bg-green-100 text-green-800 text-xs">
          📖 Guru Quran
        </Badge>
      )
    }

    return badges
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

      {/* Password Change Notification Banner */}
      {showPasswordBanner && (
        <div className="border-2 border-yellow-300 bg-yellow-50">
          <div className="container mx-auto px-4 max-w-7xl py-3">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-yellow-700 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800 font-medium">
                  Penting: Ganti Password Anda
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Password Anda dibuat dari nomor HP. Untuk keamanan, silakan ganti password dengan password yang lebih kuat.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/profile', { state: { activeTab: 'password' } })}
                  className="px-3 py-1.5 bg-yellow-600 text-white text-sm hover:bg-yellow-700 min-h-[36px] min-w-[36px] border-2 border-yellow-700"
                >
                  Ganti Password
                </button>
                <button
                  onClick={() => setShowPasswordBanner(false)}
                  className="p-1.5 text-yellow-700 hover:bg-yellow-200 min-h-[36px] min-w-[36px] border-2 border-yellow-300"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <div className="flex flex-col items-center">
                    <span>Semua Kelas</span>
                    <span className="text-xs text-gray-600">({students.length})</span>
                  </div>
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
                    <div className="flex flex-col items-center">
                      <span>{cls.name}</span>
                      <span className="flex flex-wrap gap-1 mt-1">
                        {getRoleBadges(cls.is_homeroom_teacher, cls.is_quran_teacher)}
                      </span>
                      <span className="text-xs text-gray-600">({students.filter(s => s.class_id === cls.id).length})</span>
                    </div>
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
