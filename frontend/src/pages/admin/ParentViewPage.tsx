import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Mail, Phone, Users, Calendar, BookOpen, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/hooks/use-toast'
import { parentsApi, studentsApi, memorizationsApi, Student, Memorization } from '@/lib/api'

export function ParentViewPage() {
  const { parentId } = useParams<{ parentId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [parent, setParent] = useState<any>(null)
  const [children, setChildren] = useState<Student[]>([])
  const [childrenWithProgress, setChildrenWithProgress] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (parentId) {
      fetchData()
    }
  }, [parentId])

  const fetchData = async () => {
    if (!parentId) return

    try {
      setLoading(true)
      setError(null)

      // Fetch parent details
      const parentData = await parentsApi.getById(parentId)
      setParent(parentData)

      // Fetch children
      const childrenData = await parentsApi.getChildren(parentId)
      setChildren(childrenData)

      // Fetch progress for each child
      const childrenWithProgressData = await Promise.all(
        childrenData.map(async (child) => {
          try {
            const mems = await memorizationsApi.getByStudent(child.id)
            return {
              ...child,
              memorizations: mems || [],
              totalTests: (mems || []).length,
              averageScore: calculateAverageScore(mems || [])
            }
          } catch (err) {
            console.error(`Failed to fetch progress for ${child.id}:`, err)
            return {
              ...child,
              memorizations: [],
              totalTests: 0,
              averageScore: 0
            }
          }
        })
      )
      setChildrenWithProgress(childrenWithProgressData)
    } catch (err: any) {
      console.error('Failed to fetch data:', err)
      setError('Gagal memuat data orang tua')
    } finally {
      setLoading(false)
    }
  }

  const calculateAverageScore = (mems: Memorization[]) => {
    if (mems.length === 0) return 0

    const scoreMap: Record<string, number> = {
      'fluent': 100,
      'good': 75,
      'needs_improvement': 50,
      'in_progress': 25,
    }

    const total = mems.reduce((sum, mem) => {
      const score = scoreMap[mem.status] || 0
      return sum + score
    }, 0)

    return total / mems.length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fluent': return 'text-green-700'
      case 'good': return 'text-yellow-700'
      case 'needs_improvement': return 'text-red-700'
      default: return 'text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'fluent': return 'Lancar'
      case 'good': return 'Cukup'
      case 'needs_improvement': return 'Perlu Perbaikan'
      default: return status
    }
  }

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'fluent': return 'bg-green-100 text-green-800 border-2 border-green-300'
      case 'good': return 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
      case 'needs_improvement': return 'bg-red-100 text-red-800 border-2 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-2 border-gray-300'
    }
  }

  const getUnitDisplay = (mem: Memorization) => {
    if (mem.unit_type === 'surah' && mem.surah_name) {
      return mem.surah_name
    }
    if (mem.unit_type === 'juz' && mem.juz_number) {
      return `Juz ${mem.juz_number}`
    }
    if (mem.unit_type === 'page' && mem.page_start && mem.page_end) {
      return `Halaman ${mem.page_start} - ${mem.page_end}`
    }
    return mem.unit_type
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const executeDelete = async () => {
    if (!parent) return

    try {
      await parentsApi.delete(parent.UserID)
      toast({
        title: "Berhasil",
        description: "Orang tua berhasil dihapus",
      })
      navigate('/admin/parents')
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.error || error.message || "Gagal menghapus orang tua",
      })
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary"></div>
        <p className="mt-4 text-gray-600">Memuat data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border-2 border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-800 font-medium">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 border-2 border-red-300 text-red-700 hover:bg-red-100 min-h-[44px] min-w-[44px]"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  if (!parent) {
    return (
      <div className="border-2 border-yellow-200 bg-yellow-50 p-6 text-center">
        <p className="text-yellow-800 font-medium">Data orang tua tidak ditemukan</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/admin/parents"
          className="text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-2 inline-block"
        >
          <ArrowLeft size={16} />
          Kembali
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{parent.FullName}</h1>
            <p className="text-sm text-gray-600">
              {parent.Gender === 'male' ? 'Ayah' : 'Ibu'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to={`/admin/parents/${parent.UserID}/edit`}>
              <Button variant="outline" className="min-h-[44px] min-w-[44px]">
                <Edit size={16} className="mr-2 inline" />
                Edit
              </Button>
            </Link>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="min-h-[44px] min-w-[44px]"
            >
              <Trash2 size={16} className="mr-2 inline" />
              Hapus
            </Button>
          </div>
        </div>
      </div>

      {/* Parent Info & Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Parent Information */}
        <div className="border-2 border-border bg-white p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold">Informasi Orang Tua</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Nama Lengkap</p>
              <p className="font-semibold text-base">{parent.FullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-base flex items-center gap-2">
                <Mail size={14} />
                {parent.Email}
              </p>
            </div>
            {parent.Phone && (
              <div>
                <p className="text-sm text-gray-600">No HP</p>
                <p className="font-semibold text-base flex items-center gap-2">
                  <Phone size={14} />
                  {parent.Phone}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="border-2 border-border bg-white p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold">Statistik</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Total Anak</p>
              <p className="font-semibold text-base">{children.length} anak</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Hafalan</p>
              <p className="font-semibold text-base">
                {childrenWithProgress.reduce((sum, child) => sum + child.totalTests, 0)} tes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Children List */}
      {children.length > 0 && (
        <div className="border-2 border-border bg-white p-4 md:p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Anak-Anak</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b-2 border-border">
                <tr>
                  <th className="text-left p-3 border-r-2 border-border">Nama</th>
                  <th className="text-left p-3 border-r-2 border-border">Kelas</th>
                  <th className="text-center p-3 border-r-2 border-border">Total Tes</th>
                  <th className="text-center p-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-border">
                {childrenWithProgress.map((child) => (
                  <tr key={child.id} className="hover:bg-gray-50">
                    <td className="p-3 border-r-2 border-border text-sm">
                      {child.name}
                    </td>
                    <td className="p-3 border-r-2 border-border text-sm">
                      <Badge className="text-xs md:text-sm">{child.class_name || '-'}</Badge>
                    </td>
                    <td className="p-3 border-r-2 border-border text-sm text-center">
                      {child.totalTests}
                    </td>
                    <td className="p-3 text-center">
                      <Link to={`/admin/students/${child.id}`} className="inline-block">
                        <Button
                          variant="outline"
                          size="sm"
                          className="min-h-[36px] min-w-[36px]"
                        >
                          <Eye size={14} className="mr-1 inline" />
                          Detail
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Children */}
      {children.length === 0 && (
        <div className="border-2 border-gray-200 bg-gray-50 p-8 text-center">
          <Users size={48} className="mx-auto text-gray-400 mb-4 inline-block" />
          <p className="text-gray-600">Belum ada anak yang terhubung</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Orang Tua?"
        description={`Apakah Anda yakin ingin menghapus orang tua ${parent.FullName}?`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={executeDelete}
      />
    </div>
  )
}
