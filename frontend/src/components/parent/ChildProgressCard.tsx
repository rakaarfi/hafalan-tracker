import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'

interface ChildProgressCardProps {
  child: {
    id: string
    name: string
    photo?: string
    class_name: string
    overall_progress: {
      percent: number
      total_units: number
      completed: number
    }
    recent_status: {
      date: string
      unit: string
      status: string
    }[]
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
      onClick={() => window.location.href = `/parent/children/${child.id}`}
      className="w-full text-left p-6 border-2 border-border bg-white hover:border-primary transition-colors"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center border-2 border-border">
          {/* Photo placeholder */}
          <span className="text-2xl font-semibold text-gray-600">
            {child.name.charAt(0)}
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-lg">{child.name}</h3>
          <p className="text-sm text-gray-600">{child.class_name}</p>
        </div>
      </div>

      {/* Progress Bar - SIMPLE SNAPSHOT */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">{t('parent.overallProgress')}</span>
          <span className="font-semibold">{child.overall_progress.percent}%</span>
        </div>
        <div className="w-full bg-gray-200 border-2 border-border">
          <div
            className="bg-primary border-2 border-primary h-3 transition-all"
            style={{ width: `${child.overall_progress.percent}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {child.overall_progress.completed} dari {child.overall_progress.total_units} unit selesai
        </p>
      </div>

      {/* Recent Status - SNAPSHOT VIEW (max 3) */}
      <div className="mb-4">
        <p className="text-sm font-medium mb-2">{t('parent.recentTests')}:</p>
        <div className="space-y-2">
          {child.recent_status.slice(0, 3).map((status, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">{status.date}:</span>
              <span className="font-medium flex-1">{status.unit}</span>
              <Badge className={getStatusColor(status.status)}>
                {getStatusLabel(status.status)}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500 pt-2 border-t-2 border-border flex items-center justify-end">
        {t('parent.tapForDetail')}
      </div>
    </button>
  )
}
