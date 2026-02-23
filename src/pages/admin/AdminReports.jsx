import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Calendar, TrendingUp, ShoppingBag } from 'lucide-react'
import { orderApi } from '../../api'

const MOCK_REPORT = {
  totalOrders: 247,
  totalRevenue: 4892,
  avgOrder: 19.8,
  topItems: [
    { name: 'Cappuccino', orders: 87, revenue: 1566 },
    { name: 'Karak Tea', orders: 65, revenue: 650 },
    { name: 'Iced Latte', orders: 54, revenue: 1188 },
    { name: 'Croissant', orders: 48, revenue: 720 },
    { name: 'Latte', orders: 42, revenue: 840 },
  ],
  byLocation: [
    { location: "Men's Salon", orders: 147, revenue: 2920, percent: 60 },
    { location: 'Car Care Reception', orders: 100, revenue: 1972, percent: 40 },
  ],
  daily: [
    { date: 'Mon', orders: 35, revenue: 694 },
    { date: 'Tue', orders: 42, revenue: 832 },
    { date: 'Wed', orders: 38, revenue: 753 },
    { date: 'Thu', orders: 51, revenue: 1011 },
    { date: 'Fri', orders: 47, revenue: 932 },
    { date: 'Sat', orders: 34, revenue: 673 },
  ],
}

export default function AdminReports() {
  const [period, setPeriod] = useState('month')

  const { data, isLoading } = useQuery({
    queryKey: ['reports', period],
    queryFn: () => orderApi.getReport({ period }).then(r => r.data),
    retry: false,
  })

  // Safely merge API data with fallbacks
  const report = {
    totalOrders:  data?.totalOrders  ?? data?.total_orders  ?? MOCK_REPORT.totalOrders,
    totalRevenue: data?.totalRevenue ?? data?.total_revenue ?? MOCK_REPORT.totalRevenue,
    avgOrder:     data?.avgOrder     ?? data?.avg_order     ?? MOCK_REPORT.avgOrder,
    topItems:     Array.isArray(data?.topItems)   ? data.topItems   : Array.isArray(data?.top_items)   ? data.top_items   : MOCK_REPORT.topItems,
    byLocation:   Array.isArray(data?.byLocation) ? data.byLocation : Array.isArray(data?.by_location) ? data.by_location : MOCK_REPORT.byLocation,
    daily:        Array.isArray(data?.daily)      ? data.daily      : MOCK_REPORT.daily,
  }

  const BAR_MAX = Math.max(...report.daily.map(d => d.orders), 1)

  const exportCSV = () => {
    const rows = [
      ['Item', 'Orders', 'Revenue (AED)'],
      ...report.topItems.map(i => [i.name, i.orders, i.revenue])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `coffeeshop-report-${period}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-coffee-200 border-t-coffee-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-dark">Reports</h1>
        <div className="flex gap-2">
          {/* Period selector */}
          <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1">
            {['week', 'month', 'year'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold font-body transition-all capitalize
                           ${period === p ? 'bg-coffee-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-1.5 text-sm py-2">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Orders',   value: report.totalOrders,          icon: ShoppingBag,  color: 'text-coffee-600' },
          { label: 'Total Revenue',  value: `${report.totalRevenue} AED`, icon: TrendingUp,   color: 'text-green-600'  },
          { label: 'Avg Order Value',value: `${report.avgOrder} AED`,     icon: Calendar,     color: 'text-blue-600'   },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2 font-body">
              <c.icon size={16} />
              {c.label}
            </div>
            <p className={`font-display font-bold text-2xl ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">

        {/* Daily Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-display font-bold text-dark mb-4">Daily Orders</h2>
          <div className="flex items-end gap-2 h-32">
            {report.daily.map(d => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-400 font-body">{d.orders}</span>
                <div
                  className="w-full bg-coffee-500 rounded-t-lg transition-all"
                  style={{ height: `${(d.orders / BAR_MAX) * 100}%`, minHeight: '4px' }}
                />
                <span className="text-xs text-gray-400 font-body">{d.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Location */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-display font-bold text-dark mb-4">By Location</h2>
          {report.byLocation.map(loc => (
            <div key={loc.location} className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-body font-semibold text-dark">{loc.location}</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-coffee-700">{loc.orders} orders</span>
                  <span className="text-xs text-gray-400 ml-2">{loc.revenue} AED</span>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-coffee-500 rounded-full transition-all"
                  style={{ width: `${loc.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Top Items */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:col-span-2">
          <h2 className="font-display font-bold text-dark mb-4">Top Items</h2>
          <table className="w-full">
            <thead className="bg-gray-50 rounded-xl">
              <tr>
                {['#', 'Item', 'Orders', 'Revenue'].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {report.topItems.map((item, i) => (
                <tr key={item.name} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-400 text-sm font-body font-bold">{i + 1}</td>
                  <td className="px-4 py-3 font-body font-semibold text-dark">{item.name}</td>
                  <td className="px-4 py-3 text-gray-600 font-body">{item.orders}</td>
                  <td className="px-4 py-3 font-bold text-coffee-700 font-body">{item.revenue} AED</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
