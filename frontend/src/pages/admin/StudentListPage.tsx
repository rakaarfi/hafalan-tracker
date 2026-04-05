import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

interface Student {
  id: string
  name: string
  class_name: string | null
  parent_1_name: string | null
  parent_2_name: string | null
  phone: string | null
  birth_date: string | null
}

export function StudentListPage() {
  const { t } = useTranslation()
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Mock data - replace with API call
  const mockStudents: Student[] = [
    {
      id: '1',
      name: 'Ahmad Fauzi',
      class_name: 'Kelas 6A',
      parent_1_name: 'Bapak Ahmad',
      parent_2_name: 'Ibu Siti',
      phone: '08123456789',
      birth_date: '2012-05-15'
    },
    {
      id: '2',
      name: 'Siti Aminah',
      class_name: 'Kelas 6A',
      parent_1_name: 'Bapak Hasan',
      parent_2_name: 'Ibu Fatimah',
      phone: '08129876543',
      birth_date: '2012-08-20'
    },
    {
      id: '3',
      name: 'Muhammad Rizki',
      class_name: 'Kelas 6B',
      parent_1_name: 'Bapak Muhammad',
      parent_2_name: 'Ibu Aisyah',
      phone: '08123456789',
      birth_date: '2013-01-10'
    }
  ]

  // Load students on mount
  useState(() => {
    setTimeout(() => {
      setStudents(mockStudents)
      setLoading(false)
    }, 500)
  })

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus murid ini? Semua data hafalan juga akan dihapus.')) {
      return
    }

    try {
      await api.delete(`/admin/students/${id}`)
      setStudents(students.filter(s => s.id !== id))
      alert('Murid berhasil dihapus')
    } catch (error: any) {
      alert('Gagal menghapus murid: ' + (error.response?.data?.error || 'Unknown error'))
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Data Murid</h1>
          <p className="text-gray-600">Kelola data murid sekolah</p>
        </div>
        <Button
          onClick={() => window.location.href = '/admin/students/new'}
          className="min-h-[44px] min-w-[44px]"
        >
          <Plus size={20} className="mr-2 inline" />
          Tambah Murid
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Cari nama murid..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-2 min-h-[44px]"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="border-2 border-border bg-white overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-border">
            <tr>
              <th className="text-left p-4 border-r-2 border-border">Nama</th>
              <th className="text-left p-4 border-r-2 border-border">Kelas</th>
              <th className="text-left p-4 border-r-2 border-border">Orang Tua</th>
              <th className="text-left p-4 border-r-2 border-border">No HP</th>
              <th className="text-center p-4">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-border">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Tidak ada murid ditemukan
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="p-4 border-r-2 border-border">
                    <div className="font-medium">{student.name}</div>
                  </td>
                  <td className="p-4 border-r-2 border-border">
                    <Badge>{student.class_name || '-'}</Badge>
                  </td>
                  <td className="p-4 border-r-2 border-border">
                    <div className="text-sm">
                      {student.parent_1_name && <div>Ayah: {student.parent_1_name}</div>}
                      {student.parent_2_name && <div>Ibu: {student.parent_2_name}</div>}
                      {!student.parent_1_name && !student.parent_2_name && '-'}
                    </div>
                  </td>
                  <td className="p-4 border-r-2 border-border">
                    {student.phone || '-'}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => window.location.href = `/admin/students/${student.id}`}
                        className="p-2 border-2 border-blue-200 hover:bg-blue-50 min-h-[36px] min-w-[36px]"
                        title="Lihat"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => window.location.href = `/admin/students/${student.id}/edit`}
                        className="p-2 border-2 border-yellow-200 hover:bg-yellow-50 min-h-[36px] min-w-[36px]"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="p-2 border-2 border-red-200 hover:bg-red-50 min-h-[36px] min-w-[36px]"
                        title="Hapus"
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
          <div className="text-2xl font-bold">{students.length}</div>
          <div className="text-sm text-gray-600">Total Murid</div>
        </div>
      </div>
    </div>
  )
}
