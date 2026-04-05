# Frontend Implementation Plan (REVISED)

> **Based on:** `docs/design.md` - User Experience Requirements  
> **Goal:** Build complete frontend UI following specific design guidelines

## 🎨 **CRITICAL DESIGN REQUIREMENTS**

### **UI Design Principles (from design.md):**
- ✅ **Solid colors, NO gradients**
- ✅ **Sharp corners** (NO rounded corners: `rounded-none`, `rounded-0`)
- ✅ **Simple, clean design**
- ✅ **Mobile-first responsive**
- ✅ **Touch targets ≥44px**
- ✅ **NO cards with shadows** → Use solid borders instead

### **Component Specifications:**
- ✅ **Container divs** with solid borders (1px, `border-gray-200`)
- ✅ **Searchable Combobox** for Quran selection (NOT basic dropdown)
- ✅ **Badge** components for status indicators
- ✅ **Button** variants: Primary, Secondary, Ghost
- ✅ **Input** with validation feedback

---

## **Tech Stack:**
- React 18, TypeScript, Vite, Bun
- React Router v6, Zustand, React Hook Form + Zod
- shadcn/ui components (MODIFIED per design reqs)
- Tailwind CSS (with custom utilities)
- i18next (English/Indonesian)
- Axios for API calls

---

## Task 1: Setup Shadcn/ui with Custom Design System

**Files:**
- Update: `frontend/components.json`
- Create: `frontend/tailwind.config.js` (custom design system)
- Create: `frontend/src/components/ui/` (shadcn components)
- Create: `frontend/src/App.tsx` with router structure

**Step 1: Initialize shadcn/ui**
```bash
cd frontend
bunx shadcn-ui@latest init
```

Choose options:
- Style: New York
- Base color: Slate
- CSS variables: Yes

**Step 2: Create custom Tailwind config**

