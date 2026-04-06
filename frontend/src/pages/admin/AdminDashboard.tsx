import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  GraduationCap,
  FileText,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'

interface MenuItem {
  id: string
  label: string
  icon: React.ElementType
  href: string
  badge?: string
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { id: 'students', label: 'Data Murid', icon: Users, href: '/admin/students' },
  { id: 'parents', label: 'Data Orang Tua', icon: UserPlus, href: '/admin/parents' },
  { id: 'teachers', label: 'Data Guru', icon: GraduationCap, href: '/admin/teachers' },
  { id: 'classes', label: 'Data Kelas', icon: GraduationCap, href: '/admin/classes' },
  { id: 'reports', label: 'Laporan', icon: FileText, href: '/admin/reports' },
  { id: 'settings', label: 'Pengaturan', icon: Settings, href: '/admin/settings' },
]

export function AdminDashboard() {
  const { t } = useTranslation()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const isActive = (href: string) => location.pathname === href

  return (
    <div className="h-screen bg-gray-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-50
        border-r-2 border-border bg-white transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-64 flex flex-col flex-shrink-0
      `}>
        {/* Logo */}
        <div className="p-4 border-b-2 border-border flex items-center justify-between">
          <h1 className="font-bold text-lg">Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 border-2 border-border hover:bg-gray-50 min-h-[44px] min-w-[44px]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-0 border-2 transition-all min-h-[44px]
                ${isActive(item.href)
                  ? 'border-primary bg-primary text-white'
                  : 'border-border hover:bg-gray-50'
                }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t-2 border-border space-y-2">
          <div className="text-sm">
            <div className="font-medium">{user?.name || 'Admin'}</div>
            <div className="text-gray-600 text-xs">{user?.email}</div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 border-2 border-red-200 text-red-600 hover:bg-red-50 w-full min-h-[44px]"
          >
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="border-b-2 border-border bg-white p-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 border-2 border-border hover:bg-gray-50 min-h-[44px] min-w-[44px]"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{t('admin.dashboard')}</h2>
              <p className="text-sm text-gray-600">
                {menuItems.find(item => isActive(item.href))?.label || 'Overview'}
              </p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
