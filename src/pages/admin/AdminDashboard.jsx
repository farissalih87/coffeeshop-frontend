import { useQuery } from '@tanstack/react-query'
import { ShoppingBag, TrendingUp, Users, Coffee, Clock, CheckCircle } from 'lucide-react'
import { orderApi } from '../../api'

// Mock stats for demo
const MOCK_STATS = {
  total_orders: 247,
  today_orders: 23,
  total_revenue: 4892,
  today_revenue: 456,
  pending_orders: 3,
  active_staff: 2,
  status_breakdown: {
    pending: 3, preparing: 2, ready: 1, delivered: 241,
  },
  recent_orders: [
    { id: 247, customer_name: 'Ahmed', location: 'salon', total: 38, status: 'delivered', created_at: new Date(Date.now()-5*60000).toISOString() },
    { id: 246, customer_name: 'Khalid', location: 'reception', total: 25, status: 'delivered', created_at: new Date(Date.now()-12*60000).toISOString() },
    { id: 245, customer_name: 'Sara', location: 'salon', total: 48, status: 'delivered', created_at: new Date(Date.now()-25*60000).toISOString() },
  ],
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-body">{label}</p>
          <p className="text-3xl font-display font-bold text-dark mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1 font-body">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => orderApi.getStats().then(r => r.data),
    placeholderData: MOCK_STATS,
    retry: false,
    refetchInterval: 30000,
  })

  const stats = data || MOCK_STATS

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-dark">Dashboard</h1>
        <p className="text-gray-500 text-sm font-body mt-1">
          {new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={ShoppingBag} label="Today's Orders" value={stats.today_orders} sub={`${stats.today_revenue} AED`} color="bg-coffee-600" />
        <StatCard icon={TrendingUp} label="Total Orders" value={stats.total_orders} sub="All time" color="bg-blue-500" />
        <StatCard icon={Coffee} label="Total Revenue" value={`${stats.total_revenue}`} sub="AED" color="bg-green-500" />
        <StatCard icon={Users} label="Active Staff" value={stats.active_staff} sub="Online" color="bg-purple-500" />
      </div>

      {/* Live queue + recent */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Live Status */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-display font-bold text-dark mb-4">Live Queue</h2>
          {Object.entries(stats.status_breakdown).filter(([k]) => k !== 'delivered').map(([status, count]) => {
            const colors = { pending:'bg-amber-500', preparing:'bg-blue-500', ready:'bg-green-500', cancelled:'bg-red-400' }
            const labels = { pending:'Pending', preparing:'Preparing', ready:'Ready to Pick Up', cancelled:'Cancelled' }
            return (
              <div key={status} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <div className={`w-2.5 h-2.5 rounded-full ${colors[status]}`} />
                <span className="flex-1 text-dark font-body text-sm">{labels[status]}</span>
                <span className="font-bold text-dark font-display text-lg">{count}</span>
              </div>
            )
          })}
          <div className="flex items-center gap-3 py-2.5">
            <CheckCircle size={12} className="text-gray-400" />
            <span className="flex-1 text-gray-400 font-body text-sm">Delivered</span>
            <span className="font-bold text-gray-400 font-display text-lg">{stats.status_breakdown?.delivered || 0}</span>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-display font-bold text-dark mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {(stats.recent_orders || []).map(order => (
              <div key={order.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 rounded-xl bg-coffee-100 flex items-center justify-center text-xs font-bold text-coffee-700">
                  #{order.id}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dark font-body">{order.customer_name}</p>
                  <p className="text-xs text-gray-400">{order.location === 'salon' ? "Men's Salon" : 'Car Care'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-coffee-700">{order.total} AED</p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
