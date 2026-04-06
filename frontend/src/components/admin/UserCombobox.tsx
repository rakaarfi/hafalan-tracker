import { useState } from 'react'
import { Search, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface UserComboboxProps {
  users: User[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function UserCombobox({ users, value, onChange, placeholder = 'Pilih User...' }: UserComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  // Filter users based on search
  const filteredUsers = users.filter((user) => {
    const searchLower = search.toLowerCase()
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower)
    )
  })

  // Get selected user
  const selectedUser = users.find((u) => u.id === value)
  const displayValue = selectedUser ? `${selectedUser.name} (${selectedUser.email})` : ''

  // Role badge colors
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'teacher':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'parent':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(!open)}
        className="w-full justify-between border-2 min-h-[44px] text-left px-3"
      >
        <span className="truncate flex-1">
          {displayValue || placeholder}
        </span>
        <span className="ml-2 text-xs flex-shrink-0">{open ? '▲' : '▼'}</span>
      </Button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute z-50 w-full mt-1 bg-white border-2 border-border rounded-none shadow-lg">
            {/* Search Input */}
            <div className="p-3 border-b-2 border-border">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Cari nama, email, atau role..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 border-2 focus-visible:ring-0 min-h-[44px]"
                  autoFocus
                />
              </div>
            </div>

            {/* Users List */}
            <div className="max-h-80 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500">
                  <Search className="mx-auto h-8 w-8 mb-2 text-gray-400" />
                  <p>Tidak ada user ditemukan</p>
                  <p className="text-xs text-gray-400 mt-1">Coba kata kunci lain</p>
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = value === user.id
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        onChange(user.id)
                        setOpen(false)
                        setSearch('')
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-border last:border-b-0 transition-colors min-h-[60px] flex items-center gap-3 ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                    >
                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{user.name}</div>
                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                      </div>

                      {/* Role Badge */}
                      <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </Badge>

                      {/* Checkmark for selected */}
                      {isSelected && (
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer */}
            {filteredUsers.length > 0 && (
              <div className="p-2 border-t-2 border-border bg-gray-50 text-xs text-gray-600 text-center">
                {filteredUsers.length} user ditemukan
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
