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
import { parentsApi } from '@/lib/api'

const parentSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().optional(),
  gender: z.enum(['male', 'female'], { required_error: 'Gender wajib dipilih' }),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
})

type ParentFormData = z.infer<typeof parentSchema>

export function ParentFormPage() {
  const { toast } = useToast()
  const { parentId } = useParams<{ parentId?: string }>()
  const navigate = useNavigate()
  const isEditing = !!parentId

  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ParentFormData>({
    resolver: zodResolver(parentSchema),
  })

  // Fetch parent data if editing
  useEffect(() => {
    const fetchParent = async () => {
      if (!parentId) return

      try {
        setIsLoading(true)
        const parent = await parentsApi.getById(parentId)
        reset({
          name: parent.FullName,
          email: parent.Email,
          phone: parent.Phone || '',
          gender: parent.Gender || 'male',
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat data orang tua",
        })
        navigate('/admin/parents')
      } finally {
        setIsLoading(false)
      }
    }

    fetchParent()
  }, [parentId, navigate])

  const onSubmit = async (data: ParentFormData) => {
    try {
      if (isEditing && parentId) {
        await parentsApi.update(parentId, {
          user_id: parentId,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          gender: data.gender,
        })
      } else {
        await parentsApi.create({
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          password: data.password || '',
          gender: data.gender,
        })
      }

      toast({
        title: "Berhasil",
        description: isEditing ? "Data orang tua berhasil diupdate" : "Orang tua baru berhasil ditambahkan"
      })

      setTimeout(() => {
        navigate('/admin/parents')
      }, 500)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.error || error.message || "Gagal menyimpan data",
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
          {isEditing ? 'Edit Orang Tua' : 'Tambah Orang Tua Baru'}
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
              placeholder="Masukkan nama lengkap"
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
              placeholder="contoh@email.com"
              className="border-2 min-h-[44px]"
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          {/* No HP */}
          <div>
            <Label htmlFor="phone">No HP</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="08xxxxxxxxxx"
              className="border-2 min-h-[44px]"
              {...register('phone')}
            />
          </div>

          {/* Gender */}
          <div>
            <Label htmlFor="gender">Jenis Kelamin *</Label>
            <select
              id="gender"
              className="flex h-9 w-full rounded-none border-2 border-input bg-transparent px-3 py-1 text-base min-h-[44px]"
              {...register('gender')}
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="male">Laki-laki (Ayah)</option>
              <option value="female">Perempuan (Ibu)</option>
            </select>
            {errors.gender && <p className="text-sm text-red-600 mt-1">{errors.gender.message}</p>}
          </div>

          {/* Password (hanya untuk create) */}
          {!isEditing && (
            <div>
              <Label htmlFor="password">Password *</Label>
              <PasswordInput
                id="password"
                placeholder="Minimal 6 karakter"
                className="border-2 min-h-[44px]"
                {...register('password')}
              />
              {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Password otomatis tergenerate. Biarkan kosong untuk password random.
              </p>
            </div>
          )}

          {/* Notes */}
          <div className="border-2 border-blue-100 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Catatan:</strong>
            </p>
            <ul className="text-sm text-blue-700 list-disc list-inside mt-2 space-y-1">
              <li>Setelah dibuat, orang tua bisa ditambahkan sebagai ayah/ibu pada murid</li>
              <li>1 orang tua bisa memiliki banyak anak</li>
              <li>Default password akan dikirim ke email</li>
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
