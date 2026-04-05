import { useState } from 'react'
import { StudentListItem } from './StudentListItem'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Student {
  id: string
  name: string
  class_name: string
  last_test_date: string
  last_status: string
}

export function StudentList({ students }: { students: Student[] }) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="border-2 border-border bg-white">
      {/* Search bar */}
      <div className="p-4 border-b-2 border-border">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('teacher.searchStudent')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-2 min-h-[44px]"
          />
        </div>
      </div>

      {/* Student list - LIST VIEW for hybrid approach */}
      <div className="divide-y-2 divide-border">
        {filteredStudents.map((student) => (
          <StudentListItem key={student.id} student={student} />
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          {t('teacher.noStudents')}
        </div>
      )}
    </div>
  )
}
