import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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

  useEffect(() => {
    fetchParents()
  }, [])

  const fetchParents = async (searchQuery?: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await parentsApi.getAll(searchQuery)
      setParents(data)
    } catch (err: any) {
      console.error('Failed to fetch parents:', err)
      setError('Gagal memuat data orang tua')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search.length > 0 || search.length === 0) {
        fetchParents(search || undefined)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [search])

  const filteredParents = parents

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus orang tua ini?')) {
      return
    }

    try {
      setDeleting(id)
      await parentsApi.delete(id)
      setParents(parents.filter(p => p.UserID !== id))
      alert('Orang tua berhasil dihapus')
    } catch (error: any) {
      alert('Gagal menghapus orang tua: ' + (error.response?.data?.error || 'Unknown error'))
    } finally {
      setDeleting(null)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
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
        <Button
          onClick={() => window.location.href = '/admin/parents/new'}
          className="min-h-[44px] min-w-[44px] w-full sm:w-auto"
        >
          <Plus size={20} className="mr-2 inline" />
          Tambah Orang Tua
        </Button>
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

      {/* Search */}
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

      {/* Parents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredParents.length === 0 ? (
          <div className="col-span-full text-center py-12 border-2 border-border bg-white">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">{search ? 'Tidak ada orang tua ditemukan' : 'Belum ada data orang tua'}</p>
          </div>
        ) : (
          filteredParents.map((parent) => (
            <div key={parent.UserID} className="border-2 border-border bg-white p-4 md:p-6">
              {/* Header */}
              <div className="flex items-start gap-3 md:gap-4 mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary text-white flex items-center justify-center text-base md:text-lg font-bold flex-shrink-0">
                  {getInitials(parent.FullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base md:text-lg truncate">{parent.FullName}</h3>
                  <p className="text-xs md:text-sm text-gray-600 truncate">{parent.Email}</p>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="text-xs md:text-sm">
                  <span className="text-gray-600">No HP:</span>
                  <span className="font-medium ml-2">{parent.Phone || '-'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.href = `/admin/parents/${parent.UserID}/edit`}
                  disabled={deleting === parent.UserID}
                  className="flex-1 p-2 border-2 border-yellow-200 hover:bg-yellow-50 min-h-[36px] flex items-center justify-center gap-1 text-xs md:text-sm"
                >
                  <Edit size={14} md:size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(parent.UserID)}
                  disabled={deleting === parent.UserID}
                  className="flex-1 p-2 border-2 border-red-200 hover:bg-red-50 min-h-[36px] flex items-center justify-center gap-1 disabled:opacity-50 text-xs md:text-sm"
                >
                  <Trash2 size={14} md:size={16} />
                  Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4">
        <div className="border-2 border-border bg-white p-4 text-center">
          <div className="text-2xl font-bold">{parents.length}</div>
          <div className="text-sm text-gray-600">Total Orang Tua</div>
        </div>
      </div>
    </div>
  )
}