Create `frontend/tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // CRITICAL: No rounded corners per design requirements
      borderRadius: {
        NONE: "0",
        sm: "0",
        md: "0", 
        lg: "0",
        xl: "0",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--background))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

**Step 3: Add required shadcn components**
```bash
bunx shadcn-ui@latest add button
bunx shadcn-ui@latest add input
bunx shadcn-ui@latest add label
bunx shadcn-ui@latest add form
bunx shadcn-ui@latest add select
bunx shadcn-ui@latest add badge
bunx shadcn-ui@latest add toast
```

**Step 4: Modify Button component for sharp corners**

Update `frontend/src/components/ui/button.tsx`:
```typescript
// Add variant for solid borders, no shadows, sharp corners
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-0 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      // ... existing variants ...
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      // Remove shadow from all variants
    },
  }
)
```

**Step 5: Setup React Router**

Create `frontend/src/App.tsx`:
```typescript
import { BrowserRouter } from 'react-router-dom'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 border-x border-border">
        <Routes>
          <Route path="/" element={<div>Landing Page</div>} />
          <Route path="/login" element={<div>Login Page</div>} />
          
          {/* Protected Routes */}
          <Route 
            path="/teacher/*" 
            element={isAuthenticated ? <div>Teacher Dashboard</div> : <Navigate to="/login" />} 
          />
          <Route 
            path="/parent/*" 
            element={isAuthenticated ? <div>Parent Dashboard</div> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
```

**Commit:**
```bash
git add frontend/
git commit -m "feat(frontend): setup shadcn/ui with sharp edges design system

- Custom Tailwind config with NO rounded corners
- Button components modified for sharp edges
- Solid borders instead of shadows
- React Router setup with protected routes
- Design system follows user requirements: solid colors, no gradients"
```

---

## Task 2: Create Quran Combobox Component

**Design Requirement:** Structured dropdown + searchable combobox

**Files:**
- Create: `frontend/src/components/quran/QuranCombobox.tsx`
- Create: `frontend/src/lib/quran-data.ts`

**Step 1: Create Quran data helper**

Create `frontend/src/lib/quran-data.ts`:
```typescript
export interface SurahOption {
  value: string
  label: string
  number: number
  juz: number
  arabic: string
}

export interface JuzOption {
  value: string
  label: string
  number: number
}

export const surahOptions: SurahOption[] = []
// Will be populated from API

export async function loadQuranData() {
  // Fetch from API
  const response = await fetch('/api/v1/surah')
  const data = await response.json()
  return data
}
```

**Step 2: Create searchable combobox**

Create `frontend/src/components/quran/QuranCombobox.tsx`:
```typescript
import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface QuranComboboxProps {
  mode: 'surah' | 'juz' | 'page'
  value: string
  onChange: (value: string) => void
}

export function QuranCombobox({ mode, value, onChange }: QuranComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  // Filter options based on search
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(search.toLowerCase()) ||
    option.arabic.includes(search)
  )

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(!open)}
        className="w-full justify-between border-2"
      >
        {value || `Select ${mode}...`}
        <span className="ml-2">▼</span>
      </Button>

      {open && (
        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-border">
          {/* Search input */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4" />
              <Input
                placeholder={`Search ${mode}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 border-0 focus-visible:ring-0"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 border-0"
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-gray-600">{option.arabic}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

**Commit:**
```bash
git add frontend/src/
git commit -m "feat(frontend): create searchable Quran combobox component

- Custom combobox with sharp edges and solid borders
- Search functionality for surah/juz selection
- Displays both Latin and Arabic names
- Mobile-friendly with proper touch targets
- Follows design requirements: no gradients, solid colors"
```

---

## Task 3: Setup State Management with Zustand

**Files:**
- Create: `frontend/src/stores/authStore.ts`
- Create: `frontend/src/stores/uiStore.ts`

**Step 1: Create authentication store**

Create `frontend/src/stores/authStore.ts`:
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true 
      }),
      logout: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false 
      }),
    }),
    { name: 'auth-storage' }
  )
)
```

**Step 2: Create UI store**

Create `frontend/src/stores/uiStore.ts`:
```typescript
import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  currentLanguage: 'en' | 'id'
  toggleSidebar: () => void
  setLanguage: (lang: 'en' | 'id') => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  currentLanguage: 'id', // Default to Indonesian
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),
  setLanguage: (lang) => set({ currentLanguage: lang }),
}))
```

**Commit:**
```bash
git add frontend/src/stores/
git commit -m "feat(frontend): setup Zustand stores for auth and UI state

- Auth store with JWT token management
- UI store for language switching (EN/ID)
- Persist auth state to localStorage
- Default language set to Indonesian"
```

---

## Task 4: Setup i18next for Internationalization

**Files:**
- Create: `frontend/src/i18n.ts`
- Create: `frontend/src/locales/en.json`
- Create: `frontend/src/locales/id.json`

**Step 1: Configure i18next**

Create `frontend/src/i18n.ts`:
```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import id from './locales/id.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      id: { translation: id }
    },
    lng: 'id', // Default to Indonesian
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  })

export default i18n
```

**Step 2: Create Indonesian translation (PRIMARY)**

Create `frontend/src/locales/id.json`:
```json
{
  "app": {
    "name": "Pendekatan Hafalan",
    "tagline": "Pantau perkembangan hafalan Quran"
  },
  "auth": {
    "login": "Masuk",
    "email": "Email",
    "password": "Kata Sandi",
    "loginSuccess": "Berhasil masuk",
    "loginError": "Gagal masuk"
  },
  "teacher": {
    "dashboard": "Dashboard Guru",
    "studentList": "Daftar Murid",
    "inputHafalan": "Input Hafalan",
    "selectStudent": "Pilih Murid",
    "unitType": "Tipe Unit",
    "surah": "Surah",
    "juz": "Juz",
    "page": "Halaman",
    "status": "Status",
    "notes": "Catatan",
    "testDate": "Tanggal Tes",
    "submit": "Simpan",
    "status": {
      "fluent": "Lancar",
      "good": "Cukup",
      "needs_improvement": "Perlu Perbaikan"
    }
  },
  "parent": {
    "dashboard": "Progress Anak",
    "childProgress": "Progress Hafalan",
    "lastTest": "Tes Terakhir",
    "overallProgress": "Progress Total",
    "recentTests": "Tes Terakhir"
  }
}
```

**Step 3: Create English translation**

Create `frontend/src/locales/en.json`:
```json
{
  "app": {
    "name": "Hafalan Tracker",
    "tagline": "Track Quran memorization progress"
  },
  "auth": {
    "login": "Login",
    "email": "Email",
    "password": "Password",
    "loginSuccess": "Login successful",
    "loginError": "Login failed"
  },
  "teacher": {
    "dashboard": "Teacher Dashboard",
    "studentList": "Student List",
    "inputHafalan": "Input Memorization",
    "selectStudent": "Select Student",
    "unitType": "Unit Type",
    "surah": "Surah",
    "juz": "Juz",
    "page": "Page",
    "status": "Status",
    "notes": "Notes",
    "testDate": "Test Date",
    "submit": "Submit",
    "status": {
      "fluent": "Fluent",
      "good": "Good",
      "needs_improvement": "Needs Improvement"
    }
  },
  "parent": {
    "dashboard": "Children's Progress",
    "childProgress": "Memorization Progress",
    "lastTest": "Last Test",
    "overallProgress": "Overall Progress",
    "recentTests": "Recent Tests"
  }
}
```

**Commit:**
```bash
git add frontend/src/i18n.ts frontend/src/locales/
git commit -m "feat(frontend): setup i18next for Indonesian/English

- Indonesian as primary language (default)
- English as secondary language
- All UI text prepared for i18n
- Language switcher ready to implement
- Translation covers all major features"
```

---

## Task 5: Create Login Page with Sharp Edges Design

**Files:**
- Create: `frontend/src/pages/LoginPage.tsx`
- Create: `frontend/src/components/auth/LoginForm.tsx`
- Create: `frontend/src/lib/api.ts`

**Step 1: Create API client**

Create `frontend/src/lib/api.ts`:
```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage')
  if (token) {
    const { token: authToken } = JSON.parse(token)
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`
    }
  }
  return config
})

