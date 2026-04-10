import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, User, ChevronDown } from 'lucide-react'
import { useAuthStore, User } from '@/stores/authStore'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface UserDropdownProps {
  user?: User | null
}

export function UserDropdown({ user }: UserDropdownProps) {
  const { logout } = useAuthStore()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Calculate dropdown position when opened
  useEffect(() => {
    if (userMenuOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const dropdownHeight = 96 // approximate height: 48px * 2 items

      // If not enough space below, show above
      if (spaceBelow < dropdownHeight) {
        setDropdownPosition('top')
      } else {
        setDropdownPosition('bottom')
      }
    }
  }, [userMenuOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [userMenuOpen])

  const handleLogout = () => {
    logout()
    setLogoutDialogOpen(false)
    setUserMenuOpen(false)
    window.location.href = '/login'
  }

  return (
    <>
      <div className="relative">
        {/* Dropdown Trigger */}
        <button
          ref={triggerRef}
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center justify-between px-4 py-3 border-2 border-border hover:bg-gray-50 min-h-[44px] transition-colors gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary text-white flex items-center justify-center rounded-full text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-medium">{user?.name || 'User'}</div>
              <div className="text-xs text-gray-600">{user?.email}</div>
            </div>
          </div>
          <ChevronDown
            size={16}
            className={`text-gray-600 transition-transform flex-shrink-0 ${
              userMenuOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Content */}
        {userMenuOpen && (
          <>
            {/* Backdrop - closes dropdown when clicking outside (mobile only) */}
            <div
              className="fixed inset-0 z-40 sm:hidden"
              onClick={() => setUserMenuOpen(false)}
            />

            {/* Dropdown Menu - Smart positioning */}
            <div className={`absolute z-50 w-48 bg-white border-2 border-border shadow-lg ${
              dropdownPosition === 'bottom' ? 'mt-1 right-0' : 'mb-1 bottom-full right-0'
            }`}>
              <Link
                to="/profile"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-border min-h-[48px] transition-colors"
              >
                <User size={18} />
                <span className="text-sm">Profile</span>
              </Link>
              <button
                onClick={() => {
                  setUserMenuOpen(false)
                  setLogoutDialogOpen(true)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 min-h-[48px] transition-colors"
              >
                <LogOut size={18} />
                <span className="text-sm">Keluar</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        title="Keluar dari Akun?"
        description="Apakah Anda yakin ingin keluar? Anda perlu login kembali untuk mengakses sistem."
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleLogout}
      />
    </>
  )
}
