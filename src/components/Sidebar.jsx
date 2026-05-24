import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingBag, Cpu, Package2, BarChart3,
  Wallet, Bell, Activity, AlertTriangle, Settings,
  ChevronLeft, ChevronRight, HelpCircle, LogOut, Printer, Package
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  {
    section: 'Main',
    items: [
      { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/orders',       icon: ShoppingBag,     label: 'Orders',        badge: null },
      { to: '/print',        icon: Printer,         label: 'Print Workflow' },
      { to: '/packaging',    icon: Package,         label: 'Packaging' },
      { to: '/machines',     icon: Cpu,             label: 'Machines' },
      { to: '/materials',    icon: Package2,        label: 'Materials' },
    ]
  },
  {
    section: 'Finance',
    items: [
      { to: '/analytics',    icon: BarChart3,       label: 'Analytics' },
      { to: '/settlements',  icon: Wallet,          label: 'Settlements' },
    ]
  },
  {
    section: 'Operations',
    items: [
      { to: '/notifications', icon: Bell,           label: 'Notifications',  badge: null },
      { to: '/performance',   icon: Activity,       label: 'Performance' },
      { to: '/issues',        icon: AlertTriangle,  label: 'Issues' },
    ]
  },
]

export default function Sidebar({ collapsed, setCollapsed }) {
  const { vendor, logout } = useAuth()
  const navigate            = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-gray-border
                  transition-all duration-300 ease-in-out
                  ${collapsed ? 'w-[68px]' : 'w-[230px]'}`}
      style={{ minHeight: '100vh' }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="absolute -right-3 top-6 z-10
                   w-6 h-6 rounded-full bg-white border border-gray-border
                   flex items-center justify-center shadow-sm
                   hover:bg-gray-light transition-colors"
      >
        {collapsed
          ? <ChevronRight size={12} className="text-gray-mid" />
          : <ChevronLeft  size={12} className="text-gray-mid" />}
      </button>

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-border
                       ${collapsed ? 'justify-center px-0' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <span className="text-white font-black text-lg leading-none">T</span>
        </div>
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden">
            <p className="font-bold text-gray-dark text-sm leading-tight">TRID</p>
            <p className="text-[10px] text-gray-mid leading-tight">Vendor Platform</p>
          </div>
        )}
      </div>

      {/* Vendor info pill */}
      {!collapsed && vendor && (
        <div className="mx-3 mt-3 px-3 py-2.5 bg-primary-light rounded-[10px] animate-fade-in">
          <p className="text-[10px] text-gray-mid mb-0.5">Logged in as</p>
          <p className="text-xs font-bold text-primary truncate">
            {vendor?.name || vendor?.vendor_id || 'Vendor'}
          </p>
          <span className="badge badge-success mt-1">● Active</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV.map((group) => (
          <div key={group.section} className="mb-2">
            {!collapsed && (
              <p className="section-title">{group.section}</p>
            )}
            {group.items.map(({ to, icon: Icon, label, badge }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-[10px] mb-0.5
                   text-sm font-medium transition-all duration-150 group relative
                   ${collapsed ? 'justify-center' : ''}
                   ${isActive
                      ? 'bg-primary-light text-primary'
                      : 'text-gray-mid hover:bg-gray-light hover:text-gray-dark'
                   }`
                }
                title={collapsed ? label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={`shrink-0 ${isActive ? 'text-primary' : ''}`} />
                    {!collapsed && (
                      <span className="truncate animate-fade-in">{label}</span>
                    )}
                    {!collapsed && badge !== null && badge !== undefined && (
                      <span className="ml-auto badge badge-danger">{badge}</span>
                    )}
                    {/* Tooltip when collapsed */}
                    {collapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 bg-gray-dark text-white
                                      text-xs rounded-lg whitespace-nowrap
                                      opacity-0 group-hover:opacity-100 pointer-events-none
                                      transition-opacity duration-150 z-50">
                        {label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-gray-border p-2 space-y-0.5">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium
             transition-all duration-150 group relative
             ${collapsed ? 'justify-center' : ''}
             ${isActive ? 'bg-primary-light text-primary' : 'text-gray-mid hover:bg-gray-light hover:text-gray-dark'}`
          }
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings size={18} className="shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <button
          className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium
                      text-gray-mid hover:bg-gray-light hover:text-gray-dark
                      transition-all duration-150 group relative w-full
                      ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Help' : undefined}
        >
          <HelpCircle size={18} className="shrink-0" />
          {!collapsed && <span>Help & Support</span>}
        </button>

        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium
                      text-danger hover:bg-danger/8
                      transition-all duration-150 group relative w-full
                      ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
