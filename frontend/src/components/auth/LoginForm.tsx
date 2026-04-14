import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAuthStore } from '@/stores/authStore'

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter')
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { login, isAuthenticated, user, error, clearError } = useAuthStore()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    clearError()
    try {
      await login(data.email, data.password)

      toast({
        title: t('auth.loginSuccess'),
        description: "Login berhasil!",
      })

      // Redirect based on role
      const redirectMap: Record<string, string> = {
        admin: '/admin/dashboard',
        teacher: '/teacher/dashboard',
        parent: '/parent/dashboard'
      }

      setTimeout(() => {
        const currentUser = useAuthStore.getState().user
        window.location.href = redirectMap[currentUser?.role || 'admin'] || '/admin/dashboard'
      }, 500)

    } catch (err: any) {
      // Error is already handled in the store
      if (error) {
        toast({
          variant: "destructive",
          title: t('auth.loginError'),
          description: error,
        })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">{t('auth.email')}</Label>
        <Input
          id="email"
          type="email"
          placeholder="nama@email.com"
          className="border-2 border-input focus:border-2 focus:border-ring min-h-[44px]"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">{t('auth.password')}</Label>
        <PasswordInput
          id="password"
          placeholder="******"
          className="border-2 border-input focus:border-2 focus:border-ring min-h-[44px]"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full min-h-[44px]"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Memproses...' : t('auth.login')}
      </Button>

      {error && (
        <div className="p-3 border-2 border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}
    </form>
  )
}
