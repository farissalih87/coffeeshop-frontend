import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Coffee, LayoutDashboard, UtensilsCrossed, Users, BarChart3, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../store'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/admin/staff', label: 'Staff', icon: Users },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/staff/login')
    toast.success('Logged out')
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-coffee-800/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-coffee-600/20 border border-coffee-600/30 flex items-center justify-center">
            <Coffee className="text-coffee-400" size={20} />
          </div>
          <div>
            <div className="font-display font-bold text-cream text-sm">Coffee Lounge</div>
            <div className="text-coffee-600 text-xs">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-all
               ${isActive
                 ? 'bg-coffee-600/20 text-coffee-300 border border-coffee-600/30'
                 : 'text-coffee-500 hover:text-coffee-300 hover:bg-coffee-800/30'
               }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-coffee-800/50">
        <div className="text-coffee-500 text-xs mb-3 font-body">{user?.email}</div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-coffee-600 hover:text-red-400 text-sm font-body transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-56 flex-col bg-dark border-r border-coffee-800/30 fixed inset-y-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-dark/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-dark flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-coffee-500">
              <X size={20} />
            </button>
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 bg-dark border-b border-coffee-800/30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setMobileOpen(true)}>
          <Menu className="text-coffee-400" size={22} />
        </button>
        <span className="font-display font-bold text-cream">Admin Panel</span>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-56 pt-14 lg:pt-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
