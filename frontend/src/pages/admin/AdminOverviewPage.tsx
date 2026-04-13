import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, UserPlus, GraduationCap, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

interface DashboardStats {
  total_students: number
  total_teachers: number
  total_parents: number
  total_memorizations: number
}

interface Activity {
  id: number
  text: string
  time: string
}

export function AdminOverviewPage() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock recent activities - akan diganti nanti
  const [recentActivities, setRecentActivities] = useState<Activity[]>([
    { id: 1, text: 'Sistem berjalan normal', time: 'Baru saja' },
  ])

  // Fetch recent activities
  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        // For now, we'll use a simple implementation
        // In a full implementation, this would fetch from an activities table
        const activities: Activity[] = [
          { id: 1, text: `${stats?.total_students || 0} murid terdaftar`, time: 'Data terkini' },
          { id: 2, text: `${stats?.total_teachers || 0} guru aktif`, time: 'Data terkini' },
          { id: 3, text: `${stats?.total_parents || 0} orang tua terdaftar`, time: 'Data terkini' },
          { id: 4, text: `${stats?.total_memorizations || 0} hafalan tercatat`, time: 'Data terkini' },
        ]
        setRecentActivities(activities)
      } catch (error) {
        console.error('Failed to fetch activities:', error)
      }
    }

    fetchRecentActivities()
  }, [stats])

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats()
    }
  }, [isAuthenticated])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await dashboardApi.getStats()
      setStats(data)
    } catch (err: any) {
      console.error('Failed to fetch stats:', err)
      setError('Gagal memuat statistik')
    } finally {
      setLoading(false)
    }
  }

  const statsConfig = [
    {
      label: 'Total Murid',
      value: stats?.total_students.toString() || '0',
      icon: Users,
      color: 'bg-blue-100 text-blue-800',
      href: '/admin/students'
    },
    {
      label: 'Total Guru',
      value: stats?.total_teachers.toString() || '0',
      icon: GraduationCap,
      color: 'bg-green-100 text-green-800',
      href: '/admin/teachers'
    },
    {
      label: 'Total Orang Tua',
      value: stats?.total_parents.toString() || '0',
      icon: UserPlus,
      color: 'bg-purple-100 text-purple-800',
      href: '/admin/parents'
    },
    {
      label: 'Total Hafalan',
      value: stats?.total_memorizations.toString() || '0',
      icon: FileText,
      color: 'bg-orange-100 text-orange-800',
      href: '/admin/reports'
    },
  ]

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-gray-600">Selamat datang di panel admin</p>
      </div>

      {/* Quick Guide - Panduan Singkat */}
      <div className="border-2 border-blue-200 bg-blue-50 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-blue-900">Panduan Singkat: Urutan Input Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center font-bold">1</div>
            <div>
              <p className="font-semibold text-blue-900">Guru</p>
              <p className="text-sm text-blue-700">Data guru independent, bisa dibuat kapan saja</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center font-bold">2</div>
            <div>
              <p className="font-semibold text-blue-900">Kelas</p>
              <p className="text-sm text-blue-700">Assign wali kelas & guru quran dari data guru</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center font-bold">3</div>
            <div>
              <p className="font-semibold text-blue-900">Orang Tua</p>
              <p className="text-sm text-blue-700">Data orang tua independent, bisa dibuat kapan saja</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center font-bold">4</div>
            <div>
              <p className="font-semibold text-blue-900">Murid</p>
              <p className="text-sm text-blue-700">Assign ke orang tua dan kelas yang sudah dibuat</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border-2 border-border bg-white p-6">
              <div className="h-8 bg-gray-200 animate-pulse rounded mb-2"></div>
              <div className="h-12 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="border-2 border-red-200 bg-red-50 p-6 mb-8 text-center">
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 px-4 py-2 border-2 border-red-300 text-red-700 hover:bg-red-100 min-h-[44px] min-w-[44px]"
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsConfig.map((stat) => (
            <Link
              key={stat.label}
              to={stat.href}
              className="border-2 border-border bg-white p-6 hover:border-primary transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 ${stat.color}`}>
                  <stat.icon size={32} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/admin/teachers/new"
            className="border-2 border-border bg-white p-4 hover:border-primary transition-colors text-center min-h-[80px] flex items-center justify-center"
          >
            <div>
              <div className="text-2xl font-bold text-primary mb-2">+</div>
              <div className="font-medium">Tambah Guru</div>
            </div>
          </Link>
          <Link
            to="/admin/classes/new"
            className="border-2 border-border bg-white p-4 hover:border-primary transition-colors text-center min-h-[80px] flex items-center justify-center"
          >
            <div>
              <div className="text-2xl font-bold text-primary mb-2">+</div>
              <div className="font-medium">Tambah Kelas</div>
            </div>
          </Link>
          <Link
            to="/admin/parents/new"
            className="border-2 border-border bg-white p-4 hover:border-primary transition-colors text-center min-h-[80px] flex items-center justify-center"
          >
            <div>
              <div className="text-2xl font-bold text-primary mb-2">+</div>
              <div className="font-medium">Tambah Orang Tua</div>
            </div>
          </Link>
          <Link
            to="/admin/students/new"
            className="border-2 border-border bg-white p-4 hover:border-primary transition-colors text-center min-h-[80px] flex items-center justify-center"
          >
            <div>
              <div className="text-2xl font-bold text-primary mb-2">+</div>
              <div className="font-medium">Tambah Murid</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activities */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h2>
        <div className="border-2 border-border bg-white">
          {recentActivities.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>Belum ada aktivitas</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="p-4 flex items-center justify-between">
                  <p className="text-sm">{activity.text}</p>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
