import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { UserDropdown } from '@/components/common/UserDropdown'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'
import { translateBackendError } from '@/lib/errorTranslation'

const getProfileSchema = (t: any) => z.object({
  name: z.string().min(1, t('validation.required')),
  email: z.string().email(t('validation.invalidEmail')),
  phone: z.string().optional(),
})

const getPasswordSchema = (t: any) => z.object({
  current_password: z.string().min(1, t('pages.profile.validation.currentPasswordRequired')),
  new_password: z.string().min(6, t('pages.profile.validation.newPasswordMin')),
  confirm_password: z.string().min(6, t('pages.profile.validation.confirmPasswordRequired')),
}).refine((data) => data.new_password === data.confirm_password, {
  message: t('pages.profile.validation.passwordMismatch'),
  path: ["confirm_password"],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

interface ProfilePageProps {
  embedded?: boolean
}

export function ProfilePage({ embedded = false }: ProfilePageProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const { toast } = useToast()
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')
  const [showPasswordBanner, setShowPasswordBanner] = useState(user?.is_default_password || false)

  // Create schemas with translation function
  const profileSchema = getProfileSchema(t)
  const passwordSchema = getPasswordSchema(t)

  // Check if navigation state contains activeTab
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab)
    }
  }, [location.state])

  // Check if user is parent or teacher (show banner only for these roles)
  const shouldShowPasswordBanner = showPasswordBanner &&
    (user?.role === 'parent' || user?.role === 'teacher') &&
    !embedded

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
        return t('teacher.dashboard')
      case 'parent':
        return t('parent.dashboard')
      case 'admin':
        return 'Dashboard Admin'
      default:
        return 'Dashboard'
    }
  }

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: profileFormState, reset: resetProfileForm } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    }
  })

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: passwordFormState, reset: resetPasswordForm } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      resetProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      })
    }
  }, [user, resetProfileForm])

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      await api.put('/profile', data)

      // Update user data in authStore
      updateUser({ name: data.name, email: data.email, phone: data.phone })

      toast({
        title: t('common.status.success'),
        description: t('messages.success.updated'),
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t('common.status.failed'),
        description: error.response?.data?.error || t('errors.failedToUpdate'),
      })
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      const response = await api.post('/profile/change-password', {
        current_password: data.current_password,
        new_password: data.new_password,
      })

      toast({
        title: t('common.status.success'),
        description: t('pages.profile.changePassword') + " " + t('messages.success.updated').toLowerCase(),
      })

      // Hide password banner after successful password change
      setShowPasswordBanner(false)

      // Reset form using react-hook-form's reset
      resetPasswordForm()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t('common.status.failed'),
        description: error.response?.data?.error || t('errors.failedToUpdate'),
      })
    }
  }

  return (
    <div className={embedded ? "bg-gray-50" : "min-h-screen bg-gray-50"}>
      {/* Header - hanya muncul kalau NOT embedded */}
      {!embedded && (
        <header className="border-b-2 border-border bg-white p-4">
          <div className="container mx-auto flex justify-between items-start max-w-7xl">
            <div className="flex-1">
              <button
                onClick={() => navigate(getDashboardUrl())}
                className="text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                {t('common.actions.back')} ke {getDashboardTitle()}
              </button>
              <h1 className="text-2xl font-bold">{t('pages.profile.title')}</h1>
              <p className="text-sm text-gray-600">{t('pages.profile.manageAccount')}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* User dropdown */}
              <UserDropdown user={user} />
            </div>
          </div>
        </header>
      )}

      {/* Password Change Notification Banner - Only for Parent and Teacher */}
      {shouldShowPasswordBanner && (
        <div className="border-2 border-yellow-300 bg-yellow-50">
          <div className="container mx-auto px-4 max-w-7xl py-3">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-yellow-700 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800 font-medium">
                  {t('pages.profile.passwordBanner.title')}
                </p>
                <p className="text-xs text-yellow-700 mt-1 whitespace-nowrap">
                  {t('pages.profile.passwordBanner.message')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('password')}
                  className="px-3 py-1.5 bg-yellow-600 text-white text-sm hover:bg-yellow-700 min-h-[36px] min-w-[36px] border-2 border-yellow-700"
                >
                  {t('pages.profile.changePassword')}
                </button>
                <button
                  onClick={() => setShowPasswordBanner(false)}
                  className="p-1.5 text-yellow-700 hover:bg-yellow-200 min-h-[36px] min-w-[36px] border-2 border-yellow-300"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={embedded ? "py-6 px-4" : "container mx-auto py-6 px-4 max-w-2xl"}>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'profile' | 'password')}>
        {/* Main Container with border */}
        <div className="border-2 border-border bg-white">
          <TabsList className="grid w-full grid-cols-2 border-b-2 border-border h-13 p-2 min-h-[60px]">
            <TabsTrigger value="profile" className="min-h-[44px] text-center">
              {t('pages.profile.title')}
            </TabsTrigger>
            <TabsTrigger value="password" className="min-h-[44px] text-center">
              {t('pages.profile.changePassword')}
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
                  {user?.role === 'admin' && t('roles.admin')}
                  {user?.role === 'teacher' && t('roles.teacher')}
                  {user?.role === 'parent' && t('roles.parent')}
                </Badge>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">{t('forms.labels.fullName')}</Label>
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
              <Label htmlFor="email">{t('forms.labels.email')}</Label>
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
              <Label htmlFor="phone">{t('forms.labels.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder={t('pages.profile.phonePlaceholder')}
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
                {profileFormState.isSubmitting ? t('common.status.processing') : t('pages.profile.saveProfile')}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password" className="p-6">
          <form id="password-form" onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="current_password">{t('pages.profile.currentPassword')} *</Label>
              <PasswordInput
                id="current_password"
                className="border-2 min-h-[44px]"
                {...registerPassword('current_password')}
              />
              {passwordFormState.errors.current_password && (
                <p className="text-sm text-red-600 mt-1">{passwordFormState.errors.current_password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="new_password">{t('pages.profile.newPassword')} *</Label>
              <PasswordInput
                id="new_password"
                placeholder={t('pages.profile.passwordPlaceholder')}
                className="border-2 min-h-[44px]"
                {...registerPassword('new_password')}
              />
              {passwordFormState.errors.new_password && (
                <p className="text-sm text-red-600 mt-1">{passwordFormState.errors.new_password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirm_password">{t('pages.profile.confirmPassword')} *</Label>
              <PasswordInput
                id="confirm_password"
                placeholder={t('pages.profile.confirmPasswordPlaceholder')}
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
                <strong>{t('pages.profile.tips.title')}:</strong>
              </p>
              <ul className="text-sm text-yellow-700 list-disc list-inside mt-2 space-y-1">
                <li>{t('pages.profile.tips.minLength')}</li>
                <li>{t('pages.profile.tips.complexity')}</li>
                <li>{t('pages.profile.tips.unique')}</li>
              </ul>
            </div>

            {/* Submit */}
            <div>
              <Button
                type="submit"
                disabled={passwordFormState.isSubmitting}
                className="w-full min-h-[44px]"
              >
                {passwordFormState.isSubmitting ? t('common.status.processing') : t('pages.profile.changePassword')}
              </Button>
            </div>
          </form>
        </TabsContent>
        </div>
      </Tabs>
      </main>
    </div>
  )
}
