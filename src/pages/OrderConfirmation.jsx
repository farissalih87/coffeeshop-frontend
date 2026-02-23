import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguageStore, useCartStore } from '../store'

const B = {
  dark:  '#1a0a0e',
  wine:  '#5a1e2d',
  brand: '#7e2b3f',
  gold:  '#c9956b',
  cream: '#fdf6ee',
}

const fmt = (val) => {
  const n = parseFloat(val)
  return isNaN(n) ? '0' : n.toFixed(0)
}

const LOCATION_LABELS = {
  salon:     { en:"Men's Salon ✂️",        ar:"صالون الرجال ✂️"        },
  reception: { en:"Car Care Reception 🚗",  ar:"استقبال السيارات 🚗"    },
}

export default function OrderConfirmation() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { lang }  = useLanguageStore()
  const clearCart = useCartStore(s => s.clearCart)
  const isRTL     = lang === 'ar'
  const order     = location.state?.order

  useEffect(() => {
    clearCart()
  }, [])

  if (!order) {
    navigate('/menu')
    return null
  }

  const locLabel = LOCATION_LABELS[order.location]?.[lang] || order.location
  const orderItems = Array.isArray(order.items) ? order.items : []
  const orderTotal = parseFloat(order.total) || 0

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        minHeight:'100vh',
        background:`linear-gradient(145deg, ${B.dark} 0%, ${B.wine} 55%, ${B.brand} 100%)`,
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'24px 16px', position:'relative', overflow:'hidden',
      }}
    >
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes ping{0%{transform:scale(1);opacity:1}75%,100%{transform:scale(2);opacity:0}}
      `}</style>

      {/* Rings */}
      {[280,430,580].map(s => (
        <div key={s} style={{
          position:'absolute', top:'50%', left:'50%',
          transform:'translate(-50%,-50%)',
          width:s, height:s, borderRadius:'50%',
          border:'1px solid rgba(255,255,255,0.05)', pointerEvents:'none',
        }} />
      ))}
      <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:280, height:1, background:'linear-gradient(to right, transparent, rgba(201,149,107,0.5), transparent)' }} />
      <div style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:280, height:1, background:'linear-gradient(to right, transparent, rgba(201,149,107,0.5), transparent)' }} />

      <motion.div
        initial={{ opacity:0, scale:0.93 }}
        animate={{ opacity:1, scale:1 }}
        transition={{ duration:0.45 }}
        style={{ width:'100%', maxWidth:380, position:'relative', zIndex:10 }}
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale:0 }}
          animate={{ scale:1 }}
          transition={{ type:'spring', delay:0.2, stiffness:200 }}
          style={{ display:'flex', justifyContent:'center', marginBottom:24 }}
        >
          <div style={{ position:'relative' }}>
            <div style={{
              position:'absolute', inset:0, borderRadius:'50%',
              background:'rgba(201,149,107,0.2)',
              animation:'ping 2s ease-out infinite',
            }} />
            <div style={{
              width:72, height:72, borderRadius:'50%',
              background:'rgba(201,149,107,0.15)',
              border:'2px solid rgba(201,149,107,0.5)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:30, color:B.cream,
            }}>
              ✓
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y:20, opacity:0 }}
          animate={{ y:0, opacity:1 }}
          transition={{ delay:0.35 }}
          style={{ textAlign:'center', marginBottom:20 }}
        >
          <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, fontSize:'1.5rem', color:B.cream, letterSpacing:'0.08em', textTransform:'uppercase' }}>
            {isRTL ? 'تم الطلب!' : 'Order Placed!'}
          </div>
          <div style={{ fontFamily: isRTL?'Noto Naskh Arabic,serif':'Montserrat,sans-serif', color:B.gold, fontSize:'0.78rem', marginTop:6 }}>
            {isRTL ? 'سنبدأ تحضير طلبك قريباً' : "We'll start preparing your order shortly"}
          </div>
        </motion.div>

        {/* Order Card */}
        <motion.div
          initial={{ y:20, opacity:0 }}
          animate={{ y:0, opacity:1 }}
          transition={{ delay:0.45 }}
          style={{
            background:'rgba(255,255,255,0.08)',
            border:'1px solid rgba(201,149,107,0.2)',
            borderRadius:20, padding:20,
            backdropFilter:'blur(10px)',
            marginBottom:14,
          }}
        >
          {/* Order # */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:12, marginBottom:12, borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontFamily:'Montserrat,sans-serif', color:'rgba(255,255,255,0.4)', fontSize:'0.62rem', letterSpacing:'0.2em', textTransform:'uppercase' }}>
              {isRTL ? 'رقم الطلب' : 'ORDER NO.'}
            </span>
            <span style={{ fontFamily:'Montserrat,sans-serif', color:B.gold, fontSize:'1.3rem', fontWeight:800 }}>
              #{order.id}
            </span>
          </div>

          {/* Name & Location */}
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:12 }}>
            {[
              { label: isRTL?'الاسم':'NAME',      value: order.customer_name },
              { label: isRTL?'الموقع':'LOCATION',  value: locLabel            },
            ].map(row => (
              <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
                <span style={{ fontFamily:'Montserrat,sans-serif', color:'rgba(255,255,255,0.35)', fontSize:'0.6rem', letterSpacing:'0.15em', textTransform:'uppercase', flexShrink:0 }}>
                  {row.label}
                </span>
                <span style={{ fontFamily: isRTL?'Noto Naskh Arabic,serif':'Montserrat,sans-serif', color:B.cream, fontSize:'0.88rem', fontWeight:600, textAlign: isRTL?'left':'right' }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Items */}
          {orderItems.length > 0 && (
            <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:12, marginBottom:12 }}>
              {orderItems.map((item, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <span style={{ fontFamily: isRTL?'Noto Naskh Arabic,serif':'Montserrat,sans-serif', color:'rgba(255,255,255,0.7)', fontSize:'0.83rem' }}>
                    {item.quantity}× {item.menu_item?.name || item.name || '—'}
                  </span>
                  <span style={{ fontFamily:'Montserrat,sans-serif', color:B.gold, fontWeight:700, fontSize:'0.83rem' }}>
                    {fmt(item.subtotal || (parseFloat(item.price||0) * parseInt(item.quantity||1)))} AED
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12, borderTop:'1px solid rgba(201,149,107,0.25)' }}>
            <span style={{ fontFamily:'Montserrat,sans-serif', color:'rgba(255,255,255,0.5)', fontSize:'0.65rem', letterSpacing:'0.15em', textTransform:'uppercase' }}>
              {isRTL ? 'الإجمالي' : 'TOTAL'}
            </span>
            <div>
              <span style={{ fontFamily:'Montserrat,sans-serif', color:B.cream, fontSize:'1.4rem', fontWeight:800 }}>
                {fmt(orderTotal)}
              </span>
              <span style={{ fontFamily:'Montserrat,sans-serif', color:'rgba(255,255,255,0.35)', fontSize:'0.7rem', marginLeft:4 }}>
                AED
              </span>
            </div>
          </div>
        </motion.div>

        {/* Estimated time */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }} style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:8,
            padding:'8px 18px', borderRadius:40,
            background:'rgba(201,149,107,0.1)',
            border:'1px solid rgba(201,149,107,0.2)',
          }}>
            <span>⏱</span>
            <span style={{ fontFamily: isRTL?'Noto Naskh Arabic,serif':'Montserrat,sans-serif', color:'rgba(255,255,255,0.55)', fontSize:'0.75rem' }}>
              {isRTL ? 'الوقت المتوقع: ١٠–١٥ دقيقة' : 'Estimated: 10–15 minutes'}
            </span>
          </div>
        </motion.div>

        {/* Button */}
        <motion.button
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ delay:0.7 }}
          whileTap={{ scale:0.97 }}
          onClick={() => navigate('/menu')}
          style={{
            width:'100%', padding:'16px', borderRadius:16, border:'none', cursor:'pointer',
            background:B.brand, color:B.cream,
            fontFamily:'Montserrat,sans-serif', fontWeight:700,
            fontSize:'0.75rem', letterSpacing:'0.18em', textTransform:'uppercase',
            boxShadow:'0 8px 28px rgba(126,43,63,0.5)',
          }}
        >
          {isRTL ? '+ طلب جديد' : '+ NEW ORDER'}
        </motion.button>

      </motion.div>
    </div>
  )
}
