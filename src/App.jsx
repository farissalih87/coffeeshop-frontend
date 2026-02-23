import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store'

// Customer Pages
import LanguageSelect from './pages/LanguageSelect'
import Menu from './pages/Menu'
import OrderConfirmation from './pages/OrderConfirmation'

// Staff Pages
import StaffLogin from './pages/StaffLogin'
import StaffDashboard from './pages/StaffDashboard'

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminMenu from './pages/admin/AdminMenu'
import AdminStaff from './pages/admin/AdminStaff'
import AdminReports from './pages/admin/AdminReports'

function ProtectedRoute({ children, requiredRole }) {
  const { user, token } = useAuthStore()
  if (!token || !user) return <Navigate to="/staff/login" replace />
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/staff" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Customer Flow */}
      <Route path="/" element={<LanguageSelect />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/order-confirmation" element={<OrderConfirmation />} />

      {/* Staff */}
      <Route path="/staff/login" element={<StaffLogin />} />
      <Route path="/staff" element={
        <ProtectedRoute><StaffDashboard /></ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="menu" element={<AdminMenu />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
