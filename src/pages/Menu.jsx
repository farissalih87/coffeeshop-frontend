import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Plus, Minus, X, Check } from 'lucide-react'
import { useLanguageStore, useCartStore } from '../store'
import { menuApi, orderApi } from '../api'
import toast from 'react-hot-toast'

const B = { dark:'#1a0a0e', wine:'#5a1e2d', brand:'#7e2b3f', gold:'#c9956b', cream:'#fdf6ee', blush:'#fdf2f4' }
const fmt = (val) => { const n = parseFloat(val); return isNaN(n) ? '0' : n.toFixed(0) }

// ── Item Card ─────────────────────────────────────────────────────────────────
function ItemCard({ item, lang, onAdd }) {
  const isRTL = lang === 'ar'
  const name  = isRTL && item.name_ar ? item.name_ar : item.name
  const desc  = isRTL && item.description_ar ? item.description_ar : item.description
  const [flash, setFlash] = useState(false)

  const handleAdd = () => {
    onAdd(item)
    setFlash(true)
    setTimeout(() => setFlash(false), 900)
  }

  return (
    <div style={{
      background:'white', borderRadius:16, overflow:'hidden',
      border: flash ? `2px solid ${B.brand}` : '1px solid rgba(126,43,63,0.1)',
      boxShadow: flash ? '0 4px 20px rgba(126,43,63,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
      transition:'border 0.25s, box-shadow 0.25s',
      display:'flex', flexDirection:'column',
    }}>
      {/* Image / placeholder */}
      <div style={{
        height:110, background:`linear-gradient(135deg, ${B.blush}, #f5e6e8)`,
        display:'flex', alignItems:'center', justifyContent:'center',
        position:'relative', overflow:'hidden',
      }}>
        {item.image
          ? <img src={item.image} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.6rem', color:'rgba(126,43,63,0.25)', letterSpacing:'0.2em', textTransform:'uppercase' }}>
                {isRTL && item.category?.name_ar ? item.category.name_ar : (item.category?.name || 'Item')}
              </div>
            </div>
          )
        }
        {/* Flash overlay */}
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              style={{ position:'absolute', inset:0, background:'rgba(126,43,63,0.8)', display:'flex', alignItems:'center', justifyContent:'center' }}
            >
              <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:400 }}>
                <Check size={36} color={B.cream} strokeWidth={3} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div style={{ padding:'10px 12px 12px', flexGrow:1, display:'flex', flexDirection:'column' }} dir={isRTL?'rtl':'ltr'}>
        <div style={{ fontFamily: isRTL?'Noto Naskh Arabic,serif':'Montserrat,sans-serif', fontWeight:700, color:B.dark, fontSize:'0.85rem', lineHeight:1.2 }}>
          {name}
        </div>
        {desc && (
          <div style={{ fontFamily: isRTL?'Noto Naskh Arabic,serif':'Montserrat,sans-serif', color:'#bbb', fontSize:'0.68rem', marginTop:3, lineHeight:1.4, flexGrow:1 }}>
            {desc}
          </div>
        )}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:10 }}>
          <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, color:B.brand, fontSize:'0.95rem' }}>
            {fmt(item.price)}
            <span style={{ fontSize:'0.6rem', fontWeight:400, color:'#ccc', marginLeft:2 }}>AED</span>
          </div>
          <motion.button
            onClick={handleAdd}
            whileTap={{ scale:0.82 }}
            whileHover={{ scale:1.1 }}
            style={{
              width:34, height:34, borderRadius:10,
              background: flash ? B.wine : B.brand,
              border:'none', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 4px 12px rgba(126,43,63,0.4)',
              transition:'background 0.2s',
            }}
          >
            {flash
              ? <Check size={16} color={B.cream} strokeWidth={3} />
              : <Plus size={18} color={B.cream} strokeWidth={2.5} />
            }
          </motion.button>
        </div>
      </div>
    </div>
  )
}