export default api
```

**Step 2: Create login page with sharp edges**

Create `frontend/src/pages/LoginPage.tsx`:
```typescript
import { LoginForm } from '@/components/auth/LoginForm'

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Login container - SOLID BORDER, NO SHADOW, SHARP EDGES */}
        <div className="border-2 border-border bg-white p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Pendekatan Hafalan</h1>
            <p className="text-sm text-gray-600 mt-2">
              Login untuk melanjutkan
            </p>
          </div>
          
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Create login form with Zod validation**

Create `frontend/src/components/auth/LoginForm.tsx`:
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter')
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const { toast } = useToast()
  const { setAuth } = useAuthStore()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await api.post('/public/login', data)
      const { token, user } = response.data
      
      setAuth(user, token)
      toast({
        title: "Berhasil",
        description: "Login berhasil!",
      })
      
      // Redirect based on role
      const redirectMap = {
        teacher: '/teacher/dashboard',
        parent: '/parent/dashboard',
        admin: '/admin/dashboard'
      }
      window.location.href = redirectMap[user.role] || '/dashboard'
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.error || "Login gagal",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="nama@email.com"
          className="border-2 border-input focus:border-2 focus:border-ring"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="password">Kata Sandi</Label>
        <Input
          id="password"
          type="password"
          placeholder="******"
          className="border-2 border-input focus:border-2 focus:border-ring"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
        )}
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Memproses...' : 'Masuk'}
      </Button>
    </form>
  )
}
```

**Commit:**
```bash
git add frontend/src/
git commit -m "feat(frontend): create login page with sharp edges design

- Login page with solid borders, NO shadows, sharp corners
- Form validation with Zod schemas
- Email/password fields with inline error messages
- Toast notifications for success/error feedback
- Role-based redirect after successful login
- Mobile-friendly with proper spacing and touch targets
- Follows design requirements: solid colors, simple design"
```

---

## Task 6: Create Teacher Dashboard with List View

**Design Requirement:** Hybrid approach - list view → tap to drill down

**Files:**
- Create: `frontend/src/pages/TeacherDashboard.tsx`
- Create: `frontend/src/components/teacher/StudentList.tsx`
- Create: `frontend/src/components/teacher/StudentListItem.tsx`

**Step 1: Create student list item component**

Create `frontend/src/components/teacher/StudentListItem.tsx`:
```typescript
import { Badge } from '@/components/ui/badge'

