import { useState } from 'react'
import { Plus, Search, Edit, Trash2, GraduationCap, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Class {
  id: string
  name: string
  teacher_name: string | null
  students_count: number
}

export function ClassListPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const mockClasses: Class[] = [
    {
      id: '1',
      name: 'Kelas 1A',
      teacher_name: 'Siti Rahayu',
      students_count: 25
    },
    {
      id: '2',
      name: 'Kelas 1B',
      teacher_name: 'Siti Rahayu',
      students_count: 28
    },
    {
      id: '3',
      name: 'Kelas 6A',
      teacher_name: 'Budi Santoso',
      students_count: 30
    },
    {
      id: '4',
      name: 'Kelas 6B',
      teacher_name: 'Budi Santoso',
      students_count: 27
    },
  ]

  useState(() => {
    setTimeout(() => {
      setClasses(mockClasses)
      setLoading(false)
    }, 500)
  })

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus kelas ini?')) {
      setClasses(classes.filter(c => c.id !== id))
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Data Kelas</h1>
          <p className="text-gray-600">Kelola kelas dan wali kelas</p>
        </div>
        <Button
          onClick={() => window.location.href = '/admin/classes/new'}
          className="min-h-[44px] min-w-[44px]"
        >
          <Plus size={20} className="mr-2 inline" />
          Tambah Kelas
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Cari nama kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-2 min-h-[44px]"
          />
        </div>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <div key={cls.id} className="border-2 border-border bg-white p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary text-white flex items-center justify-center">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{cls.name}</h3>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users size={16} className="text-gray-600" />
                  <span>{cls.students_count} murid</span>
                </div>
                {cls.teacher_name && (
                  <div className="text-sm">
                    <span className="text-gray-600">Wali Kelas:</span>
                    <span className="font-medium ml-2">{cls.teacher_name}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = `/admin/classes/${cls.id}/edit`}
                  className="flex-1 min-h-[36px]"
                >
                  <Edit size={16} className="mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(cls.id)}
                  className="flex-1 min-h-[36px] border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} className="mr-1" />
                  Hapus
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredClasses.length === 0 && (
        <div className="text-center py-12 border-2 border-border bg-white">
          <GraduationCap size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Tidak ada kelas ditemukan</p>
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="border-2 border-border bg-white p-4 text-center">
          <div className="text-2xl font-bold">{classes.length}</div>
          <div className="text-sm text-gray-600">Total Kelas</div>
        </div>
        <div className="border-2 border-border bg-white p-4 text-center">
          <div className="text-2xl font-bold">
            {classes.reduce((sum, cls) => sum + cls.students_count, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Murid</div>
        </div>
      </div>
    </div>
  )
}
