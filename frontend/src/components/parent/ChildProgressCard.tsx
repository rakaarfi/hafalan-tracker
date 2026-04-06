import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'

interface ChildProgressCardProps {
  child: {
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
}

export function ChildProgressCard({ child }: ChildProgressCardProps) {
  const { t } = useTranslation()

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
    <button
      onClick={() => window.location.href = `/parent/children/${child.student.ID}`}
      className="w-full text-left p-6 border-2 border-border bg-white hover:border-primary transition-colors"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center border-2 border-border">
          {/* Photo placeholder */}
          <span className="text-2xl font-semibold text-gray-600">
            {child.student.Name.charAt(0)}
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-lg">{child.student.Name}</h3>
          <p className="text-sm text-gray-600">{child.student.ClassName}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Total Tests:</span>
          <span className="font-semibold">{child.total_tests}</span>
        </div>
        {child.latest_test && (
          <div className="text-xs text-gray-600 mt-1">
            Latest: {child.latest_test.SurahName || child.latest_test.UnitType} - {child.latest_test.Status}
          </div>
        )}
      </div>

      {/* Recent Status - SNAPSHOT VIEW (max 3) */}
      <div className="mb-4">
        <p className="text-sm font-medium mb-2">{t('parent.recentTests')}:</p>
        <div className="space-y-2">
          {child.recent_tests.slice(0, 3).map((test) => (
            <div key={test.ID} className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">{new Date(test.TestDate).toLocaleDateString('id-ID')}:</span>
              <span className="font-medium flex-1">{test.SurahName || test.UnitType}</span>
              <Badge className={getStatusColor(test.Status)}>
                {getStatusLabel(test.Status)}
              </Badge>
            </div>
          ))}
          {child.recent_tests.length === 0 && (
            <div className="text-sm text-gray-500">Belum ada data hafalan</div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500 pt-2 border-t-2 border-border flex items-center justify-end">
        {t('parent.tapForDetail')}
      </div>
    </button>
  )
}
