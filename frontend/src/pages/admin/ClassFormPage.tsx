import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { classesApi, teachersApi, QuranTeacherAssignment } from '@/lib/api'

const classSchema = z.object({
  name: z.string().min(1, 'Nama kelas wajib diisi'),
  grade_level: z.string().min(1, 'Tingkat kelas wajib diisi'),
  homeroom_teacher_id: z.string().optional(),
})

type ClassFormData = z.infer<typeof classSchema>

export function ClassFormPage() {
  const { toast } = useToast()
  const { classId } = useParams<{ classId?: string }>()
  const navigate = useNavigate()
  const isEditing = !!classId

  const [isLoading, setIsLoading] = useState(false)
  const [teachers, setTeachers] = useState<Array<{UserID: string, FullName: string}>>([])
  const [quranAssignments, setQuranAssignments] = useState<QuranTeacherAssignment[]>([])
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Change teacher dialog state
  const [changeTeacherDialogOpen, setChangeTeacherDialogOpen] = useState(false)
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [selectedTeacherName, setSelectedTeacherName] = useState('')

  // Confirm dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteAssignment, setPendingDeleteAssignment] = useState<QuranTeacherAssignment | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
  })

  // Fetch teachers data
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await teachersApi.getAll()
        setTeachers(data.data || [])
      } catch (error) {
        // Error handled by toast
        setTeachers([])
      }
    }

    fetchTeachers()
  }, [])

  // Fetch class data if editing
  useEffect(() => {
    const fetchClass = async () => {
      if (!classId) return

      try {
        setIsLoading(true)
        const classData = await classesApi.getById(classId)
        reset({
          name: classData.name,
          grade_level: classData.grade_level,
          homeroom_teacher_id: classData.homeroom_teacher_id || '',
        })

        // Fetch Quran teacher assignments
        await fetchQuranAssignments()
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat data kelas",
        })
        navigate('/admin/classes')
      } finally {
        setIsLoading(false)
      }
    }

    fetchClass()
  }, [classId, navigate])

  const fetchQuranAssignments = async () => {
    if (!classId) return

    try {
      setIsLoadingAssignments(true)
      const assignments = await classesApi.getQuranTeachers(classId)
      setQuranAssignments(assignments)
    } catch (error) {
      // Error handled by toast
    } finally {
      setIsLoadingAssignments(false)
    }
  }

  const getActiveAssignment = () => {
    if (!quranAssignments || quranAssignments.length === 0) return undefined
    return quranAssignments.find(a => a.is_active)
  }

  const handleChangeTeacher = () => {
    setChangeTeacherDialogOpen(true)
  }

  const executeChangeTeacher = async () => {
    if (!classId || !selectedTeacherId) return

    const activeAssignment = getActiveAssignment()
    if (!activeAssignment) return

    try {
      setIsAssigning(true)

      // End current assignment
      await classesApi.endQuranTeacherAssignment(
        classId,
        activeAssignment.id.toString(),
        "Replaced with " + selectedTeacherName
      )

      // Assign new teacher
      await classesApi.assignQuranTeacher(classId, {
        quran_teacher_id: parseInt(selectedTeacherId),
        academic_year: activeAssignment.academic_year,
        notes: "Replaced previous teacher",
      })

      toast({
        title: "Berhasil",
        description: `Guru Quran berhasil diganti dengan ${selectedTeacherName}`,
      })

      await fetchQuranAssignments()
      setChangeTeacherDialogOpen(false)
      setSelectedTeacherId('')
      setSelectedTeacherName('')
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.error || error.message || "Gagal mengganti guru Quran",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleAssignQuranTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!classId) return

    const formData = new FormData(e.currentTarget)
    const teacherId = formData.get('teacher_id')
    const academicYear = formData.get('academic_year')
    const notes = formData.get('notes')

    if (!teacherId || !academicYear) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Pilih guru dan tahun akademik",
      })
      return
    }

    try {
      setIsAssigning(true)
      await classesApi.assignQuranTeacher(classId, {
        quran_teacher_id: parseInt(teacherId as string),
        academic_year: academicYear as string,
        notes: notes ? notes as string : undefined,
      })

      toast({
        title: "Berhasil",
        description: "Guru Quran berhasil ditugaskan",
      })

      // Reset form and fetch assignments
      const form = document.querySelector('form[data-assignment-form="quran"]') as HTMLFormElement
      if (form) form.reset()
      await fetchQuranAssignments()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.error || error.message || "Gagal menugaskan guru Quran",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const handleDeleteAssignment = (assignment: QuranTeacherAssignment) => {
    setPendingDeleteAssignment(assignment)
    setDeleteDialogOpen(true)
  }

  const executeDelete = async () => {
    if (!classId || !pendingDeleteAssignment) return

    try {
      setIsDeleting(true)

      await classesApi.endQuranTeacherAssignment(
        classId,
        pendingDeleteAssignment.id.toString(),
        "Removed by admin"
      )

      toast({
        title: "Berhasil",
        description: "Penugasan guru Quran berhasil dihapus",
      })

      await fetchQuranAssignments()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.error || error.message || "Gagal menghapus penugasan",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setPendingDeleteAssignment(null)
    }
  }

  const onSubmit = async (data: ClassFormData) => {
    try {
      if (isEditing && classId) {
        await classesApi.update(classId, {
          id: classId,
          name: data.name,
          grade_level: data.grade_level,
          homeroom_teacher_id: data.homeroom_teacher_id || undefined,
        })
      } else {
        await classesApi.create({
          name: data.name,
          grade_level: data.grade_level,
          homeroom_teacher_id: data.homeroom_teacher_id || undefined,
        })
      }

      toast({
        title: "Berhasil",
        description: isEditing ? "Data kelas berhasil diupdate" : "Kelas baru berhasil ditambahkan"
      })

      setTimeout(() => {
        navigate('/admin/classes')
      }, 500)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.error || error.message || "Gagal menyimpan data kelas",
      })
    }
  }

  const activeAssignment = getActiveAssignment()

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link to="/admin/classes">
          <button
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>
        </Link>
        <h1 className="text-xl md:text-2xl font-bold">
          {isEditing ? 'Edit Kelas' : 'Tambah Kelas Baru'}
        </h1>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
      /* Form */
      <div className="space-y-6">
        <div className="border-2 border-border bg-white p-4 md:p-6 max-w-2xl w-full">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
            {/* Nama Kelas */}
            <div>
              <Label htmlFor="name">Nama Kelas *</Label>
              <Input
                id="name"
                placeholder="Contoh: Kelas 1A"
                className="border-2 min-h-[44px]"
                {...register('name')}
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
            </div>

            {/* Tingkat Kelas */}
            <div>
              <Label htmlFor="grade_level">Tingkat Kelas *</Label>
              <select
                id="grade_level"
                className="flex h-9 w-full rounded-none border-2 border-input bg-transparent px-3 py-1 text-base min-h-[44px]"
                {...register('grade_level')}
              >
                <option value="">Pilih Tingkat Kelas</option>
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 2">Grade 2</option>
                <option value="Grade 3">Grade 3</option>
                <option value="Grade 4">Grade 4</option>
                <option value="Grade 5">Grade 5</option>
                <option value="Grade 6">Grade 6</option>
              </select>
              {errors.grade_level && <p className="text-sm text-red-600 mt-1">{errors.grade_level.message}</p>}
            </div>

            {/* Wali Kelas */}
            <div>
              <Label htmlFor="homeroom_teacher_id">Wali Kelas</Label>
              <select
                id="homeroom_teacher_id"
                className="flex h-9 w-full rounded-none border-2 border-input bg-transparent px-3 py-1 text-base min-h-[44px]"
                {...register('homeroom_teacher_id')}
              >
                <option value="">Pilih Wali Kelas</option>
                {teachers.map((teacher) => (
                  <option key={teacher.UserID} value={teacher.UserID}>{teacher.FullName}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Wali kelas bertanggung jawab atas kelas tersebut
              </p>
            </div>

            {/* Info */}
            <div className="border-2 border-blue-100 bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                <strong>Catatan:</strong>
              </p>
              <ul className="text-sm text-blue-700 list-disc list-inside mt-2 space-y-1">
                <li>Format nama kelas disarankan: "Kelas XA" atau "Kelas XB"</li>
                <li>Wali kelas bisa diubah kapan saja</li>
                <li>Murid akan ditugaskan ke kelas saat dibuat/diedit</li>
              </ul>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Link to="/admin/classes" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-[44px] w-full"
                >
                  Batal
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-h-[44px] flex-1"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </div>

        {/* Quran Teacher Assignment Section - Only show when editing */}
        {isEditing && classId && (
          <div className="border-2 border-border bg-white p-4 md:p-6 max-w-2xl w-full">
            <h2 className="text-lg font-bold mb-4">Penugasan Guru Quran</h2>

            {/* Current Assignment or Form */}
            {activeAssignment ? (
              <>
                {/* Show current teacher with change button */}
                <div className="border-2 border-green-200 bg-green-50 p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Guru Quran Aktif</p>
                      <p className="font-semibold text-base">{activeAssignment.quran_teacher_name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Tahun Akademik: {activeAssignment.academic_year}
                      </p>
                      <p className="text-xs text-gray-600">
                        Mulai: {new Date(activeAssignment.start_date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <Button
                      onClick={handleChangeTeacher}
                      disabled={isAssigning}
                      variant="outline"
                      className="min-h-[44px] flex items-center gap-2"
                    >
                      <RefreshCw size={16} />
                      {isAssigning ? 'Mengganti...' : 'Ganti Guru'}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Show assignment form when no active assignment */}
                <form onSubmit={handleAssignQuranTeacher} data-assignment-form="quran" className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="teacher_id">Guru Quran *</Label>
                    <select
                      id="teacher_id"
                      name="teacher_id"
                      className="flex h-9 w-full rounded-none border-2 border-input bg-transparent px-3 py-1 text-base min-h-[44px]"
                      required
                    >
                      <option value="">Pilih Guru Quran</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.UserID} value={teacher.UserID}>{teacher.FullName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="academic_year">Tahun Akademik *</Label>
                    <Input
                      id="academic_year"
                      name="academic_year"
                      placeholder="Contoh: 2025/2026"
                      defaultValue="2025/2026"
                      className="border-2 min-h-[44px]"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Catatan</Label>
                    <Input
                      id="notes"
                      name="notes"
                      placeholder="Catatan opsional"
                      className="border-2 min-h-[44px]"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isAssigning}
                    className="min-h-[44px] w-full"
                  >
                    {isAssigning ? (
                      'Menugaskan...'
                    ) : (
                      <>
                        <Plus size={16} className="mr-2" />
                        Tugaskan Guru Quran
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}

            {/* Help Text */}
            <div className="mt-4 p-3 bg-yellow-50 border-2 border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Tips:</strong>
              </p>
              <ul className="text-sm text-yellow-700 list-disc list-inside mt-2 space-y-1">
                <li>Setiap kelas hanya boleh memiliki 1 Guru Quran aktif per tahun akademik</li>
                {activeAssignment ? (
                  <li>Klik "Ganti Guru" untuk mengganti guru Quran yang saat ini aktif</li>
                ) : (
                  <li>Isi form di atas untuk menugaskan guru Quran ke kelas ini</li>
                )}
                <li>Anda dapat menghapus penugasan kapan saja</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Change Teacher Dialog */}
      <Dialog open={changeTeacherDialogOpen} onOpenChange={setChangeTeacherDialogOpen}>
        <DialogContent className="sm:max-w-md border-2">
          <DialogHeader>
            <DialogTitle>Ganti Guru Quran</DialogTitle>
            <DialogDescription>
              Pilih guru Quran baru untuk mengganti {activeAssignment?.quran_teacher_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="new_teacher">Guru Quran Baru *</Label>
              <select
                id="new_teacher"
                className="flex h-9 w-full rounded-none border-2 border-input bg-transparent px-3 py-1 text-base min-h-[44px]"
                value={selectedTeacherId}
                onChange={(e) => {
                  setSelectedTeacherId(e.target.value)
                  const teacher = teachers.find(t => t.UserID === e.target.value)
                  setSelectedTeacherName(teacher?.FullName || '')
                }}
                required
              >
                <option value="">Pilih Guru Quran</option>
                {teachers.map((teacher) => (
                  <option key={teacher.UserID} value={teacher.UserID}>{teacher.FullName}</option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setChangeTeacherDialogOpen(false)
                setSelectedTeacherId('')
                setSelectedTeacherName('')
              }}
              disabled={isAssigning}
              className="min-h-[44px]"
            >
              Batal
            </Button>
            <Button
              onClick={executeChangeTeacher}
              disabled={isAssigning || !selectedTeacherId}
              className="min-h-[44px]"
            >
              {isAssigning ? 'Mengganti...' : 'Ganti'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Penugasan?"
        description={
          pendingDeleteAssignment
            ? `Apakah Anda yakin ingin menghapus penugasan ${pendingDeleteAssignment.quran_teacher_name}?`
            : 'Hapus penugasan?'
        }
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={executeDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