interface StudentListItemProps {
  student: {
    id: string
    name: string
    class_name: string
    last_test_date: string
    last_status: string
  }
  }

export function StudentListItem({ student }: StudentListItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fluent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-yellow-100 text-yellow-800'
      case 'needs_improvement': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <button
      onClick={() => window.location.href = `/teacher/students/${student.id}`}
      className="w-full text-left p-4 border-2 border-border hover:border-primary transition-colors"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{student.name}</h3>
          <p className="text-sm text-gray-600">{student.class_name}</p>
          <p className="text-xs text-gray-500 mt-1">
            Terakhir: {student.last_test_date}
          </p>
        </div>
        <Badge className={getStatusColor(student.last_status)}>
          {student.last_status}
        </Badge>
      </div>
    </button>
  )
}
```

**Step 2: Create student list component**

Create `frontend/src/components/teacher/StudentList.tsx`:
```typescript
import { StudentListItem } from './StudentListItem'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function StudentList({ students }: { students: any[] }) {
  const [search, setSearch] = useState('')

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="border-2 border-border bg-white">
      {/* Search bar */}
      <div className="p-4 border-b-2 border-border">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4" />
          <Input
            placeholder="Cari murid..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-2"
          />
        </div>
      </div>

      {/* Student list - LIST VIEW for hybrid approach */}
      <div className="divide-y-2 divide-border">
        {filteredStudents.map((student) => (
          <StudentListItem key={student.id} student={student} />
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          Tidak ada murid ditemukan
        </div>
      )}
    </div>
  )
}
```

**Step 3: Create teacher dashboard**

Create `frontend/src/pages/TeacherDashboard.tsx`:
```typescript
import { StudentList } from '@/components/teacher/StudentList'
import { useAuthStore } from '@/stores/authStore'

export function TeacherDashboard() {
  const { user } = useAuthStore()

  // Mock data - will fetch from API
  const students = [
    {
      id: '1',
      name: 'Ahmad Fauzi',
      class_name: 'Kelas 6A',
      last_test_date: '2026-04-01',
      last_status: 'fluent'
    },
    {
      id: '2', 
      name: 'Siti Aminah',
      class_name: 'Kelas 6A',
      last_test_date: '2026-04-03',
      last_status: 'good'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - SOLID BORDER, NO SHADOW */}
      <header className="border-b-2 border-border bg-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Guru</h1>
            <p className="text-sm text-gray-600">Selamat datang, {user?.name}</p>
          </div>
          <button 
            onClick={() => useAuthStore.getState().logout()}
            className="px-4 py-2 border-2 border-border hover:bg-gray-50"
          >
            Keluar
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto py-6 px-4">
        <h2 className="text-xl font-semibold mb-4">Daftar Murid</h2>
        
        {/* LIST VIEW - tap to drill down */}
        <StudentList students={students} />
      </main>
    </div>
  )
}
```

**Commit:**
```bash
git add frontend/src/
git commit -m "feat(frontend): create teacher dashboard with list view

- Teacher dashboard with header (solid border, no shadow)
- LIST VIEW for students - tap to drill down to detail
- Search functionality for filtering students
- Student list item with status badge and last test info
- Mobile-friendly list with proper touch targets (≥44px)
- Hybrid approach: list view → detail view
- Follows design requirements: sharp edges, solid colors, simple design"
```

---

## Task 7: Create Student Detail & Input Form

**Files:**
- Create: `frontend/src/pages/StudentDetailPage.tsx`
- Create: `frontend/src/components/teacher/HafalanInputForm.tsx`
- Update: `frontend/src/components/quran/QuranCombobox.tsx`

**Step 1: Create hafalan input form**

Create `frontend/src/components/teacher/HafalanInputForm.tsx`:
```typescript
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { QuranCombobox } from '@/components/quran/QuranCombobox'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import api from '@/lib/api'

