import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguageStore, useCartStore } from '../store'

const B = { dark:'#1a0a0e', wine:'#5a1e2d', brand:'#7e2b3f', gold:'#c9956b', cream:'#fdf6ee' }
const fmt = (val) => { const n = parseFloat(val); return isNaN(n) ? '0' : n.toFixed(0) }

const LOCATION_LABELS = {
  salon:     { en:"Men's Salon",        ar:"صالون الرجال"        },
  reception: { en:"Car Care Reception", ar:"استقبال السيارات"    },
}

export default function OrderConfirmation() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { lang }  = useLanguageStore()
  const clearCart = useCartStore(s => s.clearCart)
  const isRTL     = lang === 'ar'
  const order     = location.state?.order

  useEffect(() => { clearCart() }, [])

  if (!order) { navigate('/menu'); return null }

  const locLabel  = LOCATION_LABELS[order.location]?.[lang] || order.location
  const orderItems = Array.isArray(order.items) ? order.items : []
  const orderTotal = parseFloat(order.total) || 0

  return (
    <div dir={isRTL?'rtl':'ltr'} style={{
      minHeight:'100vh',
      background:`linear-gradient(145deg, ${B.dark} 0%, ${B.wine} 55%, ${B.brand} 100%)`,
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'24px 16px', position:'relative', overflow:'hidden',
    }}>
      <style>{`@keyframes ping{0%{transform:scale(1);opacity:1}75%,100%{transform:scale(2.2);opacity:0}}`}</style>

      {/* Rings */}
      {[280,430,580].map(s => (
        <div key={s} style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:s, height:s, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.05)', pointerEvents:'none' }} />
      ))}
      <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:280, height:1, background:'linear-gradient(to right, transparent, rgba(201,149,107,0.5), transparent)' }} />
      <div style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:280, height:1, background:'linear-gradient(to right, transparent, rgba(201,149,107,0.5), transparent)' }} />

      <motion.div
        initial={{ opacity:0, scale:0.93 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.45 }}
        style={{ width:'100%', maxWidth:380, position:'relative', zIndex:10 }}
      >
        {/* Success mark */}
        <motion.div
          initial={{ scale:0 }} animate={{ scale:1 }}
          transition={{ type:'spring', delay:0.2, stiffness:200 }}
          style={{ display:'flex', justifyContent:'center', marginBottom:28 }}
        >
          <div style={{ position:'relative' }}>
            <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(201,149,107,0.15)', animation:'ping 2s ease-out infinite' }} />
            <div style={{
              width:72, height:72, borderRadius:'50%',
              background:'rgba(201,149,107,0.12)',
              border:'1.5px solid rgba(201,149,107,0.5)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              {/* Elegant checkmark — no emoji */}
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M6 14L11.5 19.5L22 9" stroke="#c9956b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div initial={{ y:20, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.35 }} style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, fontSize:'1.4rem', color:B.cream, letterSpacing:'0.1em', textTransform:'uppercase' }}>
            {isRTL ? 'تم الطلب' : 'Order Confirmed'}
          </div>
          <div style={{ height:1, width:48, background:'rgba(201,149,107,0.4)', margin:'10px auto' }} />
          <div style={{ fontFamily: isRTL?'Noto Naskh Arabic,serif':'Montserrat,sans-serif', color:'rgba(201,149,107,0.7)', fontSize:'0.75rem', letterSpacing: isRTL?0:'0.04em' }}>
            {isRTL ? 'سنبدأ تحضير طلبك قريباً' : "We'll start preparing your order shortly"}
          </div>
        </motion.div>

        {/* Card */}
        <motion.div initial={{ y:20, opacity:0 }} animate={{ y:0, opacity:1 }} transition={{ delay:0.45 }} style={{
          background:'rgba(255,255,255,0.07)',
          border:'1px solid rgba(201,149,107,0.2)',
          borderRadius:20, padding:20,
          backdropFilter:'blur(10px)',
          marginBottom:14,
        }}>
          {/* Order # */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:12, marginBottom:12, borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontFamily:'Montserrat,sans-serif', color:'rgba(255,255,255,0.35)', fontSize:'0.6rem', letterSpacing:'0.2em', textTransform:'uppercase' }}>
              {isRTL ? 'رقم الطلب' : 'Order No.'}
            </span>
            <span style={{ fontFamily:'Montserrat,sans-serif', color:B.gold, fontSize:'1.2rem', fontWeight:800 }}>
              #{order.id}
            </span>
          </div>

          {/* Name & Location */}
          {[
            { label: isRTL?'الاسم':'Name',      value: order.customer_name },
            { label: isRTL?'الموقع':'Location',  value: locLabel            },
          ].map(row => (
            <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginBottom:8 }}>
              <span style={{ fontFamily:'Montserrat,sans-serif', color:'rgba(255,255,255,0.3)', fontSize:'0.6rem', letterSpacing:'0.15em', textTransform:'uppercase', flexShrink:0 }}>
                {row.label}
              </span>
              <span style={{ fontFamily: isRTL?'Noto Naskh Arabic,serif':'Montserrat,sans-serif', color:B.cream, fontSize:'0.88rem', fontWeight:600, textAlign: isRTL?'left':'right' }}>
                {row.value}
              </span>
            </div>
          ))}

          {/* Items */}
          {orderItems.length > 0 && (
            <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:12, marginTop:4, marginBottom:12 }}>
              {orderItems.map((item, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <span style={{ fontFamily: isRTL?'Noto Naskh Arabic,serif':'Montserrat,sans-serif', color:'rgba(255,255,255,0.65)', fontSize:'0.82rem' }}>
                    {item.quantity}x {item.menu_item?.name || item.name || '—'}
                  </span>
                  <span style={{ fontFamily:'Montserrat,sans-serif', color:B.gold, fontWeight:600, fontSize:'0.82rem' }}>
                    {fmt(item.subtotal || (parseFloat(item.price||0) * parseInt(item.quantity||1)))} AED
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12, borderTop:'1px solid rgba(201,149,107,0.2)' }}>
            <span style={{ fontFamily:'Montserrat,sans-serif', color:'rgba(255,255,255,0.4)', fontSize:'0.62rem', letterSpacing:'0.18em', textTransform:'uppercase' }}>
              {isRTL ? 'الإجمالي' : 'Total'}
            </span>
            <div>
              <span style={{ fontFamily:'Montserrat,sans-serif', color:B.cream, fontSize:'1.4rem', fontWeight:800 }}>
                {fmt(orderTotal)}
              </span>
              <span style={{ fontFamily:'Montserrat,sans-serif', color:'rgba(255,255,255,0.3)', fontSize:'0.68rem', marginLeft:4 }}>AED</span>
            </div>
          </div>
        </motion.div>

        {/* Estimated time */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }} style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:10,
            padding:'8px 20px', borderRadius:40,
            background:'rgba(201,149,107,0.08)',
            border:'1px solid rgba(201,149,107,0.18)',
          }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:B.gold, opacity:0.7 }} />
            <span style={{ fontFamily: isRTL?'Noto Naskh Arabic,serif':'Montserrat,sans-serif', color:'rgba(255,255,255,0.45)', fontSize:'0.72rem', letterSpacing: isRTL?0:'0.04em' }}>
              {isRTL ? 'الوقت المتوقع: ١٠–١٥ دقيقة' : 'Estimated wait: 10–15 minutes'}
            </span>
          </div>
        </motion.div>

        {/* Button */}
        <motion.button
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.7 }}
          whileTap={{ scale:0.97 }}
          onClick={() => navigate('/menu')}
          style={{
            width:'100%', padding:'16px', borderRadius:16, border:'none', cursor:'pointer',
            background:B.brand, color:B.cream,
            fontFamily:'Montserrat,sans-serif', fontWeight:700,
            fontSize:'0.72rem', letterSpacing:'0.2em', textTransform:'uppercase',
            boxShadow:'0 8px 28px rgba(126,43,63,0.5)',
          }}
        >
          {isRTL ? 'طلب جديد' : 'New Order'}
        </motion.button>

      </motion.div>
    </div>
  )
}
