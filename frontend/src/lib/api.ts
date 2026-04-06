import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  // Try to get token from auth-storage first (Zustand persistence)
  const authStorage = localStorage.getItem('auth-storage')
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage)
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`
        return config
      }
    } catch (e) {
      // Continue to next method
    }
  }

  // Fallback to direct token storage
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API response types
export interface ApiResponse<T> {
  data: T
  error?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export interface Student {
  id: string
  name: string
  class_id: string
  class_name?: string
  parent_1_id: string
  parent_1_name?: string
  parent_2_id?: string
  parent_2_name?: string
  birth_date?: string
  phone?: string
  photo_url?: string
  progress?: {
    total_units: number
    completed: number
    percent: number
  }
}

export interface Teacher {
  UserID: string
  FullName: string
  Phone: string
  Email: string
  CreatedAt: string
}

export interface Parent {
  UserID: string
  FullName: string
  Phone: string
  Email: string
  CreatedAt: string
}

export interface Class {
  id: string
  name: string
  grade_level: string
  homeroom_teacher_id: string | null
  teacher_name: string | null
  students_count: number
  created_at: string
  updated_at: string
}

export interface Memorization {
  id: string
  student_id: string
  student_name?: string
  teacher_id: string
  teacher_name?: string
  date: string
  unit: string
  unit_type: 'juz' | 'surah' | 'page'
  status: 'fluent' | 'good' | 'needs_improvement'
  notes?: string
  created_at: string
}

export interface DashboardStats {
  total_students: number
  total_teachers: number
  total_parents: number
  total_memorizations: number
}

export interface Settings {
  id?: number
  school_name: string
  school_logo?: string
  school_address?: string
  school_phone?: string
  school_email?: string
  academic_year: string
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: string
}

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/public/login', credentials)
    return response.data
  },

  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth-storage')
  },
}

// Students API
export const studentsApi = {
  getAll: async (search?: string): Promise<Student[]> => {
    const params = search ? { search } : {}
    const response = await api.get<Student[]>('/students', { params })
    return response.data
  },

  getById: async (id: string): Promise<Student> => {
    const response = await api.get<Student>(`/students/${id}`)
    return response.data
  },

  create: async (data: Partial<Student>): Promise<Student> => {
    const response = await api.post<Student>('/students', data)
    return response.data
  },

  update: async (id: string, data: Partial<Student>): Promise<Student> => {
    const response = await api.put<Student>(`/students/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/students/${id}`)
  },
}

// Teachers API
export const teachersApi = {
  getAll: async (search?: string): Promise<Teacher[]> => {
    const params = search ? { search } : {}
    const response = await api.get<Teacher[]>('/teachers', { params })
    return response.data
  },

  getById: async (id: string): Promise<Teacher> => {
    const response = await api.get<Teacher>(`/teachers/${id}`)
    return response.data
  },

  create: async (data: Partial<Teacher> & { password?: string }): Promise<Teacher> => {
    const response = await api.post<Teacher>('/teachers', data)
    return response.data
  },

  update: async (id: string, data: Partial<Teacher>): Promise<Teacher> => {
    const response = await api.put<Teacher>(`/teachers/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/teachers/${id}`)
  },
}

// Parents API
export const parentsApi = {
  getAll: async (search?: string): Promise<Parent[]> => {
    const params = search ? { search } : {}
    const response = await api.get<Parent[]>('/parents', { params })
    return response.data
  },

  getById: async (id: string): Promise<Parent> => {
    const response = await api.get<Parent>(`/parents/${id}`)
    return response.data
  },

  create: async (data: Partial<Parent> & { password?: string }): Promise<Parent> => {
    const response = await api.post<Parent>('/parents', data)
    return response.data
  },

  update: async (id: string, data: Partial<Parent>): Promise<Parent> => {
    const response = await api.put<Parent>(`/parents/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/parents/${id}`)
  },

  getMyChildren: async (): Promise<Student[]> => {
    const response = await api.get<Student[]>('/parents/me/children')
    return response.data
  },

  getChildProgress: async (childId: string): Promise<Student & { memorizations: Memorization[] }> => {
    const response = await api.get(`/parents/me/children/${childId}`)
    return response.data
  },
}

// Classes API
export const classesApi = {
  getAll: async (search?: string): Promise<Class[]> => {
    const params = search ? { search } : {}
    const response = await api.get<Class[]>('/classes', { params })
    return response.data
  },

  getById: async (id: string): Promise<Class> => {
    const response = await api.get<Class>(`/classes/${id}`)
    return response.data
  },

  create: async (data: Partial<Class>): Promise<Class> => {
    const response = await api.post<Class>('/classes', data)
    return response.data
  },

  update: async (id: string, data: Partial<Class>): Promise<Class> => {
    const response = await api.put<Class>(`/classes/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/classes/${id}`)
  },
}

// Memorizations API
export const memorizationsApi = {
  getAll: async (): Promise<Memorization[]> => {
    const response = await api.get<Memorization[]>('/memorizations')
    return response.data
  },

  getById: async (id: string): Promise<Memorization> => {
    const response = await api.get<Memorization>(`/memorizations/${id}`)
    return response.data
  },

  create: async (data: Partial<Memorization>): Promise<Memorization> => {
    const response = await api.post<Memorization>('/memorizations', data)
    return response.data
  },

  update: async (id: string, data: Partial<Memorization>): Promise<Memorization> => {
    const response = await api.put<Memorization>(`/memorizations/${id}`, data)
    return response.data
  },

  getByStudent: async (studentId: string): Promise<Memorization[]> => {
    const response = await api.get<Memorization[]>(`/students/${studentId}/memorizations`)
    return response.data
  },
}

// Teacher API
export const teacherApi = {
  getMyStudents: async (): Promise<Student[]> => {
    const response = await api.get<Student[]>('/teachers/me/students')
    return response.data
  },

  getStudentProgress: async (studentId: string): Promise<Student & { memorizations: Memorization[] }> => {
    const response = await api.get(`/teachers/me/students/${studentId}/progress`)
    return response.data
  },
}

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard/stats')
    return response.data
  },
}

// Settings API
export const settingsApi = {
  get: async (): Promise<Settings> => {
    const response = await api.get<Settings>('/settings')
    return response.data
  },

  update: async (data: Partial<Settings>): Promise<Settings> => {
    const response = await api.put<Settings>('/settings', data)
    return response.data
  },

  resetUserPassword: async (userId: string): Promise<void> => {
    await api.post('/settings/reset-password', { user_id: userId })
  },

  uploadLogo: async (file: File): Promise<{ logo_url: string }> => {
    const formData = new FormData()
    formData.append('logo', file)
    const response = await api.post<{ logo_url: string }>('/settings/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}

// Profile API
export const profileApi = {
  get: async (): Promise<User> => {
    const response = await api.get<User>('/profile')
    return response.data
  },

  update: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<User>('/profile', data)
    return response.data
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/profile/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
  },
}

// Users API (Admin only)
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users')
    return response.data
  },
}

export default api
