import { useState, useRef, useEffect } from 'react'
import { ChevronDown, LogOut, User as UserIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, User } from '@/stores/authStore'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface UserDropdownProps {
  user?: User | null
}

export function UserDropdown({ user }: UserDropdownProps) {
  const navigate = useNavigate()
  const { logout: authLogout } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const handleLogout = () => {
    setShowLogoutDialog(true)
    setIsOpen(false)
  }

  const handleLogoutConfirmed = async () => {
    try {
      await authLogout()
      setShowLogoutDialog(false)
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getRoleDisplayName = (role?: 'admin' | 'teacher' | 'parent') => {
    switch (role) {
      case 'teacher': return 'Guru'
      case 'parent': return 'Orang Tua'
      case 'admin': return 'Administrator'
      default: return role || 'User'
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <>
      <div className="relative">
        {/* User Dropdown Trigger */}
        <button
          ref={triggerRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 border-2 border-border hover:bg-gray-50 min-h-[44px] min-w-[44px] transition-colors"
        >
          {/* User Info */}
          <div className="hidden md:block text-left">
            <div className="font-semibold text-base">{user?.name || user?.email || 'User'}</div>
            <div className="text-sm text-gray-600">{getRoleDisplayName(user?.role)}</div>
          </div>

          {/* Mobile: Show initials only */}
          <div className="md:hidden w-10 h-10 bg-primary text-white flex items-center justify-center font-semibold text-base">
            {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>

          {/* Dropdown Arrow */}
          <ChevronDown
            size={18}
            className={`text-gray-600 transition-transform flex-shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop - closes dropdown when clicking outside */}
            <div
              className="fixed inset-0 z-40"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsOpen(false)
              }}
            />

            {/* Dropdown Content */}
            <div className="absolute right-0 top-full mt-2 z-50 w-64 bg-white border-2 border-border">
              {/* User Info Header */}
              <div className="p-4 border-b-2 border-border bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary text-white flex items-center justify-center font-semibold text-xl">
                    {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base truncate">{user?.name || user?.email || 'User'}</div>
                    <div className="text-sm text-gray-600 truncate">{user?.email}</div>
                    <div className="text-sm font-semibold text-gray-700 mt-1">
                      {getRoleDisplayName(user?.role)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    navigate('/profile')
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left cursor-pointer"
                >
                  <UserIcon size={18} className="text-gray-600" />
                  <div className="flex-1">
                    <div className="font-semibold">Profile</div>
                    <div className="text-xs text-gray-600">Pengaturan akun</div>
                  </div>
                </button>

                <div className="mx-4 my-2 border-t border-border" />

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleLogout()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut size={18} className="text-gray-600" />
                  <div className="flex-1">
                    <div className="font-semibold">Keluar</div>
                    <div className="text-xs text-gray-600">Keluar dari akun</div>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="Keluar dari Akun?"
        description="Apakah Anda yakin ingin keluar? Anda perlu login kembali untuk mengakses sistem."
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleLogoutConfirmed}
      />
    </>
  )
}
