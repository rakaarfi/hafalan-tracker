import { useParams } from 'react-router-dom'
import { HafalanInputForm } from '@/components/teacher/HafalanInputForm'
import { useTranslation } from 'react-i18next'

export function StudentDetailPage() {
  const { t } = useTranslation()
  const { studentId } = useParams<{ studentId: string }>()

  // Mock student data - will fetch from API
  const student = {
    id: studentId || '1',
    name: 'Ahmad Fauzi',
    class_name: 'Kelas 6A'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b-2 border-border bg-white p-4">
        <div className="container mx-auto">
          <button
            onClick={() => window.location.href = '/teacher/dashboard'}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            ← Kembali ke Dashboard
          </button>
          <h1 className="text-2xl font-bold">{t('teacher.inputHafalan')}</h1>
          <p className="text-sm text-gray-600">
            {student.name} - {student.class_name}
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-6 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Form container - SOLID BORDER, NO SHADOW */}
          <div className="border-2 border-border bg-white p-6">
            <HafalanInputForm studentId={student.id} />
          </div>
        </div>
      </main>
    </div>
  )
}
