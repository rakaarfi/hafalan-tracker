import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Users, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { parentsApi, studentsApi, Student } from '@/lib/api'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

const parentSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().min(10, 'No HP wajib diisi'),
  gender: z.enum(['male', 'female'], { required_error: 'Gender wajib dipilih' }),
  password: z.string().optional(),
})

type ParentFormData = z.infer<typeof parentSchema>

export function ParentFormPage() {
  const { toast } = useToast()
  const { t } = useTranslation()
  const { parentId } = useParams<{ parentId?: string }>()
  const navigate = useNavigate()
  const isEditing = !!parentId

  const [isLoading, setIsLoading] = useState(false)
  const [children, setChildren] = useState<Student[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [showAddChildModal, setShowAddChildModal] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [loadingChildren, setLoadingChildren] = useState(false)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)
  const [childToRemove, setChildToRemove] = useState<Student | null>(null)
  const [phone, setPhone] = useState<string>('')

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<ParentFormData>({
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
          gender: (parent.Gender || 'male') as "male" | "female",  // Type assertion for strict gender type
        })
        setPhone(parent.Phone || '')

        // Fetch children
        fetchChildren(parentId)
      } catch (error) {
        toast({
          variant: "destructive",
          title: t('errors.failedToLoad'),
          description: "Gagal memuat data orang tua",
        })
        navigate('/admin/parents')
      } finally {
        setIsLoading(false)
      }
    }

    fetchParent()
  }, [parentId, navigate])

  // Fetch all students for the dropdown (only when modal is open)
  useEffect(() => {
    if (showAddChildModal && isEditing) {
      fetchAllStudents()
    }
  }, [showAddChildModal, isEditing])

  const fetchChildren = async (id: string) => {
    try {
      setLoadingChildren(true)
      const childrenData = await parentsApi.getChildren(id)
      setChildren(childrenData)
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('errors.failedToLoadChildren'),
        description: "Gagal memuat data anak",
      })
    } finally {
      setLoadingChildren(false)
    }
  }

  const fetchAllStudents = async () => {
    try {
      const studentsData = await studentsApi.getAll()
      // Filter out students that are already children
      const availableStudents = studentsData.data.filter(s =>  // Extract data array from PaginatedResponse
        !children.some(c => c.id === s.id)
      )
      setAllStudents(availableStudents)
    } catch (error) {
    }
  }

  const handleAddChild = async () => {
    if (!parentId || !selectedStudentId) {
      toast({
        variant: "destructive",
        title: t('errors.failedToAddChild'),
        description: t('errors.selectStudent'),
      })
      return
    }

    try {
      await parentsApi.addChild(parentId, selectedStudentId)

      // Refresh children list
      await fetchChildren(parentId)

      // Reset and close modal
      setSelectedStudentId('')
      setShowAddChildModal(false)

      toast({
        title: "Berhasil",
        description: "Anak berhasil ditambahkan",
      })
    } catch (error: any) {
      let errorMessage = error.response?.data?.error || error.message || "Gagal menambahkan anak"

      // Translate specific backend error messages
      if (errorMessage.includes('already has a father')) {
        errorMessage = t('errors.parentAlreadyHasFather')
      } else if (errorMessage.includes('already has a mother')) {
        errorMessage = t('errors.parentAlreadyHasMother')
      }

      toast({
        variant: "destructive",
        title: t('errors.failedToAddChild'),
        description: errorMessage,
      })
    }
  }

  const handleRemoveChild = () => {
    if (!parentId || !childToRemove) return

    parentsApi.removeChild(parentId, childToRemove.id)
      .then(() => {
        // Refresh children list
        fetchChildren(parentId)

        toast({
          title: "Berhasil",
          description: "Anak berhasil dihapus",
        })
      })
      .catch((error: any) => {
        let errorMessage = error.response?.data?.error || error.message || "Gagal menghapus anak"

        // Translate specific backend error messages
        if (errorMessage.includes('not linked to this student')) {
          errorMessage = t('errors.childNotLinkedToParent')
        }

        toast({
          variant: "destructive",
          title: t('errors.failedToRemoveChild'),
          description: errorMessage,
        })
      })
      .finally(() => {
        setRemoveDialogOpen(false)
        setChildToRemove(null)
      })
  }

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

          {/* Notes */}
          <div className="border-2 border-blue-100 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Catatan:</strong>
            </p>
            <ul className="text-sm text-blue-700 list-disc list-inside mt-2 space-y-1">
              <li>Password akan otomatis digenerate dari 6 digit terakhir nomor HP</li>
              <li>Orang tua wajib mengganti password saat login pertama</li>
              <li>Setelah dibuat, orang tua bisa ditambahkan sebagai ayah/ibu pada murid</li>
              <li>1 orang tua bisa memiliki banyak anak</li>
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

      {/* Children Section (only when editing) */}
      {isEditing && (
        <div className="border-2 border-border bg-white p-4 md:p-6 max-w-2xl w-full mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-gray-600" />
              <h2 className="text-lg font-semibold">Anak-Anak</h2>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddChildModal(true)}
              className="min-h-[44px] min-w-[44px]"
            >
              <Plus size={16} className="mr-2 inline" />
              Tambah Anak
            </Button>
          </div>

          {loadingChildren ? (
            <div className="flex justify-center items-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary"></div>
            </div>
          ) : children.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-gray-200 bg-gray-50">
              <p>Belum ada anak yang ditambahkan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between border-2 border-border p-3 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{child.name}</p>
                    <p className="text-sm text-gray-600">{child.class_name || 'Belum ada kelas'}</p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setChildToRemove(child)
                      setRemoveDialogOpen(true)
                    }}
                    className="min-h-[36px] min-w-[36px]"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Child Modal */}
      {showAddChildModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-border p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Tambah Anak</h3>
              <button
                onClick={() => {
                  setShowAddChildModal(false)
                  setSelectedStudentId('')
                }}
                className="p-2 hover:bg-gray-100 min-h-[44px] min-w-[44px]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <Label htmlFor="student">Pilih Murid</Label>
              <select
                id="student"
                className="flex h-9 w-full rounded-none border-2 border-input bg-transparent px-3 py-1 text-base min-h-[44px] mt-1"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="">Pilih Murid</option>
                {allStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} {!student.class_name || student.class_name === 'Tanpa Phone' ? '(Tanpa Kelas)' : `- ${student.class_name}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddChildModal(false)
                  setSelectedStudentId('')
                }}
                className="min-h-[44px] flex-1"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleAddChild}
                disabled={!selectedStudentId}
                className="min-h-[44px] flex-1"
              >
                Tambah
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Child Confirmation Dialog */}
      <ConfirmDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        title="Hapus Anak?"
        description={
          childToRemove
            ? `Apakah Anda yakin ingin menghapus ${childToRemove.name} dari daftar anak?`
            : 'Hapus anak?'
        }
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleRemoveChild}
      />
    </div>
  )
}
