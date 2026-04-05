import { useState } from 'react'
import { Plus, Search, Edit, Trash2, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Teacher {
  id: string
  name: string
  email: string
  phone: string | null
  classes: string[]
}

export function TeacherListPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const mockTeachers: Teacher[] = [
    {
      id: '1',
      name: 'Budi Santoso',
      email: 'budi.santoso@sekolah.sch.id',
      phone: '08123456789',
      classes: ['Kelas 6A', 'Kelas 6B']
    },
    {
      id: '2',
      name: 'Siti Rahayu',
      email: 'siti.rahayu@sekolah.sch.id',
      phone: '08129876543',
      classes: ['Kelas 1A', 'Kelas 1B']
    },
  ]

  useState(() => {
    setTimeout(() => {
      setTeachers(mockTeachers)
      setLoading(false)
    }, 500)
  })

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(search.toLowerCase()) ||
    teacher.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus guru ini?')) {
      setTeachers(teachers.filter(t => t.id !== id))
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Data Guru</h1>
          <p className="text-gray-600">Kelola data guru dan wali kelas</p>
        </div>
        <Button
          onClick={() => window.location.href = '/admin/teachers/new'}
          className="min-h-[44px] min-w-[44px]"
        >
          <Plus size={20} className="mr-2 inline" />
          Tambah Guru
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-2 min-h-[44px]"
          />
        </div>
      </div>

      {/* Teachers Table */}
      <div className="border-2 border-border bg-white overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-border">
            <tr>
              <th className="text-left p-4 border-r-2 border-border">Nama</th>
              <th className="text-left p-4 border-r-2 border-border">Email</th>
              <th className="text-left p-4 border-r-2 border-border">No HP</th>
              <th className="text-left p-4 border-r-2 border-border">Kelas</th>
              <th className="text-center p-4">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Tidak ada guru ditemukan
                </td>
              </tr>
            ) : (
              filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="p-4 border-r-2 border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary text-white flex items-center justify-center">
                        <GraduationCap size={20} />
                      </div>
                      <div className="font-medium">{teacher.name}</div>
                    </div>
                  </td>
                  <td className="p-4 border-r-2 border-border">
                    {teacher.email}
                  </td>
                  <td className="p-4 border-r-2 border-border">
                    {teacher.phone || '-'}
                  </td>
                  <td className="p-4 border-r-2 border-border">
                    <div className="flex flex-wrap gap-2">
                      {teacher.classes.map((cls, idx) => (
                        <Badge key={idx} variant="outline">{cls}</Badge>
                      ))}
                      {teacher.classes.length === 0 && '-'}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => window.location.href = `/admin/teachers/${teacher.id}/edit`}
                        className="p-2 border-2 border-yellow-200 hover:bg-yellow-50 min-h-[36px] min-w-[36px]"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.id)}
                        className="p-2 border-2 border-red-200 hover:bg-red-50 min-h-[36px] min-w-[36px]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="border-2 border-border bg-white p-4 text-center">
          <div className="text-2xl font-bold">{teachers.length}</div>
          <div className="text-sm text-gray-600">Total Guru</div>
        </div>
      </div>
    </div>
  )
}
