import { useState } from 'react'
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
import api from '@/lib/api'

const studentSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  class_id: z.string().optional(),
  parent_id_1: z.string().min(1, 'Ayah wajib dipilih'),
  parent_id_2: z.string().optional(),
  birth_date: z.string().optional(),
  phone: z.string().optional(),
})

type StudentFormData = z.infer<typeof studentSchema>

export function StudentFormPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { studentId } = useParams<{ studentId?: string }>()
  const navigate = useNavigate()
  const isEditing = !!studentId

  const [classes, setClasses] = useState([
    { id: '1', name: 'Kelas 1A' },
    { id: '2', name: 'Kelas 1B' },
    { id: '3', name: 'Kelas 6A' },
    { id: '4', name: 'Kelas 6B' },
  ])

  const [parents, setParents] = useState([
    { id: '1', name: 'Bapak Ahmad', email: 'bapak.ahmad@test.com' },
    { id: '2', name: 'Ibu Siti', email: 'ibu.siti@test.com' },
    { id: '3', name: 'Bapak Hasan', email: 'bapak.hasan@test.com' },
    { id: '4', name: 'Ibu Fatimah', email: 'ibu.fatimah@test.com' },
    { id: '5', name: 'Bapak Muhammad', email: 'bapak.muhammad@test.com' },
    { id: '6', name: 'Ibu Aisyah', email: 'ibu.aisyah@test.com' },
  ])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      parent_id_2: ''
    }
  })

  const onSubmit = async (data: StudentFormData) => {
    try {
      if (isEditing) {
        await api.put(`/admin/students/${studentId}`, data)
        toast({ title: "Berhasil", description: "Data murid berhasil diupdate" })
      } else {
        await api.post('/admin/students', data)
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
          {isEditing ? 'Edit Murid' : 'Tambah Murid Baru'}
        </h1>
      </div>

      {/* Form */}
      <div className="border-2 border-border bg-white p-6 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              {parents.filter(p => p.name.includes('Bapak')).map((parent) => (
                <option key={parent.id} value={parent.id}>{parent.name} ({parent.email})</option>
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
              {parents.filter(p => p.name.includes('Ibu')).map((parent) => (
                <option key={parent.id} value={parent.id}>{parent.name} ({parent.email})</option>
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
