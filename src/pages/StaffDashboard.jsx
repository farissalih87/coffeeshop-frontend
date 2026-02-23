import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, MapPin, LogOut, RefreshCw, Volume2, VolumeX } from 'lucide-react'
import { useAuthStore } from '../store'
import { orderApi } from '../api'
import {
  startAlarm, stopAlarm,
  requestNotificationPermission,
  showBrowserNotification
} from '../utils/sound'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  pending:   { label:'Pending',   color:'bg-amber-100 text-amber-800',  dot:'bg-amber-500'  },
  preparing: { label:'Preparing', color:'bg-blue-100 text-blue-800',    dot:'bg-blue-500'   },
  ready:     { label:'Ready',     color:'bg-green-100 text-green-800',  dot:'bg-green-500'  },
  delivered: { label:'Delivered', color:'bg-gray-100 text-gray-600',    dot:'bg-gray-400'   },
  cancelled: { label:'Cancelled', color:'bg-red-100 text-red-600',      dot:'bg-red-400'    },
}

const LOCATION_LABELS = {
  salon:     "Men's Salon ✂️",
  reception: "Car Care Reception 🚗",
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order, onUpdateStatus }) {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
  const nextStatus = { pending:'preparing', preparing:'ready', ready:'delivered' }[order.status]
  const isNew = order.status === 'pending'

  return (
    <motion.div
      layout
      initial={{ opacity:0, scale:0.95, x:-20 }}
      animate={{ opacity:1, scale:1, x:0 }}
      exit={{ opacity:0, scale:0.95 }}
      className="bg-white rounded-2xl p-4 shadow-sm"
      style={{
        border: isNew ? '2px solid #7e2b3f' : '1px solid rgba(126,43,63,0.1)',
        boxShadow: isNew ? '0 4px 20px rgba(126,43,63,0.15)' : '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      {isNew && (
        <div className="flex items-center gap-1.5 mb-3" style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.65rem', fontWeight:'700', color:'#7e2b3f', letterSpacing:'0.2em', textTransform:'uppercase' }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background:'#7e2b3f' }} />
          NEW ORDER
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:'800', fontSize:'1.1rem', color:'#1a0a0e' }}>
              #{order.id}
            </span>
            <span className={`badge ${cfg.color} text-xs`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1`} />
              {cfg.label}
            </span>
          </div>
          <p style={{ fontFamily:'Montserrat,sans-serif', fontWeight:'600', color:'#1a0a0e', marginTop:'4px' }}>
            {order.customer_name}
          </p>
        </div>
        <div className="text-right">
          <p style={{ fontFamily:'Montserrat,sans-serif', fontWeight:'800', color:'#7e2b3f', fontSize:'1rem' }}>
            {order.total} AED
          </p>
          <p style={{ fontFamily:'Montserrat,sans-serif', color:'#aaa', fontSize:'0.7rem', marginTop:'2px' }}>
            {new Date(order.created_at).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-xl p-3 mb-3 space-y-1" style={{ background:'#fdf2f4' }}>
        {(order.items || []).map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span style={{ fontFamily:'Montserrat,sans-serif', color:'#333' }}>
              {item.quantity}× {item.menu_item?.name || item.name}
            </span>
            <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:'700', color:'#7e2b3f' }}>
              {item.subtotal || item.price * item.quantity} AED
            </span>
          </div>
        ))}
        {order.notes && (
          <p style={{ fontFamily:'Montserrat,sans-serif', color:'#888', fontSize:'0.75rem', fontStyle:'italic', paddingTop:'6px', borderTop:'1px solid rgba(126,43,63,0.1)', marginTop:'4px' }}>
            "{order.notes}"
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1" style={{ color:'#7e2b3f' }}>
          <MapPin size={13} />
          <span style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.75rem', fontWeight:'500' }}>
            {LOCATION_LABELS[order.location] || order.location}
          </span>
        </div>
        {nextStatus && (
          <button
            onClick={() => onUpdateStatus(order.id, nextStatus)}
            className="px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5"
            style={{
              background:'#7e2b3f', color:'#fdf6ee',
              fontFamily:'Montserrat,sans-serif', fontWeight:'700',
              fontSize:'0.72rem', letterSpacing:'0.1em',
              border:'none', cursor:'pointer',
              boxShadow:'0 4px 12px rgba(126,43,63,0.3)',
            }}
          >
            {nextStatus === 'preparing' && '▶ START'}
            {nextStatus === 'ready'     && '✓ READY'}
            {nextStatus === 'delivered' && '📦 DONE'}
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

  const unlockAudio = useCallback(() => {
    if (audioUnlocked) return
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return
      const ctx = new Ctx()
      ctx.resume().then(() => { setAudioUnlocked(true); ctx.close() })
    } catch { setAudioUnlocked(true) }
  }, [audioUnlocked])

  const fetchOrders = useCallback(async () => {
    try {
      const res = await orderApi.getAll()
      const fetched = res.data.orders || []
      setOrders(fetched)

      const currentPendingIds = new Set(
        fetched.filter(o => o.status === 'pending').map(o => String(o.id))
      )

      if (!isFirstLoad.current) {
        const newIds = [...currentPendingIds].filter(id => !prevPendingIds.current.has(id))
        if (newIds.length > 0 && soundEnabled) {
          startAlarm()
          setAlarmOn(true)
          isAlarmingRef.current = true
          showBrowserNotification(
            `☕ ${newIds.length} New Order${newIds.length > 1 ? 's' : ''}!`,
            `${currentPendingIds.size} pending order${currentPendingIds.size > 1 ? 's' : ''} waiting.`
          )
          toast.custom(() => (
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg"
              style={{ background:'#fdf2f4', border:'2px solid #7e2b3f' }}
            >
              <Bell className="animate-bounce" size={20} style={{ color:'#7e2b3f' }} />
              <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:'700', color:'#5a1e2d', fontSize:'0.85rem' }}>
                {newIds.length} new order{newIds.length > 1 ? 's' : ''} arrived!
              </span>
            </div>
          ), { duration: 4000 })
        }
      } else {
        isFirstLoad.current = false
      }

      if (currentPendingIds.size === 0 && isAlarmingRef.current) {
        stopAlarm(); setAlarmOn(false); isAlarmingRef.current = false
      }
      prevPendingIds.current = currentPendingIds
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoading(false)
    }
  }, [soundEnabled])

  useEffect(() => {
    requestNotificationPermission()
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000)
    return () => { clearInterval(interval); stopAlarm() }
  }, [fetchOrders])

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
    stopAlarm(); setAlarmOn(false); isAlarmingRef.current = false
  }

  const handleToggleSound = () => {
    if (soundEnabled && isAlarmingRef.current) {
      stopAlarm(); setAlarmOn(false); isAlarmingRef.current = false
    }
    setSoundEnabled(prev => !prev)
  }

  const handleLogout = () => {
    stopAlarm(); logout(); navigate('/staff/login')
  }

  const filteredOrders = orders.filter(o => {
    if (filter === 'active') return ['pending','preparing'].includes(o.status)
    if (filter === 'ready')  return o.status === 'ready'
    if (filter === 'done')   return ['delivered','cancelled'].includes(o.status)
    return true
  })

  const pendingCount   = orders.filter(o => o.status === 'pending').length
  const preparingCount = orders.filter(o => o.status === 'preparing').length
  const readyCount     = orders.filter(o => o.status === 'ready').length

  return (
    <div className="min-h-screen" style={{ background:'#f8f4f3' }} onClick={unlockAudio}>

      {/* ── Audio Unlock Banner ── */}
      <AnimatePresence>
        {!audioUnlocked && (
          <motion.div
            initial={{ height:0 }} animate={{ height:'auto' }} exit={{ height:0 }}
            className="overflow-hidden"
          >
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer"
              style={{ background:'linear-gradient(90deg, #5a1e2d, #7e2b3f)', borderBottom:'1px solid rgba(201,149,107,0.2)' }}
              onClick={unlockAudio}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background:'rgba(255,255,255,0.1)' }}
                >
                  <Volume2 size={16} style={{ color:'#c9956b' }} className="animate-pulse" />
                </div>
                <span style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.75rem', fontWeight:'600', color:'rgba(255,255,255,0.8)', letterSpacing:'0.05em' }}>
                  Tap anywhere to enable sound alerts & notifications
                </span>
              </div>
              <button
                onClick={unlockAudio}
                className="px-4 py-1.5 rounded-lg transition-all"
                style={{ background:'rgba(201,149,107,0.25)', border:'1px solid rgba(201,149,107,0.4)', fontFamily:'Montserrat,sans-serif', fontSize:'0.7rem', fontWeight:'700', color:'#c9956b', letterSpacing:'0.1em', cursor:'pointer' }}
              >
                ENABLE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Alarm Banner ── */}
      <AnimatePresence>
        {alarmOn && pendingCount > 0 && (
          <motion.div
            initial={{ height:0 }} animate={{ height:'auto' }} exit={{ height:0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3"
              style={{ background:'#c9956b', borderBottom:'1px solid rgba(255,255,255,0.2)' }}
            >
              <div className="flex items-center gap-3">
                <Bell size={20} className="animate-bounce" style={{ color:'#1a0a0e' }} />
                <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:'700', fontSize:'0.85rem', color:'#1a0a0e', letterSpacing:'0.05em' }}>
                  🔔 {pendingCount} order{pendingCount > 1 ? 's' : ''} waiting!
                </span>
              </div>
              <button
                onClick={handleStopAlarm}
                className="px-4 py-1.5 rounded-lg transition-all"
                style={{ background:'rgba(0,0,0,0.15)', fontFamily:'Montserrat,sans-serif', fontSize:'0.7rem', fontWeight:'700', color:'#1a0a0e', letterSpacing:'0.1em', cursor:'pointer', border:'none' }}
              >
                ACKNOWLEDGE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <header style={{ background:'#1a0a0e', padding:'16px', position:'sticky', top:0, zIndex:20 }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Arica Lounge" className="w-9 h-9 rounded-full object-cover"
              style={{ border:'1px solid rgba(201,149,107,0.3)' }} />
            <div>
              <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:'800', color:'#fdf6ee', letterSpacing:'0.15em', fontSize:'0.8rem' }}>ARICA</div>
              <div style={{ fontFamily:'Montserrat,sans-serif', color:'#c9956b', letterSpacing:'0.4em', fontSize:'0.55rem' }}>LOUNGE</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleToggleSound}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ background:'rgba(255,255,255,0.07)' }}
            >
              {soundEnabled
                ? <Volume2 size={17} style={{ color:'#c9956b' }} />
                : <VolumeX size={17} style={{ color:'rgba(255,255,255,0.3)' }} />
              }
            </button>
            <button onClick={fetchOrders}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background:'rgba(255,255,255,0.07)' }}
            >
              <RefreshCw size={17} style={{ color:'rgba(255,255,255,0.4)' }} />
            </button>
            <button onClick={handleLogout}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background:'rgba(255,255,255,0.07)' }}
            >
              <LogOut size={17} style={{ color:'rgba(255,255,255,0.4)' }} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Stats Bar ── */}
      <div style={{ background:'rgba(26,10,14,0.95)', padding:'0 16px 16px' }}>
        <div className="max-w-2xl mx-auto grid grid-cols-3 gap-2">
          {[
            { label:'PENDING',   count:pendingCount,   bg:'rgba(126,43,63,0.3)',  color:'#f4a3b2' },
            { label:'PREPARING', count:preparingCount, bg:'rgba(37,99,235,0.2)',  color:'#93c5fd' },
            { label:'READY',     count:readyCount,     bg:'rgba(22,163,74,0.2)',  color:'#86efac' },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl p-3 text-center" style={{ background:stat.bg }}>
              <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:'800', fontSize:'1.5rem', color:stat.color }}>
                {stat.count}
              </div>
              <div style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.55rem', color:'rgba(255,255,255,0.4)', marginTop:'2px', letterSpacing:'0.2em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm" style={{ border:'1px solid rgba(126,43,63,0.1)' }}>
          {[
            { key:'active', label:`Active (${pendingCount + preparingCount})` },
            { key:'ready',  label:`Ready (${readyCount})`                     },
            { key:'done',   label:'Done'                                       },
            { key:'all',    label:'All'                                        },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className="flex-1 py-2 px-1 rounded-xl transition-all"
              style={{
                fontFamily:'Montserrat,sans-serif', fontSize:'0.7rem', fontWeight:'700',
                letterSpacing:'0.05em', cursor:'pointer', border:'none',
                background: filter === tab.key ? '#7e2b3f' : 'transparent',
                color: filter === tab.key ? '#fdf6ee' : 'rgba(126,43,63,0.4)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Orders List ── */}
      <main className="max-w-2xl mx-auto px-4 py-4 space-y-3 pb-20">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 animate-spin"
              style={{ borderColor:'rgba(126,43,63,0.2)', borderTopColor:'#7e2b3f' }} />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredOrders.length === 0 ? (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-center py-16">
                <div className="text-6xl mb-4">☕</div>
                <p style={{ fontFamily:'Montserrat,sans-serif', color:'#bbb', fontSize:'0.85rem' }}>
                  No orders here
                </p>
                <p style={{ fontFamily:'Montserrat,sans-serif', color:'#ccc', fontSize:'0.72rem', marginTop:'4px' }}>
                  Waiting for new orders...
                </p>
              </motion.div>
            ) : filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} />
            ))}
          </AnimatePresence>
        )}
      </main>
    </div>
  )
}
