import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Bell, Settings, LogOut, User, ChevronDown, Search, Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

/* Map route → human readable title */
const TITLES = {
  '/dashboard':     'Dashboard',
  '/orders':        'Orders Management',
  '/print':         'Print Workflow',
  '/packaging':     'Packaging & Courier',
  '/machines':      'Machine Management',
  '/materials':     'Material Inventory',
  '/analytics':     'Revenue Analytics',
  '/settlements':   'Settlement Tracking',
  '/notifications': 'Notifications',
  '/performance':   'Performance Monitoring',
  '/issues':        'Issue Reporting',
  '/settings':      'Settings',
}

export default function Navbar({ onMenuToggle }) {
  const { vendor, logout } = useAuth()
  const navigate            = useNavigate()
  const location            = useLocation()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropRef = useRef(null)

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const pageTitle = TITLES[location.pathname] || 'TRID'
  const initials  = (vendor?.name || 'V')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl
                       border-b border-gray-border h-14 flex items-center
                       px-4 gap-4">

      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-[10px] hover:bg-gray-light text-gray-mid"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <h2 className="font-semibold text-gray-dark text-sm tracking-tight">
        {pageTitle}
      </h2>

      {/* Search */}
      <div className="hidden md:flex flex-1 max-w-sm mx-auto items-center
                      gap-2 bg-gray-light rounded-[10px] px-3 py-2">
        <Search size={14} className="text-gray-mid shrink-0" />
        <input
          type="text"
          placeholder="Search orders, files…"
          className="bg-transparent text-sm text-gray-dark placeholder-gray-mid
                     outline-none w-full"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-[10px] hover:bg-gray-light text-gray-mid
                     hover:text-gray-dark transition-colors"
        >
          <Bell size={18} />
          {/* Unread dot — will be dynamic in step 2 */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger ring-2 ring-white" />
        </button>

        {/* Settings shortcut */}
        <button
          onClick={() => navigate('/settings')}
          className="p-2 rounded-[10px] hover:bg-gray-light text-gray-mid
                     hover:text-gray-dark transition-colors"
        >
          <Settings size={18} />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5
                       rounded-[10px] hover:bg-gray-light transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center
                            justify-center text-white text-xs font-bold">
              {initials}
            </div>
            {vendor?.name && (
              <span className="hidden md:block text-sm font-medium text-gray-dark max-w-[110px] truncate">
                {vendor.name}
              </span>
            )}
            <ChevronDown size={14} className="text-gray-mid" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52
                            bg-white border border-gray-border rounded-xl
                            shadow-card-hover overflow-hidden animate-slide-up z-50">
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-border">
                <p className="font-semibold text-sm text-gray-dark">{vendor?.name || 'Vendor'}</p>
                <p className="text-xs text-gray-mid truncate">{vendor?.vendor_id || ''}</p>
              </div>

              {/* Items */}
              <button
                onClick={() => { setDropdownOpen(false); navigate('/settings') }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-dark
                           hover:bg-gray-light transition-colors"
              >
                <User size={15} /> Profile & Settings
              </button>

              <div className="border-t border-gray-border" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger
                           hover:bg-danger/8 transition-colors"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
