import { LoginForm } from '@/components/auth/LoginForm'
import { useTranslation } from 'react-i18next'

export function LoginPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Login container - SOLID BORDER, NO SHADOW, SHARP EDGES */}
        <div className="border-2 border-border bg-white p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">{t('app.name')}</h1>
            <p className="text-sm text-gray-600 mt-2">
              {t('app.tagline')}
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
