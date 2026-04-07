import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MobileNavProps {
  onLogout: () => void
  userRole?: 'teacher' | 'parent' | 'admin'
}

export function MobileNav({ onLogout, userRole }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getNavItems = () => {
    if (userRole === 'teacher') {
      return [
        { label: 'Dashboard', href: '/teacher/dashboard' },
        { label: 'Profile', href: '/profile' },
      ]
    }
    if (userRole === 'parent') {
      return [
        { label: 'Progress Anak', href: '/parent/dashboard' },
        { label: 'Profile', href: '/profile' },
      ]
    }
    return []
  }

  const navItems = getNavItems()

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
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="w-full justify-start h-12 min-h-[48px]"
                  onClick={() => {
                    window.location.href = item.href
                    setIsOpen(false)
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start h-12 min-h-[48px] text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  onLogout()
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
