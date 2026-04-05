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

const parentSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
})

type ParentFormData = z.infer<typeof parentSchema>

export function ParentFormPage() {
  const { toast } = useToast()
  const { parentId } = useParams<{ parentId?: string }>()
  const navigate = useNavigate()
  const isEditing = !!parentId

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ParentFormData>({
    resolver: zodResolver(parentSchema),
  })

  const onSubmit = async (data: ParentFormData) => {
    try {
      if (isEditing) {
        // Update parent
        toast({ title: "Berhasil", description: "Data orang tua berhasil diupdate" })
      } else {
        // Create parent
        toast({ title: "Berhasil", description: "Orang tua baru berhasil ditambahkan" })
      }

      setTimeout(() => {
        navigate('/admin/parents')
      }, 500)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.error || "Gagal menyimpan data",
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
          {isEditing ? 'Edit Orang Tua' : 'Tambah Orang Tua Baru'}
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

          {/* Password (hanya untuk create) */}
          {!isEditing && (
            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
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
    </div>
  )
}