// ── Cart Drawer ───────────────────────────────────────────────────────────────
function CartDrawer({ isOpen, onClose, lang, onCheckout }) {
  const { items, updateQty, removeItem } = useCartStore()
  const isRTL = lang === 'ar'
  const safeItems = items || []
  const safeTotal = safeItems.reduce((s, i) => s + (parseFloat(i.price)||0) * (parseInt(i.quantity)||0), 0)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:40 }} />
          <motion.div
            initial={{ x: isRTL?'-100%':'100%' }} animate={{ x:0 }} exit={{ x: isRTL?'-100%':'100%' }}
            transition={{ type:'spring', damping:28, stiffness:300 }}
            dir={isRTL?'rtl':'ltr'}
            style={{
              position:'fixed', top:0, bottom:0, [isRTL?'left':'right']:0,
              width:300, zIndex:50, background:B.cream,
              display:'flex', flexDirection:'column',
              boxShadow:'-8px 0 40px rgba(0,0,0,0.2)',
            }}
          >
            {/* Header */}
            <div style={{ background:B.dark, padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:700, color:B.cream, letterSpacing:'0.15em', fontSize:'0.75rem', textTransform:'uppercase' }}>
                {isRTL ? 'طلبك' : 'Your Order'}
              </span>
              <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.35)', padding:4 }}>
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div style={{ flex:1, overflowY:'auto', padding:16, display:'flex', flexDirection:'column', gap:10 }}>
              {safeItems.length === 0 ? (
                <div style={{ textAlign:'center', paddingTop:60 }}>
                  <div style={{ fontFamily:'Montserrat,sans-serif', color:'rgba(126,43,63,0.25)', fontSize:'0.65rem', letterSpacing:'0.3em', textTransform:'uppercase', marginBottom:12 }}>
                    — Empty —
                  </div>
                  <div style={{ fontFamily:'Montserrat,sans-serif', color:'#bbb', fontSize:'0.82rem' }}>
                    {isRTL ? 'السلة فارغة' : 'Your cart is empty'}
                  </div>
                </div>
              ) : safeItems.map(item => (
                <div key={item.id} style={{
                  background:'white', borderRadius:14, padding:'10px 12px',
                  border:'1px solid rgba(126,43,63,0.08)',
                  display:'flex', alignItems:'center', gap:10,
                }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily: isRTL?'Noto Naskh Arabic,serif':'Montserrat,sans-serif', fontWeight:600, fontSize:'0.82rem', color:B.dark }}>
                      {isRTL && item.name_ar ? item.name_ar : item.name}
                    </div>
                    <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:700, color:B.brand, fontSize:'0.8rem', marginTop:3 }}>
                      {fmt((parseFloat(item.price)||0) * (parseInt(item.quantity)||0))} AED
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <button onClick={() => updateQty(item.id, (parseInt(item.quantity)||1)-1)} style={{ width:26, height:26, borderRadius:8, border:'none', cursor:'pointer', background:'rgba(126,43,63,0.08)', color:B.brand, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Minus size={11} strokeWidth={2.5} />
                    </button>
                    <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:700, fontSize:'0.9rem', minWidth:18, textAlign:'center' }}>
                      {item.quantity}
                    </span>
                    <button onClick={() => updateQty(item.id, (parseInt(item.quantity)||0)+1)} style={{ width:26, height:26, borderRadius:8, border:'none', cursor:'pointer', background:B.brand, color:B.cream, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Plus size={11} strokeWidth={2.5} />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ccc', padding:2 }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            {safeItems.length > 0 && (
              <div style={{ padding:16, borderTop:'1px solid rgba(126,43,63,0.1)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                  <span style={{ fontFamily:'Montserrat,sans-serif', color:'#aaa', fontSize:'0.65rem', letterSpacing:'0.15em', textTransform:'uppercase' }}>
                    {isRTL ? 'الإجمالي' : 'Total'}
                  </span>
                  <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, fontSize:'1.3rem', color:B.dark }}>
                    {fmt(safeTotal)} <span style={{ fontSize:'0.7rem', fontWeight:400, color:'#aaa' }}>AED</span>
                  </span>
                </div>
                <button onClick={onCheckout} style={{
                  width:'100%', padding:'14px', borderRadius:14, border:'none', cursor:'pointer',
                  background:B.brand, color:B.cream,
                  fontFamily:'Montserrat,sans-serif', fontWeight:700, fontSize:'0.72rem',
                  letterSpacing:'0.18em', textTransform:'uppercase',
                  boxShadow:'0 8px 24px rgba(126,43,63,0.4)',
                }}>
                  {isRTL ? 'متابعة الطلب' : 'Checkout'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Checkout Modal ─────────────────────────────────────────────────────────────
function CheckoutModal({ isOpen, onClose, lang, onSubmit, loading }) {
  const [name, setName]         = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes]       = useState('')
  const isRTL = lang === 'ar'

  const LOCS = [
    { value:'salon',     en:"Men's Salon",        ar:"صالون الرجال"        },
    { value:'reception', en:"Car Care Reception",  ar:"استقبال السيارات"   },
  ]

  const handleSubmit = () => {
    if (!name.trim()) return toast.error(isRTL ? 'أدخل اسمك' : 'Please enter your name')
    if (!location)    return toast.error(isRTL ? 'اختر موقعك' : 'Please select your location')
    onSubmit({ name: name.trim(), location, notes })
  }

  if (!isOpen) return null

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:50 }} />
      <motion.div
        initial={{ y:'100%' }} animate={{ y:0 }}
        transition={{ type:'spring', damping:28, stiffness:300 }}
        dir={isRTL?'rtl':'ltr'}
        style={{
          position:'fixed', bottom:0, left:0, right:0, zIndex:60,
          background:B.cream, borderRadius:'24px 24px 0 0',
          padding:'24px 20px 40px',
          maxHeight:'90vh', overflowY:'auto',
        }}
      >
        <div style={{ width:36, height:3, borderRadius:2, background:'rgba(126,43,63,0.2)', margin:'0 auto 24px' }} />

        {/* Title */}
        <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, fontSize:'1rem', color:B.dark, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:24 }}>
          {isRTL ? 'تفاصيل الطلب' : 'Order Details'}
        </div>

        {/* Name */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.6rem', color:'#aaa', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:8 }}>
            {isRTL ? 'الاسم' : 'Your Name'}
          </div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={isRTL ? 'اكتب اسمك...' : 'Enter your name...'}
            style={{
              width:'100%', padding:'13px 14px', borderRadius:12,
              border:'1.5px solid rgba(126,43,63,0.15)',
              fontFamily: isRTL?'Noto Naskh Arabic,serif':'Montserrat,sans-serif',
              fontSize:'0.95rem', color:B.dark, background:'white', outline:'none', boxSizing:'border-box',
            }}
            onFocus={e => e.target.style.borderColor = B.brand}
            onBlur={e  => e.target.style.borderColor = 'rgba(126,43,63,0.15)'}
          />
        </div>

        {/* Location */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.6rem', color:'#aaa', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:8 }}>
            {isRTL ? 'موقعك' : 'Your Location'}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {LOCS.map(loc => (
              <button
                key={loc.value}
                onClick={() => setLocation(loc.value)}
                style={{
                  padding:'16px 8px', borderRadius:12, cursor:'pointer', textAlign:'center',
                  fontFamily: isRTL?'Noto Naskh Arabic,serif':'Montserrat,sans-serif',
                  fontSize: isRTL ? '0.9rem' : '0.75rem',
                  fontWeight:600, letterSpacing: isRTL?0:'0.04em',
                  border: location===loc.value ? `2px solid ${B.brand}` : '1.5px solid rgba(126,43,63,0.12)',
                  background: location===loc.value ? B.brand : 'white',
                  color: location===loc.value ? B.cream : '#666',
                  transition:'all 0.2s',
                }}
              >
                {isRTL ? loc.ar : loc.en}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.6rem', color:'#aaa', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:8 }}>
            {isRTL ? 'ملاحظات — اختياري' : 'Notes — Optional'}
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={isRTL ? 'مثال: بدون سكر...' : 'e.g. No sugar, extra hot...'}
            rows={2}
            style={{
              width:'100%', padding:'13px 14px', borderRadius:12,
              border:'1.5px solid rgba(126,43,63,0.15)',
              fontFamily: isRTL?'Noto Naskh Arabic,serif':'Montserrat,sans-serif',
              fontSize:'0.9rem', color:B.dark, background:'white', outline:'none',
              resize:'none', boxSizing:'border-box',
            }}
            onFocus={e => e.target.style.borderColor = B.brand}
            onBlur={e  => e.target.style.borderColor = 'rgba(126,43,63,0.15)'}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width:'100%', padding:'16px', borderRadius:14, border:'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? '#ccc' : B.brand, color:B.cream,
            fontFamily:'Montserrat,sans-serif', fontWeight:700,
            fontSize:'0.72rem', letterSpacing:'0.2em', textTransform:'uppercase',
            boxShadow:'0 8px 24px rgba(126,43,63,0.35)',
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          }}
        >
          {loading
            ? <div style={{ width:20, height:20, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', animation:'spin 0.8s linear infinite' }} />
            : (isRTL ? 'تأكيد الطلب' : 'Place Order')
          }
        </button>
      </motion.div>
    </>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Menu() {
  const navigate = useNavigate()
  const { lang } = useLanguageStore()
  const { items: cartItems, addItem } = useCartStore()
  const isRTL = lang === 'ar'

  const [categories,   setCategories]  = useState([])
  const [menuItems,    setMenuItems]    = useState([])
  const [activeCat,    setActiveCat]    = useState(null)
  const [cartOpen,     setCartOpen]     = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [loadingMenu,  setLoadingMenu]  = useState(true)
  const [submitting,   setSubmitting]   = useState(false)

  const safeItems = cartItems || []
  const cartCount = safeItems.reduce((s, i) => s + (parseInt(i.quantity)||0), 0)
  const cartTotal = safeItems.reduce((s, i) => s + (parseFloat(i.price)||0) * (parseInt(i.quantity)||0), 0)

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, itemRes] = await Promise.all([menuApi.getCategories(), menuApi.getAllItems()])
        const cats  = catRes.data?.categories || []
        const items = itemRes.data?.items      || []
        setCategories(cats)
        setMenuItems(items)
        if (cats.length > 0) setActiveCat(cats[0].id)
      } catch (e) {
        console.error(e)
        toast.error('Failed to load menu')
      } finally {
        setLoadingMenu(false)
      }
    }
    load()
  }, [])

  const filtered = menuItems.filter(i =>
    i.available !== false && (activeCat === null || i.category_id === activeCat)
  )

  const handleCheckout = () => {
    setCartOpen(false)
    setTimeout(() => setCheckoutOpen(true), 250)
  }

  const handlePlaceOrder = async ({ name, location, notes }) => {
    if (safeItems.length === 0) return toast.error('Cart is empty')
    setSubmitting(true)
    try {
      const res   = await orderApi.place({ customer_name:name, location, notes, lang, items: safeItems.map(i => ({ menu_item_id:i.id, quantity:parseInt(i.quantity)||1 })) })
      const order = res.data?.order || res.data
      setCheckoutOpen(false)
      navigate('/order-confirmation', { state: { order } })
    } catch (e) {
      console.error(e)
      toast.error(isRTL ? 'حدث خطأ' : 'Failed to place order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:B.cream }} dir={isRTL?'rtl':'ltr'}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ background:B.dark, padding:'14px 16px', position:'sticky', top:0, zIndex:30 }}>
        <div style={{ maxWidth:680, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <img src="/logo.jpg" alt="Arica Lounge" style={{ width:36, height:36, borderRadius:'50%', objectFit:'cover', border:'1.5px solid rgba(201,149,107,0.4)' }} />
            <div>
              <div style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, color:B.cream, letterSpacing:'0.15em', fontSize:'0.78rem' }}>ARICA</div>
              <div style={{ fontFamily:'Montserrat,sans-serif', color:'#c9956b', letterSpacing:'0.45em', fontSize:'0.48rem', marginTop:1 }}>LOUNGE</div>
            </div>
          </div>
          <motion.button
            onClick={() => setCartOpen(true)}
            whileTap={{ scale:0.93 }}
            style={{
              display:'flex', alignItems:'center', gap:8,
              padding:'9px 16px', borderRadius:12, border:'none', cursor:'pointer',
              background:B.brand, boxShadow:'0 4px 16px rgba(126,43,63,0.5)',
              position:'relative',
            }}
          >
            <ShoppingCart size={16} color={B.cream} />
            <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:700, color:B.cream, fontSize:'0.72rem', letterSpacing:'0.08em' }}>
              {isRTL ? 'السلة' : 'Cart'}
            </span>
            {cartCount > 0 && (
              <motion.div key={cartCount} initial={{ scale:1.5 }} animate={{ scale:1 }} style={{
                position:'absolute', top:-8, right:-8,
                width:20, height:20, borderRadius:'50%',
                background:'#c9956b',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <span style={{ fontFamily:'Montserrat,sans-serif', fontSize:'0.6rem', fontWeight:800, color:B.dark }}>{cartCount}</span>
              </motion.div>
            )}
          </motion.button>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ background:B.dark, paddingBottom:14 }}>
        <div style={{ maxWidth:680, margin:'0 auto', padding:'0 16px' }}>
          <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:2 }}>
            {categories.map(cat => {
              const active  = activeCat === cat.id
              const catName = isRTL && cat.name_ar ? cat.name_ar : cat.name
              return (
                <button key={cat.id} onClick={() => setActiveCat(cat.id)} style={{
                  flexShrink:0, padding:'7px 14px', borderRadius:8, border:'none', cursor:'pointer',
                  background: active ? B.brand : 'rgba(255,255,255,0.06)',
                  color: active ? B.cream : 'rgba(255,255,255,0.4)',
                  fontFamily: isRTL?'Noto Naskh Arabic,serif':'Montserrat,sans-serif',
                  fontSize: isRTL?'0.85rem':'0.68rem',
                  fontWeight:600, whiteSpace:'nowrap',
                  letterSpacing: isRTL?0:'0.08em', textTransform: isRTL?'none':'uppercase',
                  transition:'all 0.2s',
                  outline: active ? '1px solid rgba(201,149,107,0.3)' : 'none',
                }}>
                  {catName}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth:680, margin:'0 auto', padding:'16px 16px 140px' }}>
        {loadingMenu ? (
          <div style={{ display:'flex', justifyContent:'center', paddingTop:80 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', border:'3px solid rgba(126,43,63,0.15)', borderTopColor:B.brand, animation:'spin 0.8s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', paddingTop:80 }}>
            <div style={{ fontFamily:'Montserrat,sans-serif', color:'rgba(126,43,63,0.25)', fontSize:'0.65rem', letterSpacing:'0.3em', textTransform:'uppercase', marginBottom:8 }}>— No Items —</div>
            <div style={{ fontFamily:'Montserrat,sans-serif', color:'#bbb', fontSize:'0.85rem' }}>
              {isRTL ? 'لا توجد عناصر' : 'Nothing available in this category'}
            </div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
            {filtered.map(item => (
              <ItemCard key={item.id} item={item} lang={lang} onAdd={addItem} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Bar */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div initial={{ y:80 }} animate={{ y:0 }} exit={{ y:80 }}
            style={{ position:'fixed', bottom:20, left:16, right:16, zIndex:30 }}
          >
            <button onClick={() => setCartOpen(true)} style={{
              width:'100%', padding:'14px 20px', borderRadius:16, border:'none', cursor:'pointer',
              background:B.brand,
              display:'flex', alignItems:'center', justifyContent:'space-between',
              boxShadow:'0 8px 32px rgba(126,43,63,0.55)',
            }}>
              <div style={{
                width:28, height:28, borderRadius:8, background:'rgba(255,255,255,0.15)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'Montserrat,sans-serif', fontWeight:800, fontSize:'0.8rem', color:B.cream,
              }}>{cartCount}</div>
              <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:700, fontSize:'0.72rem', color:B.cream, letterSpacing:'0.15em', textTransform:'uppercase' }}>
                {isRTL ? 'عرض الطلب' : 'View Order'}
              </span>
              <span style={{ fontFamily:'Montserrat,sans-serif', fontWeight:800, color:'#c9956b', fontSize:'0.95rem' }}>
                {fmt(cartTotal)} AED
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} lang={lang} onCheckout={handleCheckout} />
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} lang={lang} onSubmit={handlePlaceOrder} loading={submitting} />
    </div>
  )
}
