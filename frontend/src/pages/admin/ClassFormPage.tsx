import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

const classSchema = z.object({
  name: z.string().min(1, 'Nama kelas wajib diisi'),
  teacher_id: z.string().optional(),
})

type ClassFormData = z.infer<typeof classSchema>

export function ClassFormPage() {
  const { toast } = useToast()
  const { classId } = useParams<{ classId?: string }>()
  const navigate = useNavigate()
  const isEditing = !!classId

  const [teachers, setTeachers] = useState([
    { id: '1', name: 'Budi Santoso' },
    { id: '2', name: 'Siti Rahayu' },
  ])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
  })

  const onSubmit = async (data: ClassFormData) => {
    try {
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
        description: error.response?.data?.error || "Gagal menyimpan data kelas",
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
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Edit Kelas' : 'Tambah Kelas Baru'}
        </h1>
      </div>

      {/* Form */}
      <div className="border-2 border-border bg-white p-6 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          {/* Wali Kelas */}
          <div>
            <Label htmlFor="teacher_id">Wali Kelas</Label>
            <select
              id="teacher_id"
              className="flex h-9 w-full rounded-none border-2 border-input bg-transparent px-3 py-1 text-base min-h-[44px]"
              {...register('teacher_id')}
            >
              <option value="">Pilih Wali Kelas</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
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
    </div>
  )
}
