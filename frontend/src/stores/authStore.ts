import { create } from 'zustand'
import { authApi } from '@/lib/api'

export interface User {
  id: string
  email: string
  role: string  // Backend returns loose string, not strict union type
  name?: string
  phone?: string
}

interface AuthState {
  user: User | null
  token: string | null  // Kept for backward compatibility, always "cookie" when authenticated
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  checkAuth: () => Promise<void>
  setAuth: (user: User, token: string) => void
  updateUser: (userData: Partial<User>) => void
  logout: () => Promise<void>
  clearError: () => void
  clearAuth: () => void  // Clear auth state without API call (for 401 handling)
}

export const useAuthStore = create<AuthState>()((set) => ({
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
        token: null, // Token is in httpOnly cookie, not stored
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
  checkAuth: async () => {
    set({ isLoading: true, error: null })
    try {
      const user = await authApi.getCurrentUser()
      set({
        user,
        token: null, // Token is in httpOnly cookie
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      // Not authenticated - clear state
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  },
  setAuth: (user, token) => set({
    user,
    token: null, // Token is in httpOnly cookie
    isAuthenticated: true
  }),
  updateUser: (userData) => set((state) => ({
    user: state.user ? { ...state.user, ...userData } : null
  })),
  logout: async () => {
    await authApi.logout()
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    })
  },
  clearAuth: () => set({
    user: null,
    token: null,
    isAuthenticated: false,
    error: null,
  }),
  clearError: () => set({ error: null }),
}))