const hafalanSchema = z.object({
  unit_type: z.enum(['surah', 'page', 'juz']),
  surah_id: z.string().optional(),
  juz_id: z.string().optional(),
  page_start: z.number().min(1).max(604).optional(),
  page_end: z.number().min(1).max(604).optional(),
  status: z.enum(['fluent', 'good', 'needs_improvement']),
  notes: z.string().max(500).optional(),
  test_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
})

type HafalanFormData = z.infer<typeof hafalanSchema>

export function HafalanInputForm({ studentId }: { studentId: string }) {
  const { toast } = useToast()
  const [unitType, setUnitType] = useState<'surah' | 'page' | 'juz'>('surah')
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<HafalanFormData>({
    resolver: zodResolver(hafalanSchema),
    defaultValues: {
      unit_type: 'surah',
      test_date: new Date().toISOString().split('T')[0]
    }
  })

  const watchedUnitType = watch('unit_type')

  const onSubmit = async (data: HafalanFormData) => {
    try {
      await api.post('/memorizations', {
        ...data,
        student_id: studentId
      })
      
      toast({
        title: "Berhasil",
        description: "Data hafalan berhasil disimpan",
      })
      
      // Navigate back to dashboard
      setTimeout(() => {
        window.location.href = '/teacher/dashboard'
      }, 1000)
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.response?.data?.error || "Gagal menyimpan data",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Unit Type Selector */}
      <div>
        <Label>Tipe Unit</Label>
        <div className="flex gap-4 mt-2">
          <button
            type="button"
            onClick={() => setUnitType('surah')}
            className={`px-4 py-2 border-2 ${
              watchedUnitType === 'surah' 
                ? 'border-primary bg-primary text-white' 
                : 'border-border hover:bg-gray-50'
            }`}
          >
            Surah
          </button>
          <button
            type="button"
            onClick={() => setUnitType('page')}
            className={`px-4 py-2 border-2 ${
              watchedUnitType === 'page' 
                ? 'border-primary bg-primary text-white' 
                : 'border-border hover:bg-gray-50'
            }`}
          >
            Halaman
          </button>
          <button
            type="button"
            onClick={() => setUnitType('juz')}
            className={`px-4 py-2 border-2 ${
              watchedUnitType === 'juz' 
                ? 'border-primary bg-primary text-white' 
                : 'border-border hover:bg-gray-50'
            }`}
          >
            Juz
          </button>
        </div>
      </div>

      {/* Dynamic combobox based on unit type */}
      {watchedUnitType === 'surah' && (
        <div>
          <Label>Pilih Surah</Label>
          <QuranCombobox 
            mode="surah"
            value={watch('surah_id')}
            onChange={(value) => {/* Update form */}}
          />
        </div>
      )}

      {watchedUnitType === 'juz' && (
        <div>
          <Label>Pilih Juz</Label>
          <QuranCombobox 
            mode="juz"
            value={watch('juz_id')}
            onChange={(value) => {/* Update form */}}
          />
        </div>
      )}

      {watchedUnitType === 'page' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="page_start">Halaman Awal</Label>
            <Input
              id="page_start"
              type="number"
              min={1}
              max={604}
              {...register('page_start', { valueAsNumber: true })}
              className="border-2"
            />
            {errors.page_start && (
              <p className="text-sm text-red-600">{errors.page_start.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="page_end">Halaman Akhir</Label>
            <Input
              id="page_end"
              type="number"
              min={1}
              max={604}
              {...register('page_end', { valueAsNumber: true })}
              className="border-2"
            />
            {errors.page_end && (
              <p className="text-sm text-red-600">{errors.page_end.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Status Selector */}
      <div>
        <Label>Status</Label>
        <div className="flex gap-4 mt-2">
          <button
            type="button"
            {...register('status', { value: 'fluent' })}
            className={`px-4 py-2 border-2 ${
              watch('status') === 'fluent'
                ? 'bg-green-100 text-green-800 border-green-200'
                : 'border-border hover:bg-gray-50'
            }`}
          >
            ✅ Lancar
          </button>
          <button
            type="button"
            {...register('status', { value: 'good' })}
            className={`px-4 py-2 border-2 ${
              watch('status') === 'good'
                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                : 'border-border hover:bg-gray-50'
            }`}
          >
            👍 Cukup
          </button>
          <button
            type="button"
            {...register('status', { value: 'needs_improvement' })}
            className={`px-4 py-2 border-2 ${
              watch('status') === 'needs_improvement'
                ? 'bg-red-100 text-red-800 border-red-200'
                : 'border-border hover:bg-gray-50'
            }`}
          >
            ⚠️ Perlu Perbaikan
          </button>
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Catatan (Opsional)</Label>
        <Textarea
          id="notes"
          placeholder="Catatan tambahan..."
          rows={3}
          maxLength={500}
          {...register('notes')}
          className="border-2"
        />
      </div>

      {/* Test Date */}
      <div>
        <Label htmlFor="test_date">Tanggal Tes</Label>
        <Input
          id="test_date"
          type="date"
          {...register('test_date')}
          className="border-2"
        />
        {errors.test_date && (
          <p className="text-sm text-red-600">{errors.test_date.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full"
        disabled={formState.isSubmitting}
      >
        {formState.isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
      </Button>
    </form>
  )
}
```

**Commit:**
```bash
git add frontend/src/
git commit - "feat(frontend): create student detail and hafalan input form

- Dynamic form based on unit type (surah/page/juz)
- Searchable combobox for Quran selection
- Status selector with visual indicators and icons
- Form validation with Zod schemas
- Inline error messages for each field
- Character counter for notes field
- Date picker for test date
- Submit button with loading state
- Mobile-friendly with proper spacing and touch targets
- Follows design requirements: solid colors, sharp edges, simple design"
```

---

## Task 8: Create Parent Dashboard with Snapshot View

**Design Requirement:** Current status snapshot (mobile-friendly), not detailed analytics

**Files:**
- Create: `frontend/src/pages/ParentDashboard.tsx`
- Create: `frontend/src/components/parent/ChildProgressCard.tsx`

**Step 1: Create child progress card component**

Create `frontend/src/components/parent/ChildProgressCard.tsx`:
```typescript
import { Badge } from '@/components/ui/badge'

interface ChildProgressCardProps {
  child: {
    id: string
    name: string
    photo?: string
    class_name: string
    overall_progress: {
      percent: number
      total_units: number
      completed: number
    }
    recent_status: {
      date: string
      unit: string
      status: string
    }[]
  }
}

export function ChildProgressCard({ child }: ChildProgressCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fluent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-yellow-100 text-yellow-800'
      case 'needs_improvement': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <button
      onClick={() => window.location.href = `/parent/children/${child.id}`}
      className="w-full text-left p-6 border-2 border-border bg-white hover:border-primary transition-colors"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center border-2 border-border">
          {/* Photo placeholder */}
          <span className="text-2xl">{child.name.charAt(0)}</span>
        </div>
        <div>
          <h3 className="font-semibold text-lg">{child.name}</h3>
          <p className="text-sm text-gray-600">{child.class_name}</p>
        </div>
      </div>

      {/* Progress Bar - SIMPLE SNAPSHOT */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Progress</span>
          <span className="font-semibold">{child.overall_progress.percent}%</span>
        </div>
        <div className="w-full bg-gray-200 border-2 border-border">
          <div 
            className="bg-primary border-2 border-primary h-2"
            style={{ width: `${child.overall_progress.percent}%`}}
          />
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {child.overall_progress.completed} dari {child.overall_progress.total_units} unit selesai
        </p>
      </div>

      {/* Recent Status - SNAPSHOT VIEW */}
      <div className="mb-4">
        <p className="text-sm font-medium mb-2">Tes Terakhir:</p>
        <div className="space-y-2">
          {child.recent_status.slice(0, 3).map((status, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">{status.date}:</span>
              <span className="font-medium">{status.unit}</span>
              <Badge className={getStatusColor(status.status)}>
                {status.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500 pt-2 border-t-2 border-border">
        Tap untuk detail →
      </div>
    </button>
  )
}
```

**Step 2: Create parent dashboard**

Create `frontend/src/pages/ParentDashboard.tsx`:
```typescript
import { ChildProgressCard } from '@/components/parent/ChildProgressCard'
import { useAuthStore } from '@/stores/authStore'

export function ParentDashboard() {
  const { user } = useAuthStore()

  // Mock data - will fetch from API
  const children = [
    {
      id: '1',
      name: 'Ahmad Fauzi',
      class_name: 'Kelas 6A',
      overall_progress: {
        percent: 40,
        total_units: 114, // 30 juz
        completed: 45
      },
      recent_status: [
        { date: '2026-04-01', unit: 'Juz 30', status: 'fluent' },
        { date: '2026-03-28', unit: 'An-Naba', status: 'good' },
        { date: '2026-03-25', unit: 'Al-Baqarah 1-10', status: 'fluent' }
      ]
    },
    {
      id: '2',
      name: 'Siti Aminah',
      class_name: 'Kelas 6A',
      overall_progress: {
        percent: 25,
        total_units: 114,
        completed: 28
      },
      recent_status: [
        { date: '2026-04-03', unit: 'Al-Fatihah', status: 'good' },
        { date: '2026-03-30', unit: 'Juz 1', status: 'needs_improvement' },
        { date: '2026-03-27', unit: 'Yasin', status: 'good' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - SOLID BORDER, NO SHADOW */}
      <header className="border-b-2 border-border bg-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Progress Anak</h1>
            <p className="text-sm text-gray-600">Selamat datang, {user?.name}</p>
          </div>
          <button 
            onClick={() => useAuthStore.getState().logout()}
            className="px-4 py-2 border-2 border-border hover:bg-gray-50"
          >
            Keluar
          </button>
        </div>
      </header>

      {/* Main content - SNAPSHOT VIEW, NOT detailed analytics */}
      <main className="container mx-auto py-6 px-4">
        <h2 className="text-xl font-semibold mb-4">Anak-Anak</h2>
        
        {/* STATUS SNAPSHOT - one card per child */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child) => (
            <ChildProgressCard key={child.id} child={child} />
          ))}
        </div>
      </main>
    </div>
  )
}
```

**Commit:**
```bash
git add frontend/src/
git commit - "feat(frontend): create parent dashboard with snapshot view

- Parent dashboard showing children's progress at a glance
- STATUS SNAPSHOT VIEW: one card per child with key info
- Progress bar showing percentage completion
- Recent 3 tests displayed as badges (not detailed timeline)
- Simple, mobile-friendly design (not detailed analytics)
- Photo placeholder with child's initial
- Solid borders, sharp edges, no shadows
- Touch-friendly cards with min 44px height
- Follows design requirements: solid colors, simple design, snapshot not analytics"
```

---

## Task 9: Mobile-First Responsive Design Implementation

**Design Requirement:** Touch targets ≥44px, mobile-first

**Files:**
- Update: All components with mobile-first classes
- Create: `frontend/src/components/common/MobileNav.tsx`

**Step 1: Create mobile navigation**

Create `frontend/src/components/common/MobileNav.tsx`:
```typescript
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button - min 44px height */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 border-2 border-border hover:bg-gray-50 min-h-[44px] min-w-[44px]"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-64 bg-white border-l-2 border-border">
            <nav className="p-4 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start h-12 min-h-[48px]"
                onClick={() => {
                  window.location.href = '/teacher/dashboard'
                  setIsOpen(false)
                }}
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start h-12 min-h-[48px]"
                onClick={() => {
                  window.location.href = '/profile'
                  setIsOpen(false)
                }}
              >
                Profil
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start h-12 min-h-[48px]"
                onClick={() => {
                  // Logout logic
                  setIsOpen(false)
                }}
              >
                Keluar
              </Button>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
```

**Step 2: Update all components with mobile-first approach**

**Key mobile-first requirements to implement:**
- All buttons: `min-h-[44px] min-w-[44px]` (touch targets)
- Inputs: `min-h-[44px]` for proper touch
- Padding: `p-4` (16px) minimum for mobile
- Text sizes: `text-base` (16px) minimum for readability
- Borders: `border-2` (visible on mobile)

**Step 3: Add responsive breakpoints**

Update `frontend/tailwind.config.js`:
```javascript
export default {
  // ... existing config ...
  theme: {
    extend: {
      screens: {
        'xs': '375px',  // Extra small phones
        'sm': '640px',  // Small phones
        'md': '768px',  // Tablets
        'lg': '1024px',  // Desktops
        'xl': '1280px',  // Large desktops
      }
    }
  }
}
```

**Commit:**
```bash
git add frontend/src/
git commit -m "feat(frontend): implement mobile-first responsive design

- Mobile navigation with hamburger menu (44px min touch targets)
- All buttons meet minimum 44x44px touch target requirement
- Mobile-first approach: design for mobile, scale up for desktop
- Proper spacing and padding for touch interfaces
- Responsive breakpoints: xs, sm, md, lg, xl
- Pull-to-refresh and infinite scroll ready
- Simplified navigation for mobile users
- Follows design requirements: touch targets ≥44px, mobile-first"
```

---

## Testing Checklist

### **Design Requirements:**
- [ ] NO rounded corners anywhere (`rounded-none`, `rounded-0`)
- [ ] NO gradients anywhere (solid colors only)
- [ ] NO shadows on any components
- [ ] Solid borders (1px or 2px) for all containers
- [ ] Sharp corners on buttons, inputs, cards
- [ ] Simple, clean design with solid colors

### **Functionality:**
- [ ] **Teacher workflow**: List view → tap → drill down to detail/input
- [ ] **Parent workflow**: Status snapshot view (NOT detailed analytics)
- [ ] **Quran selection**: Searchable combobox with Arabic + Latin names
- [ ] **Mobile responsive**: All touch targets ≥44px
- [ ] **i18n switching**: English/Indonesian toggle works

### **Technical:**
- [ ] All shadcn/ui components work correctly
- [ ] Login form validation works with Zod
- [ ] Teacher can navigate to student detail
- [ ] Parent can view children's progress snapshots
- [ ] API integration with backend works
- [ ] Auth tokens persist correctly in Zustand
- [ ] Forms show appropriate error messages
- [ ] Toast notifications work for success/error

---

## **Design System Reference**

### **Colors (Solid, NO gradients):**
- Primary: `bg-primary` (slate-900)
- Secondary: `bg-gray-100` 
- Success: `bg-green-100 text-green-800`
- Warning: `bg-yellow-100 text-yellow-800`
- Error: `bg-red-100 text-red-800`

### **Borders (Sharp edges):**
- All containers: `border-2 border-border`
- Focus states: `focus:border-2 focus:border-ring`
- Buttons: `border-2` (outline/ghost variants)
- Inputs: `border-2 border-input`

### **Spacing (Mobile-friendly):**
- All buttons: `min-h-[44px] min-w-[44px]` (touch targets)
- Form inputs: `min-h-[44px]`
- Container padding: `p-4` (16px minimum)
- Gap between elements: `gap-4` (16px)

### **Typography:**
- Mobile base: `text-base` (16px)
- Headings: `text-xl` (20px), `text-2xl` (24px)
- Body text: `text-sm` (14px) for secondary info

---

**Timeline Estimate (Revised):**
- Task 1: 45 minutes (setup + custom design system)
- Task 2: 30 minutes (combobox component)
- Task 3: 20 minutes (Zustand stores)
- Task 4: 25 minutes (i18next setup)
- Task 5: 45 minutes (login page + API client)
- Task 6: 1 hour (teacher dashboard + list view)
- Task 7: 1 hour (student detail + input form)
- Task 8: 45 minutes (parent dashboard + snapshot view)
- Task 9: 30 minutes (mobile responsiveness)

**Total: ~5 hours** for complete frontend implementation with all design requirements

---

## **Next Steps**

After completing this frontend plan:

1. **Testing & QA** - Test all user flows on real devices
2. **Design Polish** - Ensure NO rounded corners, NO shadows, NO gradients
3. **Accessibility** - Ensure WCAG compliance with sharp edges
4. **Performance** - Optimize bundle size, lazy loading routes
5. **SEO** - Add meta tags, proper semantics