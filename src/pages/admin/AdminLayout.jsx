import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, UtensilsCrossed, Users, BarChart3, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../store'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { to: '/admin',         label: 'DASHBOARD', icon: LayoutDashboard, end: true },
  { to: '/admin/menu',    label: 'MENU',       icon: UtensilsCrossed             },
  { to: '/admin/staff',   label: 'STAFF',      icon: Users                       },
  { to: '/admin/reports', label: 'REPORTS',    icon: BarChart3                   },
]

const sidebarStyle = {
  background: 'linear-gradient(180deg, #1a0a0e 0%, #5a1e2d 100%)',
}

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
      <div className="p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="Arica Lounge"
            className="w-10 h-10 rounded-full object-cover"
            style={{ border: '1px solid rgba(201,149,107,0.3)' }}
          />
          <div>
            <div style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: '800',
              color: '#fdf6ee',
              letterSpacing: '0.2em',
              fontSize: '0.8rem',
            }}>
              ARICA
            </div>
            <div style={{
              fontFamily: 'Montserrat, sans-serif',
              color: '#c9956b',
              letterSpacing: '0.4em',
              fontSize: '0.55rem',
            }}>
              LOUNGE
            </div>
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
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
              ${isActive
                ? 'text-cream'
                : 'text-white/30 hover:text-white/60 hover:bg-white/5'
              }
            `}
            style={({ isActive }) => isActive ? {
              background: 'rgba(126,43,63,0.5)',
              border: '1px solid rgba(201,149,107,0.2)',
            } : {}}
          >
            <item.icon size={16} />
            <span style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '0.7rem',
              fontWeight: '600',
              letterSpacing: '0.15em',
            }}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{
          fontFamily: 'Montserrat, sans-serif',
          color: 'rgba(255,255,255,0.25)',
          fontSize: '0.65rem',
          marginBottom: '12px',
          letterSpacing: '0.05em',
        }}>
          {user?.email}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 transition-colors hover:text-red-400"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            color: 'rgba(255,255,255,0.25)',
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          <LogOut size={14} />
          LOGOUT
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-56 flex-col fixed inset-y-0" style={sidebarStyle}>
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 flex flex-col" style={sidebarStyle}>
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-white/40">
              <X size={20} />
            </button>
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Mobile Header */}
      <div
        className="lg:hidden fixed top-0 inset-x-0 z-30 px-4 py-3 flex items-center gap-3"
        style={{ background: '#1a0a0e', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <button onClick={() => setMobileOpen(true)}>
          <Menu style={{ color: '#c9956b' }} size={22} />
        </button>
        <span style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: '800',
          color: '#fdf6ee',
          letterSpacing: '0.2em',
          fontSize: '0.8rem',
        }}>
          ARICA LOUNGE
        </span>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-56 pt-14 lg:pt-0 min-h-screen bg-gray-50">
        <Outlet />
      </main>
    </div>
  )
}
