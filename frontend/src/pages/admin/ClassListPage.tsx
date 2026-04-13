import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, GraduationCap, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/hooks/use-toast'
import { classesApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

interface Class {
  id: string
  name: string
  grade_level: string
  homeroom_teacher_id: string | null
  teacher_name: string | null
  students_count: number
  created_at: string
  updated_at: string
}

export function ClassListPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteClass, setPendingDeleteClass] = useState<Class | null>(null)

  const { toast } = useToast()
  const { isAuthenticated } = useAuthStore()
  const hasFetchedInitially = useRef(false)

  const fetchClasses = async (searchQuery?: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await classesApi.getAll(searchQuery)
      setClasses(data || [])
    } catch (err: any) {
      console.error('Failed to fetch classes:', err)
      setError('Gagal memuat data kelas')
      setClasses([])
    } finally {
      setLoading(false)
    }
  }

  // Single useEffect for both initial fetch and debounced search
  useEffect(() => {
    if (!isAuthenticated) return

    // Initial fetch when auth completes
    if (!hasFetchedInitially.current) {
      fetchClasses()
      hasFetchedInitially.current = true
      return
    }

    // Debounced search for subsequent changes
    const timeoutId = setTimeout(() => {
      if (search.length > 0 || search.length === 0) {
        fetchClasses(search || undefined)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [search, isAuthenticated])

  const filteredClasses = classes

  const handleDelete = (cls: Class) => {
    setPendingDeleteClass(cls)
    setDeleteDialogOpen(true)
  }

  const executeDelete = async () => {
    if (!pendingDeleteClass) return

    try {
      setDeleting(pendingDeleteClass.id)
      await classesApi.delete(pendingDeleteClass.id)
      setClasses(classes.filter(c => c.id !== pendingDeleteClass.id))
      toast({
        title: "Berhasil",
        description: "Kelas berhasil dihapus",
      })
    } catch (error: any) {
      console.error('Delete error:', error)
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.error || error.message || "Gagal menghapus kelas",
      })
    } finally {
      setDeleting(null)
      setDeleteDialogOpen(false)
      setPendingDeleteClass(null)
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
          <h1 className="text-xl md:text-2xl font-bold">Data Kelas</h1>
          <p className="text-gray-600">Kelola kelas dan wali kelas</p>
        </div>
        <Link to="/admin/classes/new">
          <Button
            className="min-h-[44px] min-w-[44px] w-full sm:w-auto"
          >
            <Plus size={20} className="mr-2 inline" />
            Tambah Kelas
          </Button>
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="border-2 border-red-200 bg-red-50 p-4 mb-6">
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={() => fetchClasses()}
            className="mt-2 px-4 py-2 border-2 border-red-300 text-red-700 hover:bg-red-100 min-h-[44px] min-w-[44px]"
          >
            Coba Lagi
          </button>
        </div>
      )}

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredClasses.length === 0 ? (
            <div className="col-span-full text-center py-12 border-2 border-border bg-white">
              <GraduationCap size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">{search ? 'Tidak ada kelas ditemukan' : 'Belum ada data kelas'}</p>
            </div>
          ) : (
            filteredClasses.map((cls) => (
              <div key={cls.id} className="border-2 border-border bg-white p-4 md:p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary text-white flex items-center justify-center flex-shrink-0">
                      <GraduationCap size={20} className="md:size-[24px]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base md:text-lg">{cls.name}</h3>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <Users size={14} className="md:size-[16px] text-gray-600" />
                    <span>{cls.students_count} murid</span>
                  </div>
                  {cls.teacher_name && (
                    <div className="text-xs md:text-sm">
                      <span className="text-gray-600">Wali Kelas:</span>
                      <span className="font-medium ml-2">{cls.teacher_name}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to={`/admin/classes/${cls.id}/edit`}
                    className="flex-1 p-2 border-2 border-yellow-200 hover:bg-yellow-50 min-h-[36px] flex items-center justify-center gap-1 text-xs md:text-sm"
                  >
                    <Edit size={14} className="md:size-[16px]" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(cls)}
                    disabled={deleting === cls.id}
                    className="flex-1 p-2 border-2 border-red-200 hover:bg-red-50 min-h-[36px] flex items-center justify-center gap-1 disabled:opacity-50 text-xs md:text-sm"
                  >
                    <Trash2 size={14} className="md:size-[16px]" />
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Kelas?"
        description={
          pendingDeleteClass
            ? `Apakah Anda yakin ingin menghapus kelas ${pendingDeleteClass.name}?`
            : 'Hapus kelas?'
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
