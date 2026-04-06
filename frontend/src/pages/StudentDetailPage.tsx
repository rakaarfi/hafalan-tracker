import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { HafalanInputForm } from '@/components/teacher/HafalanInputForm'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { studentsApi, memorizationsApi } from '@/lib/api'

interface Student {
  ID: string
  Name: string
  ClassID: string
  ClassName: string
  IsActive: boolean
  CreatedAt: string
}

interface Memorization {
  ID: number
  StudentID: number
  TeacherID: number
  SurahID: number | null
  JuzID: number | null
  UnitType: string
  PageStart: number | null
  PageEnd: number | null
  Status: string
  Notes: string
  TestDate: string
  StudentName: string
  TeacherName: string
  SurahName: string | null
  JuzNumber: number | null
}

export function StudentDetailPage() {
  const { t } = useTranslation()
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()

  const [student, setStudent] = useState<Student | null>(null)
  const [memorizations, setMemorizations] = useState<Memorization[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (studentId) {
      fetchData()
    }
  }, [studentId])

  const fetchData = async () => {
    if (!studentId) return

    try {
      setLoading(true)
      setError(null)

      // Fetch student details
      const studentData = await studentsApi.getById(studentId)
      setStudent(studentData)

      // Fetch memorization history
      const memData = await memorizationsApi.getByStudent(studentId)
      setMemorizations(memData || [])
    } catch (err: any) {
      console.error('Failed to fetch data:', err)
      setError('Gagal memuat data murid')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fluent': return 'text-green-700'
      case 'good': return 'text-yellow-700'
      case 'needs_improvement': return 'text-red-700'
      default: return 'text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'fluent': return 'Lancar'
      case 'good': return 'Cukup'
      case 'needs_improvement': return 'Perlu Perbaikan'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b-2 border-border bg-white p-4">
        <div className="container mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Kembali ke Dashboard
          </button>
          {loading ? (
            <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
          ) : error ? (
            <div>
              <h1 className="text-2xl font-bold text-red-600">Error</h1>
            </div>
          ) : student ? (
            <>
              <h1 className="text-2xl font-bold">{t('teacher.inputHafalan')}</h1>
              <p className="text-sm text-gray-600">
                {student.Name} - {student.ClassName}
              </p>
            </>
          ) : null}
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-6 px-4">
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
        ) : student ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Student Info Card */}
            <div className="border-2 border-border bg-white p-6">
              <h2 className="text-lg font-semibold mb-4">Informasi Murid</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nama Lengkap</p>
                  <p className="font-semibold">{student.Name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Kelas</p>
                  <p className="font-semibold">{student.ClassName}</p>
                </div>
              </div>
            </div>

            {/* Recent Memorizations */}
            {memorizations && memorizations.length > 0 && (
              <div className="border-2 border-border bg-white p-6">
                <h2 className="text-lg font-semibold mb-4">Riwayat Hafalan Terakhir</h2>
                <div className="space-y-3">
                  {memorizations.slice(0, 5).map((mem) => (
                    <div key={mem.ID} className="border-2 border-gray-100 p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{mem.SurahName || mem.UnitType}</p>
                          <p className="text-sm text-gray-600">{new Date(mem.TestDate).toLocaleDateString('id-ID')}</p>
                          {mem.Notes && (
                            <p className="text-sm text-gray-500 mt-1">{mem.Notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-medium ${getStatusColor(mem.Status)}`}>
                            {getStatusText(mem.Status)}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{mem.TeacherName}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <div className="border-2 border-border bg-white p-6">
              <h2 className="text-lg font-semibold mb-4">Input Hafalan Baru</h2>
              <HafalanInputForm studentId={student.ID} onSuccess={fetchData} />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
