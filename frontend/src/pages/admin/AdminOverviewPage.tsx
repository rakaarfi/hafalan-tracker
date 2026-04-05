import { useTranslation } from 'react-i18next'
import { Users, UserPlus, GraduationCap, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

export function AdminOverviewPage() {
  const { t } = useTranslation()

  // Mock stats - akan fetch dari API
  const stats = [
    { label: 'Total Murid', value: '150', icon: Users, color: 'bg-blue-100 text-blue-800', href: '/admin/students' },
    { label: 'Total Guru', value: '12', icon: GraduationCap, color: 'bg-green-100 text-green-800', href: '/admin/teachers' },
    { label: 'Total Orang Tua', value: '280', icon: UserPlus, color: 'bg-purple-100 text-purple-800', href: '/admin/parents' },
    { label: 'Total Hafalan', value: '1,245', icon: FileText, color: 'bg-orange-100 text-orange-800', href: '/admin/reports' },
  ]

  const recentActivities = [
    { id: 1, text: 'Ahmad Fauzi menyelesaikan Juz 30', time: '5 menit yang lalu' },
    { id: 2, text: 'Siti Aminah input hafalan Al-Fatihah', time: '15 menit yang lalu' },
    { id: 3, text: 'Guru Budi menambahkan murid baru: Muhammad Rizki', time: '1 jam yang lalu' },
    { id: 4, text: 'Orang tua dari Ahmad Fauzi login', time: '2 jam yang lalu' },
    { id: 5, text: 'Laporan bulan Maret dibuat', time: '3 jam yang lalu' },
  ]

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-gray-600">Selamat datang di panel admin</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
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

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/students/new"
            className="border-2 border-border bg-white p-4 hover:border-primary transition-colors text-center min-h-[80px] flex items-center justify-center"
          >
            <div>
              <div className="text-2xl font-bold text-primary mb-2">+</div>
              <div className="font-medium">Tambah Murid</div>
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
            to="/admin/teachers/new"
            className="border-2 border-border bg-white p-4 hover:border-primary transition-colors text-center min-h-[80px] flex items-center justify-center"
          >
            <div>
              <div className="text-2xl font-bold text-primary mb-2">+</div>
              <div className="font-medium">Tambah Guru</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activities */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h2>
        <div className="border-2 border-border bg-white">
          <div className="divide-y-2 divide-border">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{activity.text}</p>
                </div>
                <div className="text-sm text-gray-600">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
