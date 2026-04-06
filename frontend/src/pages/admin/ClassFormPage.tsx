import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { classesApi, teachersApi } from '@/lib/api'

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

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
  })

  // Fetch teachers data
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await teachersApi.getAll()
        setTeachers(data)
      } catch (error) {
        console.error('Failed to fetch teachers:', error)
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
  }, [classId, navigate, reset, toast])

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

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="min-h-[44px] flex-1"
            >
              Batal
            </Button>
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
      )}
    </div>
  )
}
