import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Phone, Mail, Calendar, User, Users, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/hooks/use-toast'
import { studentsApi, memorizationsApi, parentsApi, Student, Memorization, Parent } from '@/lib/api'

export function StudentViewPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [student, setStudent] = useState<Student | null>(null)
  const [parents, setParents] = useState<{father?: Parent, mother?: Parent}>({})
  const [memorizations, setMemorizations] = useState<Memorization[]>([])
  const [teachers, setTeachers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (studentId) {
      fetchData()
    }
  }, [studentId])

  const fetchData = async () => {
    if (!studentId) return

    try {
      setLoading(true)
      setError(null)

      // Fetch student details
      const studentData = await studentsApi.getById(studentId)
      setStudent(studentData)

      // Fetch parents data
      const parentPromises = []
      if (studentData.parent_1_id) {
        parentPromises.push(parentsApi.getById(studentData.parent_1_id))
      }
      if (studentData.parent_2_id) {
        parentPromises.push(parentsApi.getById(studentData.parent_2_id))
      }

      const [parent1, parent2] = await Promise.all(parentPromises)
      const parentData: {father?: Parent, mother?: Parent} = {}
      if (parent1) parentData.father = parent1
      if (parent2) parentData.mother = parent2
      setParents(parentData)

      // Fetch memorization history
      const memData = await memorizationsApi.getByStudent(studentId)
      setMemorizations(memData || [])

      // Extract unique teachers from memorizations
      const uniqueTeachers = Array.from(new Set(
        memData
          .filter(m => m.teacher_name)
          .map(m => m.teacher_name)
      )) as string[]
      setTeachers(uniqueTeachers)
    } catch (err: any) {
      console.error('Failed to fetch data:', err)
      setError('Gagal memuat data murid')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fluent': return 'text-green-700'
      case 'good': return 'text-yellow-700'
      case 'needs_improvement': return 'text-red-700'
      default: return 'text-gray-700'
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'fluent': return 'Lancar'
      case 'good': return 'Cukup'
      case 'needs_improvement': return 'Perlu Perbaikan'
      default: return status
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
    if (!student) return

    try {
      await studentsApi.delete(student.id)
      toast({
        title: "Berhasil",
        description: "Murid berhasil dihapus",
      })
      navigate('/admin/students')
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.error || error.message || "Gagal menghapus murid",
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

  if (!student) {
    return (
      <div className="border-2 border-yellow-200 bg-yellow-50 p-6 text-center">
        <p className="text-yellow-800 font-medium">Data murid tidak ditemukan</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/admin/students"
          className="text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-2 inline-block"
        >
          <ArrowLeft size={16} />
          Kembali
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{student.name}</h1>
            <p className="text-sm text-gray-600">
              {student.class_name || 'Belum ada kelas'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to={`/admin/students/${student.id}/edit`}>
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

      {/* Student Info, Parents & Teachers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Student Information */}
        <div className="border-2 border-border bg-white p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold">Informasi Murid</h2>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Nama Lengkap</p>
              <p className="font-semibold text-base">{student.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Kelas</p>
              <Badge className="text-sm">{student.class_name || '-'}</Badge>
            </div>
            {student.birth_date && (
              <div>
                <p className="text-sm text-gray-600">Tanggal Lahir</p>
                <p className="font-semibold text-base flex items-center gap-2">
                  <Calendar size={14} />
                  {new Date(student.birth_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Parents Information */}
        <div className="border-2 border-border bg-white p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold">Orang Tua</h2>
          </div>
          <div className="space-y-4">
            {parents.father ? (
              <div className="border-2 border-blue-100 bg-blue-50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">Ayah</span>
                </div>
                <p className="font-medium">{parents.father.FullName}</p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                    <Mail size={14} />
                    {parents.father.Email}
                  </div>
                  {parents.father.Phone && (
                    <div className="flex items-center gap-1">
                      <Phone size={14} />
                      {parents.father.Phone}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">Belum ada data ayah</div>
            )}

            {parents.mother ? (
              <div className="border-2 border-pink-100 bg-pink-50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">Ibu</span>
                </div>
                <p className="font-medium">{parents.mother.FullName}</p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                    <Mail size={14} />
                    {parents.mother.Email}
                  </div>
                  {parents.mother.Phone && (
                    <div className="flex items-center gap-1">
                      <Phone size={14} />
                      {parents.mother.Phone}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">Belum ada data ibu</div>
            )}
          </div>
        </div>

        {/* Teachers Information */}
        <div className="border-2 border-border bg-white p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold">Guru</h2>
          </div>
          <div className="space-y-3">
            {teachers.length > 0 ? (
              teachers.map((teacher, index) => (
                <div key={index} className="border-2 border-purple-100 bg-purple-50 p-3">
                  <p className="font-medium">{teacher}</p>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 italic">Belum ada data guru</div>
            )}
          </div>
        </div>
      </div>

      {/* Memorization History */}
      {memorizations.length > 0 && (
        <div className="border-2 border-border bg-white p-4 md:p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Riwayat Hafalan Terakhir</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50 border-b-2 border-border">
                <tr>
                  <th className="text-left p-3 border-r-2 border-border">Tanggal</th>
                  <th className="text-left p-3 border-r-2 border-border">Unit</th>
                  <th className="text-left p-3 border-r-2 border-border">Guru</th>
                  <th className="text-center p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-border">
                {memorizations.slice(0, 5).map((memo) => (
                  <tr key={memo.id} className="hover:bg-gray-50">
                    <td className="p-3 border-r-2 border-border text-sm">
                      {new Date(memo.test_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="p-3 border-r-2 border-border text-sm">
                      {getUnitDisplay(memo)}
                    </td>
                    <td className="p-3 border-r-2 border-border text-sm">
                      {memo.teacher_name || '-'}
                    </td>
                    <td className="p-3 text-center">
                      <Badge className={`text-xs ${getBadgeClass(memo.status)}`}>
                        {getStatusText(memo.status)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Memorizations */}
      {memorizations.length === 0 && (
        <div className="border-2 border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">Belum ada riwayat hafalan</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Murid?"
        description={`Apakah Anda yakin ingin menghapus murid ${student.name}?\n\nSemua data hafalan juga akan dihapus.`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={executeDelete}
      />
    </div>
  )
}
