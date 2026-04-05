import { useState } from 'react'
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Parent {
  id: string
  name: string
  email: string
  phone: string | null
  children_count: number
  children: Array<{ name: string; class_name: string }>
}

export function ParentListPage() {
  const [parents, setParents] = useState<Parent[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Mock data
  const mockParents: Parent[] = [
    {
      id: '1',
      name: 'Bapak Ahmad',
      email: 'bapak.ahmad@test.com',
      phone: '08123456789',
      children_count: 1,
      children: [{ name: 'Ahmad Fauzi', class_name: 'Kelas 6A' }]
    },
    {
      id: '2',
      name: 'Ibu Siti',
      email: 'ibu.siti@test.com',
      phone: '08123456789',
      children_count: 1,
      children: [{ name: 'Ahmad Fauzi', class_name: 'Kelas 6A' }]
    },
    {
      id: '3',
      name: 'Bapak Hasan',
      email: 'bapak.hasan@test.com',
      phone: '08129876543',
      children_count: 1,
      children: [{ name: 'Siti Aminah', class_name: 'Kelas 6A' }]
    },
    {
      id: '4',
      name: 'Ibu Fatimah',
      email: 'ibu.fatimah@test.com',
      phone: '08129876543',
      children_count: 1,
      children: [{ name: 'Siti Aminah', class_name: 'Kelas 6A' }]
    },
  ]

  useState(() => {
    setTimeout(() => {
      setParents(mockParents)
      setLoading(false)
    }, 500)
  })

  const filteredParents = parents.filter(parent =>
    parent.name.toLowerCase().includes(search.toLowerCase()) ||
    parent.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Data Orang Tua</h1>
          <p className="text-gray-600">Kelola data orang tua murid</p>
        </div>
        <Button
          onClick={() => window.location.href = '/admin/parents/new'}
          className="min-h-[44px] min-w-[44px]"
        >
          <Plus size={20} className="mr-2 inline" />
          Tambah Orang Tua
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-2 min-h-[44px]"
          />
        </div>
      </div>

      {/* Parents Grid */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParents.map((parent) => (
            <div key={parent.id} className="border-2 border-border bg-white p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary text-white flex items-center justify-center text-xl font-bold">
                    {parent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{parent.name}</h3>
                    <p className="text-sm text-gray-600">{parent.email}</p>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">No HP:</span>
                  <span>{parent.phone || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users size={16} className="text-gray-600" />
                  <span>{parent.children_count} anak</span>
                </div>
              </div>

              {/* Children */}
              {parent.children.length > 0 && (
                <div className="border-t-2 border-border pt-4 mb-4">
                  <p className="text-sm font-medium mb-2">Anak:</p>
                  <div className="space-y-1">
                    {parent.children.map((child, idx) => (
                      <div key={idx} className="text-sm flex items-center gap-2">
                        <span>•</span>
                        <span>{child.name}</span>
                        <Badge variant="outline" className="text-xs">{child.class_name}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = `/admin/parents/${parent.id}/edit`}
                  className="flex-1 min-h-[36px]"
                >
                  <Edit size={16} className="mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Hapus orang tua ini?')) {
                      setParents(parents.filter(p => p.id !== parent.id))
                    }
                  }}
                  className="flex-1 min-h-[36px] border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} className="mr-1" />
                  Hapus
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredParents.length === 0 && (
        <div className="text-center py-12 border-2 border-border bg-white">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Tidak ada orang tua ditemukan</p>
        </div>
      )}
    </div>
  )
}
