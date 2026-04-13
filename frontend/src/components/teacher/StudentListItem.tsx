import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import { TeacherStudent } from '@/lib/api'

interface StudentListItemProps {
  student: TeacherStudent
}

export function StudentListItem({ student }: StudentListItemProps) {
  const { t } = useTranslation()

  const getRoleBadges = () => {
    const badges = []
    const isHomeroom = student.is_homeroom_teacher
    const isQuran = student.is_quran_teacher

    if (isHomeroom && isQuran) {
      badges.push(
        <Badge key="both" variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
          Wali & Quran
        </Badge>
      )
    } else if (isHomeroom) {
      badges.push(
        <Badge key="homeroom" variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
          Wali Kelas
        </Badge>
      )
    } else if (isQuran) {
      badges.push(
        <Badge key="quran" variant="secondary" className="bg-green-100 text-green-800 text-xs">
          Guru Quran
        </Badge>
      )
    }

    return badges
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'fluent': return 'bg-green-100 text-green-800 border-2 border-green-200'
      case 'good': return 'bg-yellow-100 text-yellow-800 border-2 border-yellow-200'
      case 'needs_improvement': return 'bg-red-100 text-red-800 border-2 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-2 border-gray-200'
    }
  }

  const getStatusLabel = (status?: string) => {
    return status ? t(`teacher.status.${status}`) : '-'
  }

  return (
    <button
      onClick={() => window.location.href = `/teacher/students/${student.id}`}
      className="w-full text-left p-4 border-2 border-border hover:border-primary transition-colors min-h-[80px] flex items-center"
    >
      <div className="flex justify-between items-start w-full gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-lg">{student.name}</h3>
            {getRoleBadges().length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {getRoleBadges()}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600">{student.class_name || '-'}</p>
        </div>
        {student.last_status && (
          <Badge className={getStatusColor(student.last_status)}>
            {getStatusLabel(student.last_status)}
          </Badge>
        )}
      </div>
    </button>
  )
}
