import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguageStore, useCartStore } from '../store'
import { t } from '../i18n/translations'

const LOCATION_LABELS = {
  en: { salon: "Men's Salon ✂️", reception: "Car Care Reception 🚗" },
  ar: { salon: "صالون الرجال ✂️", reception: "استقبال العناية بالسيارات 🚗" },
}

export default function OrderConfirmation() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const { lang }   = useLanguageStore()
  const clearCart  = useCartStore((s) => s.clearCart)
  const order      = location.state?.order
  const isRTL      = lang === 'ar'

  useEffect(() => {
    clearCart()
  }, [])

  if (!order) {
    navigate('/')
    return null
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ background: 'linear-gradient(145deg, #1a0a0e 0%, #5a1e2d 50%, #7e2b3f 100%)' }}
    >
      {/* Decorative rings */}
      {[300, 460, 620].map(size => (
        <div key={size}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: size, height: size, border: '1px solid rgba(255,255,255,0.05)' }}
        />
      ))}

      {/* Gold shimmer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(201,149,107,0.5), transparent)' }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(201,149,107,0.5), transparent)' }} />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2, duration: 0.7 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            {/* Pulse rings */}
            <div className="absolute inset-0 rounded-full animate-ping"
              style={{ background: 'rgba(201,149,107,0.15)', animationDuration: '2s' }} />
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
              style={{ background: 'rgba(201,149,107,0.15)', border: '2px solid rgba(201,149,107,0.4)' }}
            >
              ✓
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-6"
        >
          <h1 style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '1.6rem',
            fontWeight: '800',
            color: '#fdf6ee',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            {isRTL ? 'تم الطلب!' : 'Order Placed!'}
          </h1>
          <p style={{
            fontFamily: isRTL ? 'Noto Naskh Arabic, serif' : 'Montserrat, sans-serif',
            color: '#c9956b',
            fontSize: '0.8rem',
            marginTop: '6px',
            letterSpacing: isRTL ? '0' : '0.05em',
          }}>
            {isRTL ? 'سنبدأ تحضير طلبك قريباً' : 'We\'ll start preparing your order shortly'}
          </p>
        </motion.div>

        {/* Order Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl p-5 mb-4"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(201,149,107,0.2)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Order number */}
          <div className="flex items-center justify-between mb-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}
          >
            <span style={{
              fontFamily: 'Montserrat, sans-serif',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}>
              {isRTL ? 'رقم الطلب' : 'Order No.'}
            </span>
            <span style={{
              fontFamily: 'Montserrat, sans-serif',
              color: '#c9956b',
              fontSize: '1.2rem',
              fontWeight: '800',
            }}>
              #{order.id}
            </span>
          </div>

          {/* Customer + Location */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span style={{ fontFamily:'Montserrat,sans-serif', color:'rgba(255,255,255,0.35)', fontSize:'0.65rem', letterSpacing:'0.15em', textTransform:'uppercase' }}>
                {isRTL ? 'الاسم' : 'Name'}
              </span>
              <span style={{ fontFamily: isRTL?'Noto Naskh Arabic,serif':'Montserrat,sans-serif', color:'#fdf6ee', fontSize:'0.9rem', fontWeight:'600' }}>
                {order.customer_name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ fontFamily:'Montserrat,sans-serif', color:'rgba(255,255,255,0.35)', fontSize:'0.65rem', letterSpacing:'0.15em', textTransform:'uppercase' }}>
                {isRTL ? 'الموقع' : 'Location'}
              </span>
              <span style={{ fontFamily: isRTL?'Noto Naskh Arabic,serif':'Montserrat,sans-serif', color:'#fdf6ee', fontSize:'0.85rem', fontWeight:'500' }}>
                {LOCATION_LABELS[lang]?.[order.location] || order.location}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-1.5 mb-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}
          >
            {(order.items || []).map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <span style={{ fontFamily: isRTL?'Noto Naskh Arabic,serif':'Montserrat,sans-serif', color:'rgba(255,255,255,0.7)', fontSize:'0.85rem' }}>
                  {item.quantity}× {item.menu_item?.name || item.name}
                </span>
                <span style={{ fontFamily:'Montserrat,sans-serif', color:'#c9956b', fontSize:'0.85rem', fontWeight:'600' }}>
                  {item.subtotal || item.price * item.quantity} AED
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center"
            style={{ borderTop: '1px solid rgba(201,149,107,0.2)', paddingTop: '12px' }}
          >
            <span style={{ fontFamily:'Montserrat,sans-serif', color:'rgba(255,255,255,0.5)', fontSize:'0.7rem', letterSpacing:'0.15em', textTransform:'uppercase' }}>
              {isRTL ? 'الإجمالي' : 'Total'}
            </span>
            <span style={{ fontFamily:'Montserrat,sans-serif', color:'#fdf6ee', fontSize:'1.3rem', fontWeight:'800' }}>
              {order.total} <span style={{ fontSize:'0.75rem', fontWeight:'400', color:'rgba(255,255,255,0.4)' }}>AED</span>
            </span>
          </div>
        </motion.div>

        {/* Estimated time */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: 'rgba(201,149,107,0.1)', border: '1px solid rgba(201,149,107,0.2)' }}
          >
            <span style={{ color:'#c9956b', fontSize:'0.8rem' }}>⏱</span>
            <span style={{ fontFamily:'Montserrat,sans-serif', color:'rgba(255,255,255,0.6)', fontSize:'0.75rem', letterSpacing:'0.05em' }}>
              {isRTL ? 'الوقت المتوقع: ١٠-١٥ دقيقة' : 'Estimated: 10–15 minutes'}
            </span>
          </div>
        </motion.div>

        {/* New Order Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={() => navigate('/menu')}
          className="w-full py-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: '#7e2b3f',
            color: '#fdf6ee',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: '700',
            fontSize: '0.75rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            border: '1px solid rgba(201,149,107,0.2)',
            boxShadow: '0 8px 24px rgba(126,43,63,0.4)',
            cursor: 'pointer',
          }}
        >
          {isRTL ? '+ طلب جديد' : '+ NEW ORDER'}
        </motion.button>

      </motion.div>
    </div>
  )
}
