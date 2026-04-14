import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { teachersApi } from '@/lib/api'
import { translateBackendError } from '@/lib/errorTranslation'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

const teacherSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().min(10, 'No HP wajib diisi'),
  password: z.string().optional(),
})

type TeacherFormData = z.infer<typeof teacherSchema>

export function TeacherFormPage() {
  const { toast } = useToast()
  const { teacherId } = useParams<{ teacherId?: string }>()
  const navigate = useNavigate()
  const isEditing = !!teacherId

  const [isLoading, setIsLoading] = useState(false)
  const [phone, setPhone] = useState<string>('')

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
  })

  // Fetch teacher data if editing
  useEffect(() => {
    const fetchTeacher = async () => {
      if (!teacherId) return

      try {
        setIsLoading(true)
        const teacher = await teachersApi.getById(teacherId)
        reset({
          name: teacher.FullName,
          email: teacher.Email,
          phone: teacher.Phone || '',
        })
        setPhone(teacher.Phone || '')
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat data guru",
        })
        navigate('/admin/teachers')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeacher()
  }, [teacherId, navigate])

  const onSubmit = async (data: TeacherFormData) => {
    try {
      if (isEditing && teacherId) {
        await teachersApi.update(teacherId, {
          name: data.name,
          email: data.email,
          phone: data.phone || '',
        })
      } else {
        await teachersApi.create({
          name: data.name,
          email: data.email,
          phone: data.phone || '',
        })
      }

      toast({
        title: "Berhasil",
        description: isEditing ? "Data guru berhasil diupdate" : "Guru baru berhasil ditambahkan"
      })

      setTimeout(() => {
        navigate('/admin/teachers')
      }, 500)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.error || error.message || "Gagal menyimpan data guru",
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
          {isEditing ? 'Edit Guru' : 'Tambah Guru Baru'}
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
          {/* Nama */}
          <div>
            <Label htmlFor="name">Nama Lengkap *</Label>
            <Input
              id="name"
              placeholder="Masukkan nama lengkap guru"
              className="border-2 min-h-[44px]"
              {...register('name')}
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="guru@sekolah.sch.id"
              className="border-2 min-h-[44px]"
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          {/* No HP */}
          <div>
            <Label htmlFor="phone">No HP *</Label>
            <PhoneInput
              id="phone"
              international
              countryCallingCodeEditable={false}
              defaultCountry="ID"
              value={phone}
              onChange={(value) => {
                setPhone(value || '')
                setValue('phone', value || '', { shouldValidate: true })
              }}
              className="flex border-2 border-input bg-transparent px-3 py-2 min-h-[44px]"
            />
            {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Password akan otomatis digenerate dari 6 digit terakhir nomor HP
            </p>
          </div>

          {/* Info */}
          <div className="border-2 border-blue-100 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Catatan:</strong>
            </p>
            <ul className="text-sm text-blue-700 list-disc list-inside mt-2 space-y-1">
              <li>Password akan otomatis digenerate dari 6 digit terakhir nomor HP</li>
              <li>Guru wajib mengganti password saat login pertama</li>
              <li>Guru yang ditambahkan akan otomatis mendapat role sebagai Guru</li>
              <li>Guru bisa ditugaskan sebagai wali kelas di menu Kelas</li>
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
