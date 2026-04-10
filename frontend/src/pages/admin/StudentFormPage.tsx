import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'
import { studentsApi, classesApi, parentsApi } from '@/lib/api'

const studentSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  class_id: z.string().optional(),
  parent_id_1: z.string().min(1, 'Ayah wajib dipilih'),
  parent_id_2: z.string().optional(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD').optional().or(z.literal('')),
  phone: z.string().optional(),
})

type StudentFormData = z.infer<typeof studentSchema>

interface Class {
  id: string
  name: string
}

interface Parent {
  UserID: string
  FullName: string
  Email: string
}

export function StudentFormPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { studentId } = useParams<{ studentId?: string }>()
  const navigate = useNavigate()
  const isEditing = !!studentId

  const [classes, setClasses] = useState<Class[]>([])
  const [parents, setParents] = useState<Parent[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      parent_id_2: ''
    }
  })

  useEffect(() => {
    fetchData()
    if (isEditing && studentId) {
      fetchStudentData()
    }
  }, [studentId, isEditing])

  const fetchData = async () => {
    try {
      setLoadingData(true)
      const [classesData, parentsData] = await Promise.all([
        classesApi.getAll(),
        parentsApi.getAll()
      ])
      setClasses(classesData)
      setParents(parentsData)
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Gagal memuat data form"
      })
    } finally {
      setLoadingData(false)
    }
  }

  const fetchStudentData = async () => {
    if (!studentId) return
    try {
      const student = await studentsApi.getById(studentId)
      reset({
        name: student.name,
        class_id: student.class_id,
        parent_id_1: student.parent_1_id || '',
        parent_id_2: student.parent_2_id || '',
      })
    } catch (err: any) {
      // Error already handled by toast in parent catch block
    }
  }

  const onSubmit = async (data: StudentFormData) => {
    try {
      if (isEditing) {
        await studentsApi.update(studentId!, data)
        toast({ title: "Berhasil", description: "Data murid berhasil diupdate" })
      } else {
        await studentsApi.create(data)
        toast({ title: "Berhasil", description: "Murid baru berhasil ditambahkan" })
      }

      setTimeout(() => {
        navigate('/admin/students')
      }, 500)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.error || "Gagal menyimpan data murid",
      })
    }
  }

  if (loadingData) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary"></div>
      </div>
    )
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
          {isEditing ? 'Edit Murid' : 'Tambah Murid Baru'}
        </h1>
      </div>

      {/* Form */}
      <div className="border-2 border-border bg-white p-4 md:p-6 max-w-2xl w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
          {/* Nama */}
          <div>
            <Label htmlFor="name">Nama Lengkap *</Label>
            <Input
              id="name"
              placeholder="Masukkan nama lengkap murid"
              className="border-2 min-h-[44px]"
              {...register('name')}
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          {/* Kelas */}
          <div>
            <Label htmlFor="class_id">Kelas</Label>
            <select
              id="class_id"
              className="flex h-9 w-full rounded-none border-2 border-input bg-transparent px-3 py-1 text-base min-h-[44px]"
              {...register('class_id')}
            >
              <option value="">Pilih Kelas</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          {/* Parent 1 (Ayah) */}
          <div>
            <Label htmlFor="parent_id_1">Ayah *</Label>
            <select
              id="parent_id_1"
              className="flex h-9 w-full rounded-none border-2 border-input bg-transparent px-3 py-1 text-base min-h-[44px]"
              {...register('parent_id_1')}
            >
              <option value="">Pilih Ayah</option>
              {parents.filter(p => p.FullName.includes('Bapak')).map((parent) => (
                <option key={parent.UserID} value={parent.UserID}>{parent.FullName} ({parent.Email})</option>
              ))}
            </select>
            {errors.parent_id_1 && <p className="text-sm text-red-600 mt-1">{errors.parent_id_1.message}</p>}
          </div>

          {/* Parent 2 (Ibu) */}
          <div>
            <Label htmlFor="parent_id_2">Ibu</Label>
            <select
              id="parent_id_2"
              className="flex h-9 w-full rounded-none border-2 border-input bg-transparent px-3 py-1 text-base min-h-[44px]"
              {...register('parent_id_2')}
            >
              <option value="">Pilih Ibu</option>
              {parents.filter(p => p.FullName.includes('Ibu')).map((parent) => (
                <option key={parent.UserID} value={parent.UserID}>{parent.FullName} ({parent.Email})</option>
              ))}
            </select>
          </div>

          {/* Tanggal Lahir */}
          <div>
            <Label htmlFor="birth_date">Tanggal Lahir</Label>
            <Input
              id="birth_date"
              type="date"
              className="border-2 min-h-[44px]"
              {...register('birth_date')}
            />
          </div>

          {/* No HP */}
          <div>
            <Label htmlFor="phone">No HP (Orang Tua)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="08xxxxxxxxxx"
              className="border-2 min-h-[44px]"
              {...register('phone')}
            />
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
    </div>
  )
}
