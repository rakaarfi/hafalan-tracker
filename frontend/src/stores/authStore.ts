import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/lib/api'

interface User {
  id: string
  email: string
  role: 'admin' | 'teacher' | 'parent'
  name?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  setAuth: (user: User, token: string) => void
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null, // Kept for compatibility but not used with httpOnly cookies
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authApi.login({ email, password })
          set({
            user: response.user,
            token: 'cookie', // Token stored in httpOnly cookie
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.error || 'Login failed. Please check your credentials.',
          })
          throw error
        }
      },
      setAuth: (user, token) => set({
        user,
        token: token || 'cookie',
        isAuthenticated: true
      }),
      logout: async () => {
        await authApi.logout()
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },
      clearError: () => set({ error: null }),
    }),
    { name: 'auth-storage' }
  )
)
