import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Save, Building, Mail, Phone, MapPin, Calendar, Upload, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { settingsApi, usersApi } from '@/lib/api'
import { UserCombobox } from '@/components/admin/UserCombobox'

interface SchoolSettings {
  name: string
  logo_url: string
  address: string
  phone: string
  email: string
  academic_year: string
}

interface ResetPasswordState {
  selectedUserId: string
  newPassword: string
  loading: boolean
}

export function SettingsPage() {
  const { t } = useTranslation()
  const { toast } = useToast()

  const [settings, setSettings] = useState<SchoolSettings>({
    name: 'Hafalan Tracker School',
    logo_url: '',
    address: '',
    phone: '',
    email: '',
    academic_year: '2025/2026'
  })

  const [resetPassword, setResetPassword] = useState<ResetPasswordState>({
    selectedUserId: '',
    newPassword: '',
    loading: false
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [users, setUsers] = useState<any[]>([])

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        const data = await settingsApi.get()
        setSettings({
          name: data.school_name,
          logo_url: data.school_logo || '',
          address: data.school_address || '',
          phone: data.school_phone || '',
          email: data.school_email || '',
          academic_year: data.academic_year
        })
        if (data.school_logo) {
          setLogoPreview(data.school_logo)
        }
      } catch (error) {
        // Error handled by toast
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Load users for password reset
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true)
        const data = await usersApi.getAll()
        setUsers(data)
      } catch (error) {
        // Error handled by toast
      } finally {
        setLoadingUsers(false)
      }
    }

    loadUsers()
  }, [])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      await settingsApi.update({
        school_name: settings.name,
        school_address: settings.address || undefined,
        school_phone: settings.phone || undefined,
        school_email: settings.email || undefined,
        academic_year: settings.academic_year
      })

      toast({
        title: "Berhasil",
        description: "Pengaturan sekolah berhasil disimpan"
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.error || error.message || "Gagal menyimpan pengaturan"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async () => {
    if (!resetPassword.selectedUserId) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Pilih user terlebih dahulu"
      })
      return
    }

    if (!resetPassword.newPassword || resetPassword.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Password minimal 6 karakter"
      })
      return
    }

    setResetPassword(prev => ({ ...prev, loading: true }))
    try {
      await settingsApi.resetUserPassword(resetPassword.selectedUserId)

      const user = users.find(u => u.id === resetPassword.selectedUserId)

      toast({
        title: "Berhasil",
        description: `Password ${user?.name || 'User'} berhasil direset`
      })

      setResetPassword({
        selectedUserId: '',
        newPassword: '',
        loading: false
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.error || error.message || "Gagal mereset password"
      })
      setResetPassword(prev => ({ ...prev, loading: false }))
    }
  }

  const academicYears = [
    '2024/2025',
    '2025/2026',
    '2026/2027',
    '2027/2028'
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-gray-600">Konfigurasi sistem dan sekolah</p>
      </div>

      <div className="space-y-6">
        {/* School Information */}
        <div className="border-2 border-border bg-white p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building size={20} />
            Informasi Sekolah
          </h2>

          <div className="space-y-6">
            {/* Logo Upload */}
            <div>
              <Label htmlFor="logo">Logo Sekolah</Label>
              <div className="flex gap-4 mt-2">
                <div className="w-32 h-32 border-2 border-border bg-gray-50 flex items-center justify-center">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full" />
                  ) : settings.logo_url ? (
                    <img src={settings.logo_url} alt="School logo" className="max-w-full max-h-full" />
                  ) : (
                    <Building size={40} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="border-2"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Format: PNG, JPG. Max size: 2MB. Recommended: 200x200px
                  </p>
                </div>
              </div>
            </div>

            {/* School Name */}
            <div>
              <Label htmlFor="name">Nama Sekolah *</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                className="border-2 min-h-[44px]"
                placeholder="Masukkan nama sekolah"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email Sekolah</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10 border-2 min-h-[44px]"
                  placeholder="info@sekolah.sch.id"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">No Telepon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="phone"
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                  className="pl-10 border-2 min-h-[44px]"
                  placeholder="021-12345678"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">Alamat</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                  className="flex w-full rounded-none border-2 border-input bg-transparent px-3 py-2 text-base min-h-[80px] pl-10"
                  placeholder="Jalan Pendidikan No. 1, Jakarta"
                  rows={3}
                />
              </div>
            </div>

            {/* Academic Year */}
            <div>
              <Label htmlFor="academic_year">Tahun Ajaran</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <select
                  id="academic_year"
                  value={settings.academic_year}
                  onChange={(e) => setSettings(prev => ({ ...prev, academic_year: e.target.value }))}
                  className="flex w-full rounded-none border-2 border-input bg-transparent px-3 py-2 text-base min-h-[44px] pl-10"
                >
                  {academicYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveSettings}
                disabled={saving}
                className="min-h-[44px] min-w-[44px]"
              >
                <Save size={20} className="mr-2" />
                {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </Button>
            </div>
          </div>
        </div>

        {/* Password Reset */}
        <div className="border-2 border-border bg-white p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <RefreshCw size={20} />
            Reset Password User
          </h2>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Reset password user ke default. User akan menerima email notifikasi.
            </p>

            {/* Select User */}
            <div>
              <Label>Pilih User untuk Reset Password</Label>
              {loadingUsers ? (
                <div className="border-2 border-border bg-gray-50 p-4 text-center min-h-[44px] flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-primary"></div>
                    <span className="text-sm text-gray-600">Memuat data user...</span>
                  </div>
                </div>
              ) : users.length === 0 ? (
                <div className="border-2 border-border bg-gray-50 p-4 text-center min-h-[44px] flex items-center justify-center">
                  <span className="text-sm text-gray-500">Tidak ada user tersedia</span>
                </div>
              ) : (
                <UserCombobox
                  users={users}
                  value={resetPassword.selectedUserId}
                  onChange={(value) => setResetPassword(prev => ({ ...prev, selectedUserId: value }))}
                  placeholder="Cari dan pilih user..."
                />
              )}
              {resetPassword.selectedUserId && (
                <p className="text-xs text-gray-600 mt-2">
                  User terpilih: <strong>{users.find(u => u.id === resetPassword.selectedUserId)?.name}</strong>
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="border-2 border-blue-100 bg-blue-50 p-4">
              <p className="text-sm text-blue-800 font-medium">Informasi:</p>
              <ul className="text-sm text-blue-700 list-disc list-inside mt-2 space-y-1">
                <li>Password akan direset ke default: <strong>password123</strong></li>
                <li>User akan mendapatkan email notifikasi</li>
                <li>User harus mengganti password pada login pertama</li>
                <li>Reset password akan menghapus password lama</li>
              </ul>
            </div>

            {/* Reset Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleResetPassword}
                disabled={resetPassword.loading || !resetPassword.selectedUserId}
                variant="destructive"
                className="min-h-[44px] min-w-[44px]"
              >
                <RefreshCw size={20} className="mr-2" />
                {resetPassword.loading ? 'Mereset...' : 'Reset Password'}
              </Button>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="border-2 border-border bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Informasi Sistem</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-gray-600">Versi Aplikasi</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-gray-600">Environment</span>
              <span className="font-medium">Development</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-gray-600">Database</span>
              <span className="font-medium">PostgreSQL 15</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Last Update</span>
              <span className="font-medium">{new Date().toLocaleDateString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
