import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, MapPin, LogOut, RefreshCw, Volume2, VolumeX, X } from 'lucide-react'
import { useAuthStore } from '../store'
import { orderApi } from '../api'
import { startAlarm, stopAlarm, requestNotificationPermission, showBrowserNotification } from '../utils/sound'
import toast from 'react-hot-toast'

const B = { dark:'#1a0a0e', wine:'#5a1e2d', brand:'#7e2b3f', gold:'#c9956b', cream:'#fdf6ee' }

const STATUS = {
  pending:   { label:'Pending',   bg:'rgba(126,43,63,0.1)',  text:'#7e2b3f'  },
  preparing: { label:'Preparing', bg:'rgba(37,99,235,0.08)', text:'#1d4ed8'  },
  ready:     { label:'Ready',     bg:'rgba(22,163,74,0.08)', text:'#15803d'  },
  delivered: { label:'Delivered', bg:'rgba(0,0,0,0.05)',     text:'#888'     },
  cancelled: { label:'Cancelled', bg:'rgba(220,38,38,0.07)', text:'#dc2626'  },
}

const LOCS = {
  salon:     { en:"Men's Salon",        ar:"صالون الرجال"     },
  reception: { en:"Car Care Reception", ar:"استقبال السيارات" },
}

// ── Order Card ─────────────────────────────────────────────────────────────────
function OrderCard({ order, onUpdate }) {
  const cfg      = STATUS[order.status] || STATUS.pending
  const isNew    = order.status === 'pending'
  const nextStep = { pending:'preparing', preparing:'ready', ready:'delivered' }[order.status]
  const nextLabel = { preparing:'Start Preparing', ready:'Mark Ready', delivered:'Mark Delivered' }[nextStep]

  return (
    <motion.div layout initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
      style={{
        background:'white', borderRadius:18, padding:18,
        border: isNew ? `1.5px solid ${B.brand}` : '1px solid rgba(126,43,63,0.08)',
        boxShadow: isNew ? '0 4px 24px rgba(126,43,63,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {isNew && (
        <div style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.58rem', fontWeight:700, color:B.brand, letterSpacing:'0.25em', textTransform:'uppercase', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:B.brand, animation:'pulse 1.5s ease-in-out infinite' }} />
          New Order
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, fontSize:'1.1rem', color:B.dark }}>
              #{order.id}
            </span>
            <span style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.62rem', fontWeight:600, padding:'3px 10px', borderRadius:20, background:cfg.bg, color:cfg.text, letterSpacing:'0.1em', textTransform:'uppercase' }}>
              {cfg.label}
            </span>
          </div>
          <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:600, color:B.dark, fontSize:'0.9rem' }}>
            {order.customer_name}
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, color:B.brand, fontSize:'1rem' }}>
            {order.total} AED
          </div>
          <div style={{ fontFamily:'Montserrat,sans-serif', color:'#bbb', fontSize:'0.68rem', marginTop:2 }}>
            {new Date(order.created_at).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}
          </div>
        </div>
      </div>

      {/* Items */}
      <div style={{ background:'rgba(126,43,63,0.04)', borderRadius:12, padding:'10px 12px', marginBottom:12 }}>
        {(order.items || []).map((item, i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: i < order.items.length-1 ? 6 : 0 }}>
            <span style={{ fontFamily:'Montserrat,sans-serif', color:'#444', fontSize:'0.82rem' }}>
              {item.quantity}x {item.menu_item?.name || item.name}
            </span>
            <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:600, color:B.brand, fontSize:'0.8rem' }}>
              {item.subtotal || item.price * item.quantity} AED
            </span>
          </div>
        ))}
        {order.notes && (
          <div style={{ fontFamily:'Montserrat,sans-serif', color:'#aaa', fontSize:'0.72rem', fontStyle:'italic', paddingTop:8, marginTop:6, borderTop:'1px solid rgba(126,43,63,0.07)' }}>
            Note: "{order.notes}"
          </div>
        )}
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <MapPin size={12} color={B.brand} />
          <span style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.72rem', fontWeight:500, color:'#555' }}>
            {LOCS[order.location]?.en || order.location}
          </span>
        </div>
        {nextStep && (
          <button onClick={() => onUpdate(order.id, nextStep)} style={{
            padding:'8px 16px', borderRadius:10, border:'none', cursor:'pointer',
            background:B.brand, color:B.cream,
            fontFamily:'Montserrat,sans-serif', fontWeight:700, fontSize:'0.68rem',
            letterSpacing:'0.1em', textTransform:'uppercase',
            boxShadow:'0 4px 12px rgba(126,43,63,0.3)',
          }}>
            {nextLabel}
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function StaffDashboard() {
  const navigate          = useNavigate()
  const { user, logout }  = useAuthStore()
  const [orders, setOrders]             = useState([])
  const [filter, setFilter]             = useState('active')
  const [alarmOn, setAlarmOn]           = useState(false)
  const [soundOn, setSoundOn]           = useState(true)
  const [loading, setLoading]           = useState(true)
  const [audioUnlocked, setAudioUnlocked] = useState(false)
  const prevIds   = useRef(new Set())
  const alarming  = useRef(false)
  const firstLoad = useRef(true)

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
      const res     = await orderApi.getAll()
      const fetched = res.data.orders || []
      setOrders(fetched)

      const pendingIds = new Set(fetched.filter(o => o.status==='pending').map(o => String(o.id)))

      if (!firstLoad.current) {
        const newIds = [...pendingIds].filter(id => !prevIds.current.has(id))
        if (newIds.length > 0 && soundOn) {
          startAlarm(); setAlarmOn(true); alarming.current = true
          showBrowserNotification(`${newIds.length} New Order${newIds.length>1?'s':''}`, `${pendingIds.size} pending order${pendingIds.size>1?'s':''} waiting.`)
          toast.success(`${newIds.length} new order${newIds.length>1?'s':''} arrived`, { duration:4000 })
        }
      } else { firstLoad.current = false }

      if (pendingIds.size === 0 && alarming.current) {
        stopAlarm(); setAlarmOn(false); alarming.current = false
      }
      prevIds.current = pendingIds
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [soundOn])

  useEffect(() => {
    requestNotificationPermission()
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000)
    return () => { clearInterval(interval); stopAlarm() }
  }, [fetchOrders])

  const handleUpdate = async (id, status) => {
    setOrders(prev => prev.map(o => o.id===id ? { ...o, status } : o))
    try { await orderApi.updateStatus(id, status); fetchOrders() }
    catch { toast.error('Failed to update'); fetchOrders() }
  }

  const pendingCount   = orders.filter(o => o.status==='pending').length
  const preparingCount = orders.filter(o => o.status==='preparing').length
  const readyCount     = orders.filter(o => o.status==='ready').length

  const filtered = orders.filter(o => {
    if (filter==='active') return ['pending','preparing'].includes(o.status)
    if (filter==='ready')  return o.status==='ready'
    if (filter==='done')   return ['delivered','cancelled'].includes(o.status)
    return true
  })

  return (
    <div style={{ minHeight:'100vh', background:'#f8f5f4' }} onClick={unlockAudio}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* Audio unlock banner */}
      <AnimatePresence>
        {!audioUnlocked && (
          <motion.div initial={{ height:0 }} animate={{ height:'auto' }} exit={{ height:0 }} style={{ overflow:'hidden' }}>
            <div onClick={unlockAudio} style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'12px 20px', cursor:'pointer',
              background:`linear-gradient(90deg, ${B.wine}, ${B.brand})`,
              borderBottom:'1px solid rgba(201,149,107,0.2)',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <Volume2 size={16} color={B.gold} />
                <span style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.72rem', color:'rgba(255,255,255,0.75)', letterSpacing:'0.05em' }}>
                  Tap to enable sound alerts
                </span>
              </div>
              <button onClick={unlockAudio} style={{
                padding:'5px 14px', borderRadius:8,
                background:'rgba(201,149,107,0.2)', border:'1px solid rgba(201,149,107,0.35)',
                fontFamily:'Montserrat,sans-serif', fontSize:'0.62rem', fontWeight:700,
                color:B.gold, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer',
              }}>Enable</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alarm banner */}
      <AnimatePresence>
        {alarmOn && pendingCount > 0 && (
          <motion.div initial={{ height:0 }} animate={{ height:'auto' }} exit={{ height:0 }} style={{ overflow:'hidden' }}>
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'12px 20px', background:B.gold,
              borderBottom:'1px solid rgba(255,255,255,0.15)',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <Bell size={16} color={B.dark} />
                <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:700, fontSize:'0.8rem', color:B.dark, letterSpacing:'0.06em' }}>
                  {pendingCount} order{pendingCount>1?'s':''} waiting
                </span>
              </div>
              <button onClick={() => { stopAlarm(); setAlarmOn(false); alarming.current=false }} style={{
                padding:'5px 14px', borderRadius:8,
                background:'rgba(0,0,0,0.12)', border:'none',
                fontFamily:'Montserrat,sans-serif', fontSize:'0.62rem', fontWeight:700,
                color:B.dark, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer',
              }}>Dismiss</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ background:B.dark, padding:'14px 16px', position:'sticky', top:0, zIndex:20 }}>
        <div style={{ maxWidth:680, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <img src="/logo.jpg" alt="Arica Lounge" style={{ width:34, height:34, borderRadius:'50%', objectFit:'cover', border:'1.5px solid rgba(201,149,107,0.35)' }} />
            <div>
              <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, color:B.cream, letterSpacing:'0.15em', fontSize:'0.75rem' }}>ARICA</div>
              <div style={{ fontFamily:'Montserrat,sans-serif', color:B.gold, letterSpacing:'0.4em', fontSize:'0.47rem', marginTop:1 }}>LOUNGE</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {[
              { icon: soundOn ? <Volume2 size={16}/> : <VolumeX size={16}/>, action: () => { if(soundOn && alarming.current){stopAlarm();setAlarmOn(false);alarming.current=false} setSoundOn(p=>!p) }, color: soundOn ? B.gold : 'rgba(255,255,255,0.25)' },
              { icon: <RefreshCw size={16}/>, action: fetchOrders, color:'rgba(255,255,255,0.35)' },
              { icon: <LogOut size={16}/>,    action: () => { stopAlarm(); logout(); navigate('/staff/login') }, color:'rgba(255,255,255,0.35)' },
            ].map((btn, i) => (
              <button key={i} onClick={btn.action} style={{ width:34, height:34, borderRadius:10, background:'rgba(255,255,255,0.06)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:btn.color }}>
                {btn.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background:'rgba(26,10,14,0.97)', padding:'0 16px 14px' }}>
        <div style={{ maxWidth:680, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
          {[
            { label:'Pending',   count:pendingCount,   bg:'rgba(126,43,63,0.3)',  color:'#f4a3b2' },
            { label:'Preparing', count:preparingCount, bg:'rgba(37,99,235,0.2)',  color:'#93c5fd' },
            { label:'Ready',     count:readyCount,     bg:'rgba(22,163,74,0.18)', color:'#86efac' },
          ].map(s => (
            <div key={s.label} style={{ borderRadius:12, padding:'10px 8px', textAlign:'center', background:s.bg }}>
              <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, fontSize:'1.5rem', color:s.color, lineHeight:1 }}>{s.count}</div>
              <div style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.55rem', color:'rgba(255,255,255,0.35)', marginTop:3, letterSpacing:'0.2em', textTransform:'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ maxWidth:680, margin:'0 auto', padding:'14px 16px 0' }}>
        <div style={{ display:'flex', gap:4, background:'white', borderRadius:14, padding:4, border:'1px solid rgba(126,43,63,0.08)', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
          {[
            { key:'active', label:`Active (${pendingCount+preparingCount})` },
            { key:'ready',  label:`Ready (${readyCount})` },
            { key:'done',   label:'Done' },
            { key:'all',    label:'All' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
              flex:1, padding:'8px 4px', borderRadius:10, border:'none', cursor:'pointer',
              fontFamily:'Montserrat,sans-serif', fontSize:'0.65rem', fontWeight:700,
              letterSpacing:'0.06em', textTransform:'uppercase',
              background: filter===tab.key ? B.brand : 'transparent',
              color: filter===tab.key ? B.cream : 'rgba(126,43,63,0.35)',
              transition:'all 0.2s',
            }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      <div style={{ maxWidth:680, margin:'0 auto', padding:'12px 16px 80px', display:'flex', flexDirection:'column', gap:10 }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', paddingTop:60 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', border:`3px solid rgba(126,43,63,0.15)`, borderTopColor:B.brand, animation:'spin 0.8s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', paddingTop:60 }}>
            <div style={{ fontFamily:'Montserrat,sans-serif', color:'rgba(126,43,63,0.2)', fontSize:'0.6rem', letterSpacing:'0.35em', textTransform:'uppercase', marginBottom:8 }}>— No Orders —</div>
            <div style={{ fontFamily:'Montserrat,sans-serif', color:'#bbb', fontSize:'0.82rem' }}>Waiting for new orders...</div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map(order => <OrderCard key={order.id} order={order} onUpdate={handleUpdate} />)}
          </AnimatePresence>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
