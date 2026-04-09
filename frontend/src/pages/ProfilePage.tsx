import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/authStore'
import { MobileNav } from '@/components/common/MobileNav'
import api from '@/lib/api'

const profileSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().optional(),
})

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Password saat ini wajib diisi'),
  new_password: z.string().min(6, 'Password baru minimal 6 karakter'),
  confirm_password: z.string().min(6, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirm_password"],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

interface ProfilePageProps {
  embedded?: boolean
}

export function ProfilePage({ embedded = false }: ProfilePageProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setLogoutDialogOpen(false)
  }

  // Determine dashboard URL based on user role
  const getDashboardUrl = () => {
    switch (user?.role) {
      case 'teacher':
        return '/teacher/dashboard'
      case 'parent':
        return '/parent/dashboard'
      case 'admin':
        return '/admin/dashboard'
      default:
        return '/'
    }
  }

  const getDashboardTitle = () => {
    switch (user?.role) {
      case 'teacher':
        return 'Dashboard Guru'
      case 'parent':
        return 'Dashboard Orang Tua'
      case 'admin':
        return 'Dashboard Admin'
      default:
        return 'Dashboard'
    }
  }

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: profileFormState } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
    }
  })

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: passwordFormState } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      await api.put('/profile', data)
      toast({
        title: "Berhasil",
        description: "Profile berhasil diupdate",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.error || "Gagal update profile",
      })
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await api.post('/profile/change-password', {
        current_password: data.current_password,
        new_password: data.new_password,
      })
      toast({
        title: "Berhasil",
        description: "Password berhasil diubah",
      })
      // Reset form
      (document.getElementById('password-form') as HTMLFormElement)?.reset()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.error || "Gagal mengubah password",
      })
    }
  }

  return (
    <div className={embedded ? "bg-gray-50" : "min-h-screen bg-gray-50"}>
      {/* Header - hanya muncul kalau NOT embedded */}
      {!embedded && (
        <header className="border-b-2 border-border bg-white p-4">
          <div className="container mx-auto flex justify-between items-center max-w-7xl">
            <div className="flex items-center gap-4">
              {/* Back to Dashboard Button */}
              <a
                href={getDashboardUrl()}
                className="px-4 py-2 border-2 border-border hover:bg-gray-50 min-h-[44px] min-w-[44px]"
              >
                ← {getDashboardTitle()}
              </a>
            </div>
            <div className="flex items-center gap-2">
              {/* Profile (active) */}
              <span className="hidden lg:block px-4 py-2 bg-primary text-white min-h-[44px] min-w-[44px]">
                Profile
              </span>
              {/* Logout Button */}
              <button
                onClick={() => setLogoutDialogOpen(true)}
                className="hidden lg:block px-4 py-2 border-2 border-border hover:bg-gray-50 min-h-[44px] min-w-[44px]"
              >
                Keluar
              </button>
              {/* Mobile Menu */}
              <MobileNav userRole={user?.role} onLogout={logout} />
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={embedded ? "py-6 px-4" : "container mx-auto py-6 px-4 max-w-2xl"}>
        {/* Page Title - hanya muncul kalau NOT embedded */}
        {!embedded && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-sm text-gray-600">Kelola akun Anda</p>
          </div>
        )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'profile' | 'password')}>
        {/* Main Container with border */}
        <div className="border-2 border-border bg-white">
          <TabsList className="grid w-full grid-cols-2 border-b-2 border-border h-13 p-2 min-h-[60px]">
            <TabsTrigger value="profile" className="min-h-[44px] text-center">
              Profile
            </TabsTrigger>
            <TabsTrigger value="password" className="min-h-[44px] text-center">
              Ganti Password
            </TabsTrigger>
          </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="p-6">
          {/* User Info Header */}
          <div className="border-b-2 border-border pb-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary text-white flex items-center justify-center text-2xl font-bold rounded-full">
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{user?.name || user?.email}</h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
                <Badge className="mt-1">
                  {user?.role === 'admin' && 'Administrator'}
                  {user?.role === 'teacher' && 'Guru'}
                  {user?.role === 'parent' && 'Orang Tua'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                className="border-2 min-h-[44px]"
                {...registerProfile('name')}
              />
              {profileFormState.errors.name && (
                <p className="text-sm text-red-600 mt-1">{profileFormState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                className="border-2 min-h-[44px]"
                {...registerProfile('email')}
              />
              {profileFormState.errors.email && (
                <p className="text-sm text-red-600 mt-1">{profileFormState.errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">No HP</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="08xxxxxxxxxx"
                className="border-2 min-h-[44px]"
                {...registerProfile('phone')}
              />
            </div>

            {/* Submit */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={profileFormState.isSubmitting}
                className="w-full min-h-[44px]"
              >
                {profileFormState.isSubmitting ? 'Menyimpan...' : 'Simpan Profile'}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password" className="p-6">
          <form id="password-form" onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="current_password">Password Saat Ini *</Label>
              <Input
                id="current_password"
                type="password"
                className="border-2 min-h-[44px]"
                {...registerPassword('current_password')}
              />
              {passwordFormState.errors.current_password && (
                <p className="text-sm text-red-600 mt-1">{passwordFormState.errors.current_password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="new_password">Password Baru *</Label>
              <Input
                id="new_password"
                type="password"
                placeholder="Minimal 6 karakter"
                className="border-2 min-h-[44px]"
                {...registerPassword('new_password')}
              />
              {passwordFormState.errors.new_password && (
                <p className="text-sm text-red-600 mt-1">{passwordFormState.errors.new_password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirm_password">Konfirmasi Password Baru *</Label>
              <Input
                id="confirm_password"
                type="password"
                placeholder="Ketik ulang password baru"
                className="border-2 min-h-[44px]"
                {...registerPassword('confirm_password')}
              />
              {passwordFormState.errors.confirm_password && (
                <p className="text-sm text-red-600 mt-1">{passwordFormState.errors.confirm_password.message}</p>
              )}
            </div>

            {/* Info */}
            <div className="border-2 border-yellow-100 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                <strong>Tips:</strong>
              </p>
              <ul className="text-sm text-yellow-700 list-disc list-inside mt-2 space-y-1">
                <li>Gunakan minimal 6 karakter</li>
                <li>Gabungkan huruf, angka, dan simbol</li>
                <li>Jangan gunakan password yang sama dengan akun lain</li>
              </ul>
            </div>

            {/* Submit */}
            <div>
              <Button
                type="submit"
                disabled={passwordFormState.isSubmitting}
                className="w-full min-h-[44px]"
              >
                {passwordFormState.isSubmitting ? 'Mengubah...' : 'Ganti Password'}
              </Button>
            </div>
          </form>
        </TabsContent>
        </div>
      </Tabs>
      </main>

      {/* Logout Confirmation Dialog - Only show when not embedded */}
      {!embedded && (
        <ConfirmDialog
          open={logoutDialogOpen}
          onOpenChange={setLogoutDialogOpen}
          title="Keluar dari Akun?"
          description="Apakah Anda yakin ingin keluar? Anda perlu login kembali untuk mengakses sistem."
          confirmLabel="Ya, Keluar"
          cancelLabel="Batal"
          variant="danger"
          onConfirm={handleLogout}
        />
      )}
    </div>
  )
}
