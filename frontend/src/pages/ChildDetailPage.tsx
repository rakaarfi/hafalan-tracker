import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Calendar } from 'lucide-react'
import { parentsApi } from '@/lib/api'

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
    TeacherName: string
  }>
  total_tests: number
  average_score: number
  latest_test?: any
}

export function ChildDetailPage() {
  const { t } = useTranslation()
  const { childId } = useParams<{ childId: string }>()
  const navigate = useNavigate()

  const [child, setChild] = useState<Child | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (childId) {
      fetchChildData()
    }
  }, [childId])

  const fetchChildData = async () => {
    if (!childId) return

    try {
      setLoading(true)
      setError(null)

      const data = await parentsApi.getChildProgress(childId)
      setChild(data)
    } catch (err: any) {
      console.error('Failed to fetch child data:', err)
      if (err.response?.status === 403) {
        setError('Anda tidak memiliki akses untuk melihat data anak ini')
      } else {
        setError('Gagal memuat data anak')
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fluent': return 'bg-green-100 text-green-800 border-2 border-green-200'
      case 'good': return 'bg-yellow-100 text-yellow-800 border-2 border-yellow-200'
      case 'needs_improvement': return 'bg-red-100 text-red-800 border-2 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-2 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
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
          ) : child ? (
            <>
              <h1 className="text-2xl font-bold">Detail Progress</h1>
              <p className="text-sm text-gray-600">
                {child.student.Name} - {child.student.ClassName}
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
              onClick={fetchChildData}
              className="mt-4 px-4 py-2 border-2 border-red-300 text-red-700 hover:bg-red-100 min-h-[44px] min-w-[44px]"
            >
              Coba Lagi
            </button>
          </div>
        ) : child ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-border bg-white p-6">
                <h2 className="text-lg font-semibold mb-2">Total Tests</h2>
                <div className="text-3xl font-bold">{child.total_tests}</div>
              </div>
              {child.latest_test && (
                <div className="border-2 border-border bg-white p-6">
                  <h2 className="text-lg font-semibold mb-2">Latest Test</h2>
                  <div className="text-lg">
                    {child.latest_test.SurahName || child.latest_test.UnitType}
                  </div>
                  <Badge className={getStatusColor(child.latest_test.Status)}>
                    {getStatusLabel(child.latest_test.Status)}
                  </Badge>
                </div>
              )}
            </div>

            {/* Recent Tests */}
            {child.recent_tests && child.recent_tests.length > 0 && (
              <div className="border-2 border-border bg-white p-6">
                <h2 className="text-lg font-semibold mb-4">Riwayat Hafalan</h2>
                <div className="space-y-4">
                  {child.recent_tests.map((test) => (
                    <div key={test.ID} className="border-2 border-border p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-lg">
                            {test.SurahName || test.UnitType}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(test.TestDate).toLocaleDateString('id-ID')}
                          </div>
                          {test.TeacherName && (
                            <div className="text-xs text-gray-500 mt-1">
                              Guru: {test.TeacherName}
                            </div>
                          )}
                        </div>
                        <Badge className={getStatusColor(test.Status)}>
                          {getStatusLabel(test.Status)}
                        </Badge>
                      </div>
                      {test.Notes && (
                        <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 border-2 border-gray-200">
                          <span className="font-medium">Catatan:</span> {test.Notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Summary */}
            {child.recent_tests && child.recent_tests.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border-2 border-border bg-white p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {child.recent_tests.filter(t => t.Status === 'fluent').length}
                  </div>
                  <div className="text-sm text-gray-600">Lancar</div>
                </div>
                <div className="border-2 border-border bg-white p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {child.recent_tests.filter(t => t.Status === 'good').length}
                  </div>
                  <div className="text-sm text-gray-600">Cukup</div>
                </div>
                <div className="border-2 border-border bg-white p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {child.recent_tests.filter(t => t.Status === 'needs_improvement').length}
                  </div>
                  <div className="text-sm text-gray-600">Perlu Perbaikan</div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  )
}
