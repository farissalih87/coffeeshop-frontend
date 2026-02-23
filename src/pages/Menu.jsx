import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Plus, Minus, X, MapPin, ChevronDown } from 'lucide-react'
import { useLanguageStore, useCartStore } from '../store'
import { menuApi, orderApi } from '../api'
import { t } from '../i18n/translations'
import toast from 'react-hot-toast'

// ─── Item Card ────────────────────────────────────────────────────────────────
function ItemCard({ item, lang, onAdd }) {
  const isRTL = lang === 'ar'
  const name  = isRTL && item.name_ar ? item.name_ar : item.name
  const desc  = isRTL && item.description_ar ? item.description_ar : item.description

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
      style={{ border: '1px solid rgba(126,43,63,0.08)' }}
    >
      {/* Image / Emoji */}
      <div className="h-28 flex items-center justify-center text-5xl"
        style={{ background: 'linear-gradient(135deg, #fdf2f4, #f5e6e8)' }}
      >
        {item.image
          ? <img src={item.image} alt={name} className="h-full w-full object-cover" />
          : (item.category?.icon || '☕')
        }
      </div>

      <div className="p-3 flex flex-col flex-1" dir={isRTL ? 'rtl' : 'ltr'}>
        <h3 style={{
          fontFamily: isRTL ? 'Noto Naskh Arabic, serif' : 'Montserrat, sans-serif',
          fontWeight: '700',
          color: '#1a0a0e',
          fontSize: '0.9rem',
          lineHeight: 1.2,
        }}>
          {name}
        </h3>
        {desc && (
          <p style={{
            fontFamily: isRTL ? 'Noto Naskh Arabic, serif' : 'Montserrat, sans-serif',
            color: '#999',
            fontSize: '0.72rem',
            marginTop: '4px',
            lineHeight: 1.4,
            flexGrow: 1,
          }}>
            {desc}
          </p>
        )}
        <div className="flex items-center justify-between mt-3">
          <span style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: '800',
            color: '#7e2b3f',
            fontSize: '1rem',
          }}>
            {item.price} <span style={{ fontSize:'0.65rem', fontWeight:'400', color:'#aaa' }}>AED</span>
          </span>
          <button
            onClick={() => onAdd(item)}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            style={{
              background: '#7e2b3f',
              color: '#fdf6ee',
              boxShadow: '0 4px 12px rgba(126,43,63,0.35)',
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────
function CartDrawer({ isOpen, onClose, lang, onCheckout }) {
  const { items, updateQty, removeItem, total } = useCartStore()
  const isRTL = lang === 'ar'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: isRTL ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-y-0 w-80 z-50 flex flex-col shadow-2xl"
            style={{ [isRTL ? 'left' : 'right']: 0, background: '#fdf6ee' }}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(126,43,63,0.1)', background: '#1a0a0e' }}
            >
              <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:'700', color:'#fdf6ee', letterSpacing:'0.1em', fontSize:'0.85rem' }}>
                {isRTL ? 'السلة' : 'YOUR ORDER'}
              </span>
              <button onClick={onClose} style={{ color:'rgba(255,255,255,0.4)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-3">🛒</div>
                  <p style={{ fontFamily:'Montserrat,sans-serif', color:'#aaa', fontSize:'0.85rem' }}>
                    {isRTL ? 'السلة فارغة' : 'Your cart is empty'}
                  </p>
                </div>
              ) : items.map(item => (
                <div key={item.id} className="bg-white rounded-2xl p-3 flex items-center gap-3"
                  style={{ border:'1px solid rgba(126,43,63,0.08)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: isRTL?'Noto Naskh Arabic,serif':'Montserrat,sans-serif', fontWeight:'600', fontSize:'0.85rem', color:'#1a0a0e' }}>
                      {isRTL && item.name_ar ? item.name_ar : item.name}
                    </p>
                    <p style={{ fontFamily:'Montserrat,sans-serif', color:'#7e2b3f', fontWeight:'700', fontSize:'0.85rem', marginTop:'2px' }}>
                      {(item.price * item.quantity).toFixed(0)} AED
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background:'rgba(126,43,63,0.1)', color:'#7e2b3f' }}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:'700', fontSize:'0.9rem', minWidth:'20px', textAlign:'center' }}>
                      {item.quantity}
                    </span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{ background:'#7e2b3f', color:'#fdf6ee' }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.id)} style={{ color:'#ccc' }}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4" style={{ borderTop:'1px solid rgba(126,43,63,0.1)' }}>
                <div className="flex justify-between items-center mb-4">
                  <span style={{ fontFamily:'Montserrat,sans-serif', color:'#888', fontSize:'0.75rem', letterSpacing:'0.1em', textTransform:'uppercase' }}>
                    {isRTL ? 'الإجمالي' : 'TOTAL'}
                  </span>
                  <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:'800', fontSize:'1.3rem', color:'#1a0a0e' }}>
                    {total.toFixed(0)} AED
                  </span>
                </div>
                <button
                  onClick={onCheckout}
                  className="w-full py-4 rounded-2xl transition-all hover:-translate-y-0.5"
                  style={{
                    background:'#7e2b3f', color:'#fdf6ee',
                    fontFamily:'Montserrat,sans-serif', fontWeight:'700',
                    fontSize:'0.75rem', letterSpacing:'0.2em', textTransform:'uppercase',
                    boxShadow:'0 8px 24px rgba(126,43,63,0.35)',
                    cursor:'pointer', border:'none',
                  }}
                >
                  {isRTL ? 'تأكيد الطلب ←' : 'CHECKOUT →'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Checkout Modal ───────────────────────────────────────────────────────────
function CheckoutModal({ isOpen, onClose, lang, onSubmit, loading }) {
  const [name, setName]         = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes]       = useState('')
  const isRTL = lang === 'ar'

  const LOCATIONS = [
    { value: 'salon',     label: isRTL ? "صالون الرجال ✂️" : "Men's Salon ✂️"          },
    { value: 'reception', label: isRTL ? "استقبال السيارات 🚗" : "Car Care Reception 🚗" },
  ]

  const handleSubmit = () => {
    if (!name.trim()) return toast.error(isRTL ? 'أدخل اسمك' : 'Please enter your name')
    if (!location)    return toast.error(isRTL ? 'اختر الموقع' : 'Please select your location')
    onSubmit({ name, location, notes })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-0 inset-x-0 z-50 rounded-t-3xl p-6"
            style={{ background: '#fdf6ee', maxHeight: '85vh', overflowY: 'auto' }}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="w-10 h-1 rounded-full bg-gray-200 mx-auto mb-5" />

            <h2 style={{ fontFamily:'Montserrat,sans-serif', fontWeight:'800', fontSize:'1.2rem', color:'#1a0a0e', letterSpacing:'0.05em', marginBottom:'20px' }}>
              {isRTL ? 'تفاصيل الطلب' : 'ORDER DETAILS'}
            </h2>

            {/* Name */}
            <div className="mb-4">
              <label style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.65rem', color:'#888', letterSpacing:'0.2em', textTransform:'uppercase', display:'block', marginBottom:'8px' }}>
                {isRTL ? 'الاسم' : 'YOUR NAME'}
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={isRTL ? 'اكتب اسمك...' : 'Enter your name...'}
                className="w-full rounded-xl px-4 py-3 outline-none transition-all"
                style={{
                  fontFamily: isRTL?'Noto Naskh Arabic,serif':'Montserrat,sans-serif',
                  background:'white', border:'1.5px solid rgba(126,43,63,0.15)',
                  fontSize:'0.95rem', color:'#1a0a0e',
                }}
                onFocus={e => e.target.style.borderColor = '#7e2b3f'}
                onBlur={e => e.target.style.borderColor = 'rgba(126,43,63,0.15)'}
              />
            </div>

            {/* Location */}
            <div className="mb-4">
              <label style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.65rem', color:'#888', letterSpacing:'0.2em', textTransform:'uppercase', display:'block', marginBottom:'8px' }}>
                {isRTL ? 'موقعك' : 'YOUR LOCATION'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {LOCATIONS.map(loc => (
                  <button
                    key={loc.value}
                    onClick={() => setLocation(loc.value)}
                    className="py-3 px-3 rounded-xl transition-all duration-200 text-center"
                    style={{
                      fontFamily: isRTL?'Noto Naskh Arabic,serif':'Montserrat,sans-serif',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      border: location === loc.value ? '2px solid #7e2b3f' : '1.5px solid rgba(126,43,63,0.15)',
                      background: location === loc.value ? '#7e2b3f' : 'white',
                      color: location === loc.value ? '#fdf6ee' : '#555',
                      cursor: 'pointer',
                    }}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.65rem', color:'#888', letterSpacing:'0.2em', textTransform:'uppercase', display:'block', marginBottom:'8px' }}>
                {isRTL ? 'ملاحظات (اختياري)' : 'NOTES (OPTIONAL)'}
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={isRTL ? 'مثال: بدون سكر...' : 'e.g. No sugar, extra hot...'}
                rows={2}
                className="w-full rounded-xl px-4 py-3 outline-none resize-none transition-all"
                style={{
                  fontFamily: isRTL?'Noto Naskh Arabic,serif':'Montserrat,sans-serif',
                  background:'white', border:'1.5px solid rgba(126,43,63,0.15)',
                  fontSize:'0.9rem', color:'#1a0a0e',
                }}
                onFocus={e => e.target.style.borderColor = '#7e2b3f'}
                onBlur={e => e.target.style.borderColor = 'rgba(126,43,63,0.15)'}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:-translate-y-0.5"
              style={{
                background:'#7e2b3f', color:'#fdf6ee',
                fontFamily:'Montserrat,sans-serif', fontWeight:'700',
                fontSize:'0.75rem', letterSpacing:'0.2em', textTransform:'uppercase',
                border:'none', cursor:'pointer',
                boxShadow:'0 8px 24px rgba(126,43,63,0.35)',
              }}
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : (isRTL ? 'تأكيد الطلب ✓' : 'PLACE ORDER ✓')
              }
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Main Menu Page ───────────────────────────────────────────────────────────
export default function Menu() {
  const navigate = useNavigate()
  const { lang } = useLanguageStore()
  const { items: cartItems, addItem, total, count } = useCartStore()
  const isRTL = lang === 'ar'

  const [categories,   setCategories]   = useState([])
  const [menuItems,    setMenuItems]     = useState([])
  const [activeCat,    setActiveCat]     = useState(null)
  const [cartOpen,     setCartOpen]      = useState(false)
  const [checkoutOpen, setCheckoutOpen]  = useState(false)
  const [loading,      setLoading]       = useState(true)
  const [submitting,   setSubmitting]    = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, itemRes] = await Promise.all([
          menuApi.getCategories(),
          menuApi.getAllItems(),
        ])
        const cats = catRes.data.categories || []
        setCategories(cats)
        setMenuItems(itemRes.data.items || [])
        if (cats.length > 0) setActiveCat(cats[0].id)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = activeCat
    ? menuItems.filter(i => i.category_id === activeCat && i.available)
    : menuItems.filter(i => i.available)

  const handleAdd = (item) => {
    addItem(item)
    toast.success(
      isRTL ? `تمت الإضافة: ${item.name_ar || item.name}` : `Added: ${item.name}`,
      { icon: '✓', style: { fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem' } }
    )
  }

  const handlePlaceOrder = async ({ name, location, notes }) => {
    setSubmitting(true)
    try {
      const payload = {
        customer_name: name,
        location,
        notes,
        lang,
        items: cartItems.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
      }
      const res = await orderApi.place(payload)
      setCheckoutOpen(false)
      setCartOpen(false)
      navigate('/order-confirmation', { state: { order: res.data.order } })
    } catch (e) {
      toast.error(isRTL ? 'حدث خطأ، حاول مجدداً' : 'Failed to place order, please try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#fdf6ee' }} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Header */}
      <header style={{ background: '#1a0a0e', padding: '16px' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Arica Lounge" className="w-9 h-9 rounded-full object-cover"
              style={{ border:'1px solid rgba(201,149,107,0.4)' }} />
            <div>
              <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:'800', color:'#fdf6ee', letterSpacing:'0.15em', fontSize:'0.85rem' }}>ARICA</div>
              <div style={{ fontFamily:'Montserrat,sans-serif', color:'#c9956b', letterSpacing:'0.4em', fontSize:'0.55rem' }}>LOUNGE</div>
            </div>
          </div>
          {/* Cart button */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5"
            style={{ background:'#7e2b3f', border:'1px solid rgba(201,149,107,0.2)', boxShadow:'0 4px 16px rgba(126,43,63,0.4)' }}
          >
            <ShoppingCart size={18} style={{ color:'#fdf6ee' }} />
            <span style={{ fontFamily:'Montserrat,sans-serif', color:'#fdf6ee', fontWeight:'700', fontSize:'0.8rem' }}>
              {isRTL ? 'السلة' : 'Cart'}
            </span>
            {count > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background:'#c9956b' }}
              >
                <span style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.65rem', fontWeight:'800', color:'#1a0a0e' }}>
                  {count}
                </span>
              </div>
            )}
          </button>
        </div>
      </header>

      {/* Category Filter */}
      <div style={{ background:'#1a0a0e', paddingBottom:'16px' }}>
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => {
              const isActive = activeCat === cat.id
              const name = isRTL && cat.name_ar ? cat.name_ar : cat.name
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-200"
                  style={{
                    background: isActive ? '#7e2b3f' : 'rgba(255,255,255,0.07)',
                    border: isActive ? '1px solid rgba(201,149,107,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    fontFamily: isRTL?'Noto Naskh Arabic,serif':'Montserrat,sans-serif',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: isActive ? '#fdf6ee' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    letterSpacing: isRTL ? '0' : '0.05em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <main className="max-w-2xl mx-auto px-4 py-5 pb-28">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 animate-spin"
              style={{ borderColor:'rgba(126,43,63,0.2)', borderTopColor:'#7e2b3f' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">☕</div>
            <p style={{ fontFamily:'Montserrat,sans-serif', color:'#aaa' }}>
              {isRTL ? 'لا توجد عناصر' : 'No items available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map(item => (
              <ItemCard key={item.id} item={item} lang={lang} onAdd={handleAdd} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Cart Button (mobile) */}
      {count > 0 && (
        <motion.div
          initial={{ y: 80 }} animate={{ y: 0 }}
          className="fixed bottom-6 inset-x-4 z-30"
        >
          <button
            onClick={() => setCartOpen(true)}
            className="w-full py-4 rounded-2xl flex items-center justify-between px-5 transition-all hover:-translate-y-0.5"
            style={{
              background:'#7e2b3f',
              boxShadow:'0 8px 32px rgba(126,43,63,0.5)',
              border:'1px solid rgba(201,149,107,0.2)',
            }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background:'rgba(255,255,255,0.15)' }}
            >
              <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:'800', fontSize:'0.8rem', color:'#fdf6ee' }}>
                {count}
              </span>
            </div>
            <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:'700', fontSize:'0.8rem', color:'#fdf6ee', letterSpacing:'0.15em' }}>
              {isRTL ? 'عرض السلة' : 'VIEW ORDER'}
            </span>
            <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:'800', color:'#c9956b', fontSize:'0.9rem' }}>
              {total.toFixed(0)} AED
            </span>
          </button>
        </motion.div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        lang={lang}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true) }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        lang={lang}
        onSubmit={handlePlaceOrder}
        loading={submitting}
      />
    </div>
  )
}
