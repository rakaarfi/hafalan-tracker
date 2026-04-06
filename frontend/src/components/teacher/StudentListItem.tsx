import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'

interface StudentListItemProps {
  student: {
    ID: string
    Name: string
    ClassID: string
    ClassName: string
    IsActive: boolean
    CreatedAt: string
  }
}

export function StudentListItem({ student }: StudentListItemProps) {
  const { t } = useTranslation()

  return (
    <button
      onClick={() => window.location.href = `/teacher/students/${student.ID}`}
      className="w-full text-left p-4 border-2 border-border hover:border-primary transition-colors min-h-[80px] flex items-center"
    >
      <div className="flex justify-between items-start w-full">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{student.Name}</h3>
          <p className="text-sm text-gray-600">{student.ClassName}</p>
        </div>
      </div>
    </button>
  )
}
