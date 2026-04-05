# Frontend Implementation Plan

> **Goal:** Build complete frontend UI for hafalan tracker with authentication, teacher input, and parent progress viewing

**Tech Stack:**
- React 18, TypeScript, Vite, Bun
- React Router v6, Zustand, React Hook Form + Zod
- shadcn/ui components, Tailwind CSS
- i18next (English/Indonesian)
- Axios for API calls

---

## Task 1: Setup Shadcn/ui and Core Components

**Files:**
- Update: `frontend/components.json`
- Create: `frontend/src/components/ui/` (shadcn components)
- Update: `frontend/src/App.tsx` with router structure

**Step 1: Initialize shadcn/ui**
```bash
cd frontend
npx shadcn-ui@latest init
```

Choose options:
- Style: Default
- Base color: Slate
- CSS variables: Yes

**Step 2: Add required shadcn components**
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
```

**Step 3: Setup React Router**

Create `frontend/src/App.tsx`:
```typescript
import { BrowserRouter } from 'react-router-dom'
import { Routes } from 'react-router-dom'
import { Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<div>Landing Page</div>} />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/teacher" element={<div>Teacher Dashboard</div>} />
          <Route path="/parent" element={<div>Parent Dashboard</div>} />
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
git commit -m "feat(frontend): setup shadcn/ui and React Router"
```

---

## Task 2: Setup State Management with Zustand

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
  role: string
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
  currentLanguage: 'id',
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),
  setLanguage: (lang) => set({ currentLanguage: lang }),
}))
```

**Commit:**
```bash
git add frontend/src/stores/
git commit -m "feat(frontend): setup Zustand stores for auth and UI state"
```

---

## Task 3: Setup i18next for Internationalization

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
    lng: 'id',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  })

export default i18n
```

**Step 2: Create translation files**

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
  }
}
```

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
  }
}
```

**Commit:**
```bash
git add frontend/src/i18n.ts frontend/src/locales/
git commit -m "feat(frontend): setup i18next for English/Indonesian"
```

---

## Task 4: Create Login Page with Validation

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

**Step 2: Create login form with validation**

Create `frontend/src/components/auth/LoginForm.tsx`:
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter')
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await api.post('/public/login', data)
      // Handle success
    } catch (error) {
      // Handle error
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full">
        Masuk
      </Button>
    </form>
  )
}
```

**Commit:**
```bash
git add frontend/src/
git commit -m "feat(frontend): create login page with form validation"
```

---

## Task 5: Create Teacher Dashboard & Input Form

**Files:**
- Create: `frontend/src/pages/TeacherDashboard.tsx`
- Create: `frontend/src/components/teacher/HafalanInputForm.tsx`
- Create: `frontend/src/components/teacher/StudentList.tsx`

**Step 1: Create teacher dashboard**

Create `frontend/src/pages/TeacherDashboard.tsx`:
```typescript
import { useAuthStore } from '@/stores/authStore'

export function TeacherDashboard() {
  const { user } = useAuthStore()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">
        Dashboard Guru
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Daftar Murid</h2>
          {/* Student list component */}
        </div>
        
        {/* Quick Input */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Input Hafalan</h2>
          {/* Input form component */}
        </div>
      </div>
    </div>
  )
}
```

**Commit:**
```bash
git add frontend/src/pages/TeacherDashboard.tsx
git commit -m "feat(frontend): create teacher dashboard layout"
```

---

## Task 6: Create Parent Progress View

**Files:**
- Create: `frontend/src/pages/ParentDashboard.tsx`
- Create: `frontend/src/components/parent/ChildProgressCard.tsx`

**Step 1: Create parent dashboard**

Create `frontend/src/pages/ParentDashboard.tsx`:
```typescript
export function ParentDashboard() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">
        Progress Hafalan Anak
      </h1>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Children progress cards */}
        {/* Progress summary */}
      </div>
    </div>
  )
}
```

**Commit:**
```bash
git add frontend/src/pages/ParentDashboard.tsx
git commit -m "feat(frontend): create parent dashboard for viewing progress"
```

---

## Task 7: Mobile-First Responsive Design

**Files:**
- Update: All components with mobile-first Tailwind classes
- Create: `frontend/src/components/common/MobileNav.tsx`

**Step 1: Add mobile navigation**

**Step 2: Ensure touch targets ≥44px**

**Step 3: Test on mobile viewport**

**Commit:**
```bash
git add frontend/src/components/
git commit -m "feat(frontend): add mobile-first responsive design"
```

---

## Testing Checklist

- [ ] All shadcn/ui components work correctly
- [ ] Login form validation works
- [ ] Teacher can navigate to input form
- [ ] Parent can view children's progress
- [ ] Mobile responsive design works
- [ ] i18n switching works (EN/ID)
- [ ] API integration with backend works
- [ ] Auth tokens persist correctly
- [ ] Forms show appropriate error messages
- [ ] Touch targets are ≥44px on mobile

---

## Next Steps

After completing this frontend plan:

1. **Testing & QA** - Test all user flows
2. **UI Polish** - Add loading states, better error handling
3. **Accessibility** - Ensure WCAG compliance
4. **Performance** - Optimize bundle size, lazy loading
5. **SEO** - Add meta tags, proper semantics

---

**Timeline Estimate:**
- Task 1: 30 minutes
- Task 2: 15 minutes  
- Task 3: 20 minutes
- Task 4: 45 minutes
- Task 5: 1 hour
- Task 6: 45 minutes
- Task 7: 30 minutes

**Total: ~4 hours** for complete frontend implementation
