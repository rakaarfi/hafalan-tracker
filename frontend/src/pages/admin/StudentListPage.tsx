import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/hooks/use-toast'
import { studentsApi, Student } from '@/lib/api'

export function StudentListPage() {
  const { t } = useTranslation()
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteStudent, setPendingDeleteStudent] = useState<Student | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async (searchQuery?: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await studentsApi.getAll(searchQuery)
      setStudents(data)
    } catch (err: any) {
      console.error('Failed to fetch students:', err)
      setError('Gagal memuat data murid')
    } finally {
      setLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search.length > 0 || search.length === 0) {
        fetchStudents(search || undefined)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [search])

  const filteredStudents = students

  const handleDelete = (student: Student) => {
    setPendingDeleteStudent(student)
    setDeleteDialogOpen(true)
  }

  const executeDelete = async () => {
    if (!pendingDeleteStudent) return

    try {
      setDeleting(pendingDeleteStudent.id)
      await studentsApi.delete(pendingDeleteStudent.id)
      setStudents(students.filter(s => s.id !== pendingDeleteStudent.id))
      toast({
        title: "Berhasil",
        description: "Murid berhasil dihapus",
      })
    } catch (error: any) {
      console.error('Delete error:', error)
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.error || error.message || "Gagal menghapus murid",
      })
    } finally {
      setDeleting(null)
      setDeleteDialogOpen(false)
      setPendingDeleteStudent(null)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary"></div>
        <p className="mt-4 text-gray-600">Memuat data...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Data Murid</h1>
          <p className="text-gray-600">Kelola data murid sekolah</p>
        </div>
        <Link to="/admin/students/new">
          <Button
            className="min-h-[44px] min-w-[44px] w-full sm:w-auto"
          >
            <Plus size={20} className="mr-2 inline" />
            Tambah Murid
          </Button>
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="border-2 border-red-200 bg-red-50 p-4 mb-6">
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={() => fetchStudents()}
            className="mt-2 px-4 py-2 border-2 border-red-300 text-red-700 hover:bg-red-100 min-h-[44px] min-w-[44px]"
          >
            Coba Lagi
          </button>
        </div>
      )}

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
      <div className="border-2 border-border bg-white overflow-x-auto rounded-lg">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50 border-b-2 border-border">
            <tr>
              <th className="text-left p-2 md:p-4 border-r-2 border-border text-sm md:text-base">Nama</th>
              <th className="text-left p-2 md:p-4 border-r-2 border-border text-sm md:text-base">Kelas</th>
              <th className="text-left p-2 md:p-4 border-r-2 border-border text-sm md:text-base">Orang Tua</th>
              <th className="text-left p-2 md:p-4 border-r-2 border-border text-sm md:text-base">No HP</th>
              <th className="text-center p-2 md:p-4 text-sm md:text-base">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-border">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  {search ? 'Tidak ada murid ditemukan' : 'Belum ada data murid'}
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="p-2 md:p-4 border-r-2 border-border">
                    <div className="font-medium text-sm md:text-base">{student.name}</div>
                  </td>
                  <td className="p-2 md:p-4 border-r-2 border-border">
                    <Badge className="text-xs md:text-sm">{student.class_name || '-'}</Badge>
                  </td>
                  <td className="p-2 md:p-4 border-r-2 border-border">
                    <div className="text-sm text-gray-500 text-xs md:text-sm">
                      {student.parent_1_name || '-'}
                    </div>
                  </td>
                  <td className="p-2 md:p-4 border-r-2 border-border text-xs md:text-sm">
                    {student.phone || '-'}
                  </td>
                  <td className="p-2 md:p-4">
                    <div className="flex justify-center gap-1 md:gap-2">
                      <Link to={`/admin/students/${student.id}`} className="inline-block">
                        <button
                          className="p-1.5 md:p-2 border-2 border-blue-200 hover:bg-blue-50 min-h-[36px] min-w-[36px]"
                          title="Lihat"
                        >
                          <Eye size={14} className="md:size-[16px]" />
                        </button>
                      </Link>
                      <Link to={`/admin/students/${student.id}/edit`} className="inline-block">
                        <button
                          className="p-1.5 md:p-2 border-2 border-yellow-200 hover:bg-yellow-50 min-h-[36px] min-w-[36px]"
                          title="Edit"
                        >
                          <Edit size={14} className="md:size-[16px]" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(student)}
                        disabled={deleting === student.id}
                        className="p-1.5 md:p-2 border-2 border-red-200 hover:bg-red-50 min-h-[36px] min-w-[36px] disabled:opacity-50"
                        title="Hapus"
                      >
                        <Trash2 size={14} className="md:size-[16px]" />
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
      <div className="mt-6 grid grid-cols-1 gap-4">
        <div className="border-2 border-border bg-white p-4 text-center">
          <div className="text-2xl font-bold">{students.length}</div>
          <div className="text-sm text-gray-600">Total Murid</div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Murid?"
        description={
          pendingDeleteStudent
            ? `Apakah Anda yakin ingin menghapus murid ${pendingDeleteStudent.name}?\n\nSemua data hafalan juga akan dihapus.`
            : 'Hapus murid?'
        }
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={executeDelete}
        isLoading={deleting !== null}
      />
    </div>
  )
}
