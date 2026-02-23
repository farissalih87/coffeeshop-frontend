import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Coffee, MapPin, LogOut, RefreshCw, Volume2, VolumeX } from 'lucide-react'
import { useAuthStore } from '../store'
import { orderApi } from '../api'
import {
  startAlarm, stopAlarm,
  requestNotificationPermission,
  showBrowserNotification
} from '../utils/sound'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  preparing: { label: 'Preparing', color: 'bg-blue-100 text-blue-800',   dot: 'bg-blue-500'  },
  ready:     { label: 'Ready',     color: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
  delivered: { label: 'Delivered', color: 'bg-gray-100 text-gray-600',   dot: 'bg-gray-400'  },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600',     dot: 'bg-red-400'   },
}

const LOCATION_LABELS = {
  salon:     "Men's Salon ✂️",
  reception: "Car Care Reception 🚗",
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order, onUpdateStatus }) {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
  const nextStatus = { pending: 'preparing', preparing: 'ready', ready: 'delivered' }[order.status]
  const isNew = order.status === 'pending'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, x: -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`card p-4 ${isNew ? 'border-2 border-coffee-400 shadow-lg shadow-coffee-200/50' : ''}`}
    >
      {isNew && (
        <div className="flex items-center gap-1.5 mb-3 text-coffee-600 text-xs font-semibold uppercase tracking-wider">
          <div className="w-2 h-2 rounded-full bg-coffee-500 animate-pulse" />
          New Order
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-dark text-lg">#{order.id}</span>
            <span className={`badge ${cfg.color} text-xs`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1.5`} />
              {cfg.label}
            </span>
          </div>
          <p className="text-dark font-semibold font-body mt-1">{order.customer_name}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-coffee-700 font-body">{order.total} AED</p>
          <p className="text-xs text-coffee-400 mt-0.5">
            {new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <div className="bg-coffee-50 rounded-xl p-3 mb-3 space-y-1">
        {(order.items || []).map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-dark font-body">
              {item.quantity}× {item.menu_item?.name || item.name}
            </span>
            <span className="text-coffee-600 font-semibold">
              {item.subtotal || item.price * item.quantity} AED
            </span>
          </div>
        ))}
        {order.notes ? (
          <p className="text-coffee-500 text-xs italic pt-1 border-t border-coffee-100">
            "{order.notes}"
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-coffee-600">
          <MapPin size={14} />
          <span className="font-body">{LOCATION_LABELS[order.location] || order.location}</span>
        </div>
        {nextStatus && (
          <button
            onClick={() => onUpdateStatus(order.id, nextStatus)}
            className="btn-primary py-2 px-4 text-sm"
          >
            {nextStatus === 'preparing' && '▶ Start'}
            {nextStatus === 'ready'     && '✓ Ready'}
            {nextStatus === 'delivered' && '📦 Delivered'}
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function StaffDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const [orders, setOrders]               = useState([])
  const [filter, setFilter]               = useState('active')
  const [alarmOn, setAlarmOn]             = useState(false)
  const [soundEnabled, setSoundEnabled]   = useState(true)
  const [loading, setLoading]             = useState(true)
  const [audioUnlocked, setAudioUnlocked] = useState(false)

  const prevPendingIds = useRef(new Set())
  const isAlarmingRef  = useRef(false)
  const isFirstLoad    = useRef(true)

  // ── Unlock AudioContext on first user interaction ──────────────────────────
  // Browsers block audio until user clicks something — this fixes it
  const unlockAudio = useCallback(() => {
    if (audioUnlocked) return
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return
      const ctx = new Ctx()
      ctx.resume().then(() => {
        setAudioUnlocked(true)
        ctx.close()
      })
    } catch (e) {
      setAudioUnlocked(true)
    }
  }, [audioUnlocked])

  // ── Fetch orders ──────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      const res = await orderApi.getAll()
      const fetched = res.data.orders || []
      setOrders(fetched)

      const currentPendingIds = new Set(
        fetched.filter(o => o.status === 'pending').map(o => String(o.id))
      )

      if (!isFirstLoad.current) {
        // Detect brand new pending orders
        const newIds = [...currentPendingIds].filter(
          id => !prevPendingIds.current.has(id)
        )

        if (newIds.length > 0 && soundEnabled) {
          startAlarm()
          setAlarmOn(true)
          isAlarmingRef.current = true

          showBrowserNotification(
            `☕ ${newIds.length} New Order${newIds.length > 1 ? 's' : ''}!`,
            `${currentPendingIds.size} pending order${currentPendingIds.size > 1 ? 's' : ''} waiting.`
          )

          toast.custom(() => (
            <div className="flex items-center gap-3 bg-amber-50 border-2 border-amber-400 rounded-2xl px-4 py-3 shadow-lg">
              <Bell className="text-amber-600 animate-bounce" size={20} />
              <span className="font-body font-semibold text-amber-800">
                {newIds.length} new order{newIds.length > 1 ? 's' : ''} arrived!
              </span>
            </div>
          ), { duration: 4000 })
        }
      } else {
        // First load — record existing IDs silently, no alarm
        isFirstLoad.current = false
      }

      // Auto stop alarm when no pending orders remain
      if (currentPendingIds.size === 0 && isAlarmingRef.current) {
        stopAlarm()
        setAlarmOn(false)
        isAlarmingRef.current = false
      }

      prevPendingIds.current = currentPendingIds

    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoading(false)
    }
  }, [soundEnabled])

  // ── Start polling every 10 seconds ────────────────────────────────────────
  useEffect(() => {
    requestNotificationPermission()
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000)
    return () => {
      clearInterval(interval)
      stopAlarm()
    }
  }, [fetchOrders])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleUpdateStatus = async (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    toast.success(`Order #${orderId} → ${newStatus}`)
    try {
      await orderApi.updateStatus(orderId, newStatus)
      fetchOrders()
    } catch {
      toast.error('Failed to update order')
      fetchOrders()
    }
  }

  const handleStopAlarm = () => {
    stopAlarm()
    setAlarmOn(false)
    isAlarmingRef.current = false
  }

  const handleToggleSound = () => {
    if (soundEnabled && isAlarmingRef.current) {
      stopAlarm()
      setAlarmOn(false)
      isAlarmingRef.current = false
    }
    setSoundEnabled(prev => !prev)
  }

  const handleLogout = () => {
    stopAlarm()
    logout()
    navigate('/staff/login')
  }

  const filteredOrders = orders.filter(o => {
    if (filter === 'active') return ['pending', 'preparing'].includes(o.status)
    if (filter === 'ready')  return o.status === 'ready'
    if (filter === 'done')   return ['delivered', 'cancelled'].includes(o.status)
    return true
  })

  const pendingCount   = orders.filter(o => o.status === 'pending').length
  const preparingCount = orders.filter(o => o.status === 'preparing').length
  const readyCount     = orders.filter(o => o.status === 'ready').length

  return (
    <div className="min-h-screen bg-gray-50" onClick={unlockAudio}>

      {/* Audio unlock notice — disappears after first click */}
      <AnimatePresence>
        {!audioUnlocked && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-coffee-700 text-white px-4 py-3 flex items-center justify-between cursor-pointer"
              onClick={unlockAudio}
            >
              <div className="flex items-center gap-3">
                <Volume2 size={18} className="animate-pulse" />
                <span className="font-body text-sm font-semibold">
                  👆 Click anywhere to enable sound alerts
                </span>
              </div>
              <button
                onClick={unlockAudio}
                className="bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg text-sm font-semibold"
              >
                Enable Sound
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alarm Banner */}
      <AnimatePresence>
        {alarmOn && pendingCount > 0 && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-amber-500 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={20} className="animate-bounce" />
                <span className="font-body font-bold">
                  🔔 {pendingCount} order{pendingCount > 1 ? 's' : ''} waiting!
                </span>
              </div>
              <button
                onClick={handleStopAlarm}
                className="bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg text-sm font-semibold"
              >
                Acknowledge
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-dark text-cream px-4 py-4 sticky top-0 z-20 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coffee className="text-coffee-400" size={24} />
            <div>
              <h1 className="font-display font-bold text-lg leading-none">Staff Dashboard</h1>
              <p className="text-coffee-500 text-xs mt-0.5">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleToggleSound}
              className="p-2 rounded-xl bg-coffee-800/50 hover:bg-coffee-700/50 transition-colors"
              title={soundEnabled ? 'Mute' : 'Unmute'}
            >
              {soundEnabled
                ? <Volume2 size={18} className="text-coffee-300" />
                : <VolumeX size={18} className="text-red-400" />
              }
            </button>
            <button onClick={fetchOrders}
              className="p-2 rounded-xl bg-coffee-800/50 hover:bg-coffee-700/50 transition-colors"
            >
              <RefreshCw size={18} className="text-coffee-300" />
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-coffee-800/50 hover:bg-red-900/60 transition-colors text-sm text-coffee-300"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="bg-dark/90 px-4 pb-4">
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-2">
          {[
            { label: 'Pending',   count: pendingCount,   color: 'text-amber-400', bg: 'bg-amber-900/30' },
            { label: 'Preparing', count: preparingCount, color: 'text-blue-400',  bg: 'bg-blue-900/30'  },
            { label: 'Ready',     count: readyCount,     color: 'text-green-400', bg: 'bg-green-900/30' },
          ].map(stat => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-3 text-center`}>
              <div className={`${stat.color} text-2xl font-bold font-display`}>{stat.count}</div>
              <div className="text-gray-400 text-xs mt-0.5 font-body">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex gap-2 bg-white rounded-2xl p-1 shadow-sm border border-coffee-100">
          {[
            { key: 'active', label: `Active (${pendingCount + preparingCount})` },
            { key: 'ready',  label: `Ready (${readyCount})`                     },
            { key: 'done',   label: 'Done'                                       },
            { key: 'all',    label: 'All'                                        },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`flex-1 py-2 px-2 rounded-xl text-sm font-semibold font-body transition-all
                         ${filter === tab.key
                           ? 'bg-coffee-600 text-white shadow-sm'
                           : 'text-coffee-500 hover:text-coffee-700'
                         }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      <main className="max-w-2xl mx-auto px-4 py-4 space-y-3 pb-20">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-coffee-200 border-t-coffee-600 rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredOrders.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <div className="text-6xl mb-4">☕</div>
                <p className="text-coffee-400 font-body">No orders here</p>
                <p className="text-xs text-coffee-300 mt-1">Waiting for new orders...</p>
              </motion.div>
            ) : (
              filteredOrders.map(order => (
                <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} />
              ))
            )}
          </AnimatePresence>
        )}
      </main>

    </div>
  )
}
