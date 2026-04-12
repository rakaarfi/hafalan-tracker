import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/hooks/use-toast'
import { parentsApi } from '@/lib/api'

interface Parent {
  UserID: string
  FullName: string
  Phone: string
  Email: string
  CreatedAt: string
}

export function ParentListPage() {
  const [parents, setParents] = useState<Parent[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteParent, setPendingDeleteParent] = useState<Parent | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const { toast } = useToast()

  useEffect(() => {
    fetchParents()
  }, [])

  const fetchParents = async (searchQuery?: string, pageNumber = 1) => {
    try {
      setLoading(true)
      setError(null)
      const response = await parentsApi.getAll(searchQuery, pageNumber, 10)
      setParents(response.data || [])
      setTotalPages(response.total_pages || 1)
      setTotal(response.total || 0)
      setPage(response.page || 1)
    } catch (err: any) {
      console.error('Failed to fetch parents:', err)
      setError('Gagal memuat data orang tua')
      setParents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search.length >= 0) {
        fetchParents(search || undefined, 1)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [search])

  const handleDelete = (parent: Parent) => {
    setPendingDeleteParent(parent)
    setDeleteDialogOpen(true)
  }

  const executeDelete = async () => {
    if (!pendingDeleteParent) return

    try {
      setDeleting(pendingDeleteParent.UserID)
      await parentsApi.delete(pendingDeleteParent.UserID)
      setParents(parents.filter(p => p.UserID !== pendingDeleteParent.UserID))
      toast({
        title: "Berhasil",
        description: "Orang tua berhasil dihapus",
      })
    } catch (error: any) {
      console.error('Delete error:', error)
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.error || error.message || "Gagal menghapus orang tua",
      })
    } finally {
      setDeleting(null)
      setDeleteDialogOpen(false)
      setPendingDeleteParent(null)
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
          <h1 className="text-xl md:text-2xl font-bold">Data Orang Tua</h1>
          <p className="text-gray-600">Kelola data orang tua murid</p>
        </div>
        <Link to="/admin/parents/new">
          <Button
            className="min-h-[44px] min-w-[44px] w-full sm:w-auto"
          >
            <Plus size={20} className="mr-2 inline" />
            Tambah Orang Tua
          </Button>
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="border-2 border-red-200 bg-red-50 p-4 mb-6">
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={() => fetchParents()}
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
            placeholder="Cari nama atau email orang tua..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-2 min-h-[44px]"
          />
        </div>
      </div>

      {/* Parents Table */}
      <div className="border-2 border-border bg-white overflow-x-auto rounded-lg">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50 border-b-2 border-border">
            <tr>
              <th className="text-left p-2 md:p-4 border-r-2 border-border text-sm md:text-base">Nama</th>
              <th className="text-left p-2 md:p-4 border-r-2 border-border text-sm md:text-base">Email</th>
              <th className="text-left p-2 md:p-4 border-r-2 border-border text-sm md:text-base">No HP</th>
              <th className="text-center p-2 md:p-4 text-sm md:text-base">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-border">
            {!parents || parents.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  {search ? 'Tidak ada orang tua ditemukan' : 'Belum ada data orang tua'}
                </td>
              </tr>
            ) : (
              parents.map((parent) => (
                <tr key={parent.UserID} className="hover:bg-gray-50">
                  <td className="p-2 md:p-4 border-r-2 border-border">
                    <div className="font-medium text-sm md:text-base">{parent.FullName}</div>
                  </td>
                  <td className="p-2 md:p-4 border-r-2 border-border">
                    <div className="text-sm text-gray-500 text-xs md:text-sm">
                      {parent.Email}
                    </div>
                  </td>
                  <td className="p-2 md:p-4 border-r-2 border-border">
                    <div className="text-sm text-gray-500 text-xs md:text-sm">
                      {parent.Phone || '-'}
                    </div>
                  </td>
                  <td className="p-2 md:p-4">
                    <div className="flex justify-center gap-1 md:gap-2">
                      <Link to={`/admin/parents/${parent.UserID}`} className="inline-block">
                        <button
                          className="p-1.5 md:p-2 border-2 border-blue-200 hover:bg-blue-50 min-h-[36px] min-w-[36px]"
                          title="Lihat Detail"
                        >
                          <Eye size={14} className="md:size-[16px]" />
                        </button>
                      </Link>
                      <Link to={`/admin/parents/${parent.UserID}/edit`} className="inline-block">
                        <button
                          className="p-1.5 md:p-2 border-2 border-yellow-200 hover:bg-yellow-50 min-h-[36px] min-w-[36px]"
                          title="Edit"
                        >
                          <Edit size={14} className="md:size-[16px]" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(parent)}
                        disabled={deleting === parent.UserID}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            Menampilkan {(page - 1) * 10 + 1} - {Math.min(page * 10, total)} dari {total} orang tua
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => fetchParents(search || undefined, page - 1)}
              disabled={page <= 1 || loading}
              className="min-h-[36px] min-w-[36px]"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "outline"}
                    onClick={() => fetchParents(search || undefined, pageNum)}
                    disabled={loading}
                    className="min-h-[36px] min-w-[36px]"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              onClick={() => fetchParents(search || undefined, page + 1)}
              disabled={page >= totalPages || loading}
              className="min-h-[36px] min-w-[36px]"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4">
        <div className="border-2 border-border bg-white p-4 text-center">
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-sm text-gray-600">Total Orang Tua</div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Orang Tua?"
        description={
          pendingDeleteParent
            ? `Apakah Anda yakin ingin menghapus orang tua ${pendingDeleteParent.FullName}?`
            : 'Hapus orang tua?'
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
