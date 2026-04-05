import { useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'

export function ChildDetailPage() {
  const { t } = useTranslation()
  const { childId } = useParams<{ childId: string }>()
  const { logout } = useAuthStore()

  // Mock detailed data - will fetch from API
  const child = {
    id: childId || '1',
    name: 'Ahmad Fauzi',
    class_name: 'Kelas 6A',
    overall_progress: {
      percent: 40,
      total_units: 114,
      completed: 45
    },
    memorization_history: [
      {
        date: '2026-04-01',
        unit: 'Juz 30',
        unit_type: 'juz',
        status: 'fluent',
        notes: 'Sangat lancar, makhraj baik'
      },
      {
        date: '2026-03-28',
        unit: 'An-Naba',
        unit_type: 'surah',
        status: 'good',
        notes: 'Cukup lancar, perlu latihan tajwid'
      },
      {
        date: '2026-03-25',
        unit: 'Al-Baqarah 1-10',
        unit_type: 'page',
        status: 'fluent',
        notes: 'Lancar, hafalan kuat'
      },
      {
        date: '2026-03-20',
        unit: 'Yasin',
        unit_type: 'surah',
        status: 'good',
        notes: 'Cukup baik, masih perlu review'
      },
      {
        date: '2026-03-15',
        unit: 'Al-Mulk',
        unit_type: 'surah',
        status: 'needs_improvement',
        notes: 'Perlu banyak latihan lagi'
      },
      {
        date: '2026-03-10',
        unit: 'Juz 29',
        unit_type: 'juz',
        status: 'good',
        notes: 'Progress baik'
      }
    ]
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
    return t(`teacher.status.${status}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b-2 border-border bg-white p-4">
        <div className="container mx-auto">
          <button
            onClick={() => window.location.href = '/parent/dashboard'}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            ← Kembali ke Dashboard
          </button>
          <h1 className="text-2xl font-bold">Detail Progress</h1>
          <p className="text-sm text-gray-600">
            {child.name} - {child.class_name}
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Overall Progress */}
          <div className="border-2 border-border bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">{t('parent.overallProgress')}</h2>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress Total</span>
                <span className="font-semibold text-2xl">{child.overall_progress.percent}%</span>
              </div>
              <div className="w-full bg-gray-200 border-2 border-border">
                <div
                  className="bg-primary border-2 border-primary h-4 transition-all"
                  style={{ width: `${child.overall_progress.percent}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {child.overall_progress.completed} dari {child.overall_progress.total_units} unit selesai
              </p>
            </div>
          </div>

          {/* Memorization History */}
          <div className="border-2 border-border bg-white p-6">
            <h2 className="text-lg font-semibold mb-4">Riwayat Hafalan</h2>
            <div className="space-y-4">
              {child.memorization_history.map((record, index) => (
                <div key={index} className="border-2 border-border p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{record.unit}</div>
                      <div className="text-sm text-gray-600">
                        {record.date} • {record.unit_type === 'surah' ? 'Surah' : record.unit_type === 'juz' ? 'Juz' : 'Halaman'}
                      </div>
                    </div>
                    <Badge className={getStatusColor(record.status)}>
                      {getStatusLabel(record.status)}
                    </Badge>
                  </div>
                  {record.notes && (
                    <div className="mt-2 text-sm text-gray-700">
                      <span className="font-medium">Catatan:</span> {record.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 border-border bg-white p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {child.memorization_history.filter(r => r.status === 'fluent').length}
              </div>
              <div className="text-sm text-gray-600">Lancar</div>
            </div>
            <div className="border-2 border-border bg-white p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {child.memorization_history.filter(r => r.status === 'good').length}
              </div>
              <div className="text-sm text-gray-600">Cukup</div>
            </div>
            <div className="border-2 border-border bg-white p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {child.memorization_history.filter(r => r.status === 'needs_improvement').length}
              </div>
              <div className="text-sm text-gray-600">Perlu Perbaikan</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
