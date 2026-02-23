import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Plus, Minus, X, ChevronRight, ArrowLeft, Coffee } from 'lucide-react'
import { useLanguageStore, useCartStore } from '../store'
import { menuApi, orderApi } from '../api'
import { t } from '../i18n/translations'
import toast from 'react-hot-toast'

// ─── Mock data for offline/demo use ─────────────────────────────────────────
const MOCK_CATEGORIES = [
  { id: 1, name: 'Hot Coffee', name_ar: 'قهوة ساخنة', icon: '☕' },
  { id: 2, name: 'Cold Coffee', name_ar: 'قهوة باردة', icon: '🧊' },
  { id: 3, name: 'Tea', name_ar: 'شاي', icon: '🍵' },
  { id: 4, name: 'Pastries', name_ar: 'معجنات', icon: '🥐' },
  { id: 5, name: 'Juices', name_ar: 'عصائر', icon: '🍊' },
]

const MOCK_ITEMS = [
  { id:1, category_id:1, name:'Espresso', name_ar:'إسبريسو', price:12, description:'Rich single shot', description_ar:'شوت واحد غني', image:null, available:true },
  { id:2, category_id:1, name:'Cappuccino', name_ar:'كابتشينو', price:18, description:'Espresso with steamed milk foam', description_ar:'إسبريسو مع رغوة الحليب', image:null, available:true },
  { id:3, category_id:1, name:'Flat White', name_ar:'فلات وايت', price:18, description:'Double ristretto with velvety milk', description_ar:'ريستريتو مزدوج مع حليب ناعم', image:null, available:true },
  { id:4, category_id:1, name:'Latte', name_ar:'لاتيه', price:20, description:'Smooth espresso & steamed milk', description_ar:'إسبريسو ناعم مع الحليب المطبوخ', image:null, available:true },
  { id:5, category_id:1, name:'Americano', name_ar:'أمريكانو', price:15, description:'Espresso with hot water', description_ar:'إسبريسو مع ماء ساخن', image:null, available:true },
  { id:6, category_id:2, name:'Iced Latte', name_ar:'لاتيه مثلج', price:22, description:'Chilled espresso & milk', description_ar:'إسبريسو بارد مع الحليب', image:null, available:true },
  { id:7, category_id:2, name:'Cold Brew', name_ar:'كولد برو', price:25, description:'Slow-steeped 12 hours', description_ar:'منقوع ببطء ١٢ ساعة', image:null, available:true },
  { id:8, category_id:2, name:'Frappuccino', name_ar:'فرابتشينو', price:28, description:'Blended iced coffee', description_ar:'قهوة مجمدة مخلوطة', image:null, available:true },
  { id:9, category_id:3, name:'Karak Tea', name_ar:'كرك', price:10, description:'Spiced milk tea', description_ar:'شاي بالحليب والهيل', image:null, available:true },
  { id:10, category_id:3, name:'Green Tea', name_ar:'شاي أخضر', price:12, description:'Japanese sencha', description_ar:'سنشا ياباني', image:null, available:true },
  { id:11, category_id:4, name:'Croissant', name_ar:'كرواسون', price:15, description:'Buttery flaky pastry', description_ar:'معجنة مقرمشة بالزبدة', image:null, available:true },
  { id:12, category_id:4, name:'Chocolate Muffin', name_ar:'مافن شوكولاتة', price:18, description:'Rich chocolate muffin', description_ar:'مافن شوكولاتة غني', image:null, available:true },
  { id:13, category_id:5, name:'Orange Juice', name_ar:'عصير برتقال', price:20, description:'Fresh squeezed', description_ar:'معصور طازج', image:null, available:true },
  { id:14, category_id:5, name:'Mango Juice', name_ar:'عصير مانجو', price:22, description:'Tropical fresh mango', description_ar:'مانجو طازج استوائي', image:null, available:true },
]

// ─── Item Card Component ──────────────────────────────────────────────────────
function ItemCard({ item, lang, onAdd, cartQty }) {
  const [added, setAdded] = useState(false)
  const isRtl = lang === 'ar'

  const handleAdd = () => {
    onAdd(item)
    setAdded(true)
    setTimeout(() => setAdded(false), 1000)
  }

  const name = isRtl ? (item.name_ar || item.name) : item.name
  const description = isRtl ? (item.description_ar || item.description) : item.description

  // Item emoji based on category
  const emojis = { 1: '☕', 2: '🧊', 3: '🍵', 4: '🥐', 5: '🍊' }
  const emoji = emojis[item.category_id] || '☕'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-hover p-4 relative"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Image or placeholder */}
      <div className="w-full h-32 rounded-2xl bg-gradient-to-br from-coffee-50 to-coffee-100 
                      flex items-center justify-center mb-3 overflow-hidden relative">
        {item.image ? (
          <img src={`${import.meta.env.VITE_API_URL?.replace('/api','')}/storage/${item.image}`}
            alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">{emoji}</span>
        )}
        {cartQty > 0 && (
          <div className="absolute top-2 right-2 bg-coffee-600 text-white w-6 h-6 rounded-full 
                          flex items-center justify-center text-xs font-bold">
            {cartQty}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="font-display font-semibold text-dark text-base leading-tight">{name}</h3>
        {description && (
          <p className="text-coffee-600/60 text-xs font-body leading-relaxed line-clamp-2">
            {description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-coffee-700 font-bold font-body text-lg">
            {item.price} <span className="text-xs font-normal text-coffee-500">{t(lang,'currency')}</span>
          </span>
          <button
            onClick={handleAdd}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
                       ${added
                         ? 'bg-green-500 text-white scale-110'
                         : 'bg-coffee-600 hover:bg-coffee-700 text-white hover:scale-105 shadow-md shadow-coffee-600/30'
                       }`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────
function CartDrawer({ lang, onClose, onCheckout }) {
  const { items, updateQty, removeItem, total } = useCartStore()
  const isRtl = lang === 'ar'

  return (
    <motion.div
      initial={{ x: isRtl ? '-100%' : '100%' }}
      animate={{ x: 0 }}
      exit={{ x: isRtl ? '-100%' : '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-between p-5 border-b border-coffee-100">
        <h2 className="font-display text-xl font-bold text-dark">{t(lang, 'yourOrder')}</h2>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-coffee-50 flex items-center justify-center">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-coffee-400 font-body">{t(lang, 'emptyCart')}</p>
            <p className="text-coffee-300 text-sm mt-1">{t(lang, 'emptyCartSub')}</p>
          </div>
        ) : (
          items.map((item) => {
            const name = isRtl ? (item.name_ar || item.name) : item.name
            return (
              <div key={item.id} className="flex items-center gap-3 bg-coffee-50/50 rounded-2xl p-3">
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-dark text-sm truncate">{name}</p>
                  <p className="text-coffee-600 text-sm">{item.price * item.quantity} {t(lang,'currency')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-coffee-200 flex items-center justify-center hover:bg-coffee-50"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center font-bold text-dark text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-coffee-600 text-white flex items-center justify-center hover:bg-coffee-700"
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-7 h-7 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 ml-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {items.length > 0 && (
        <div className="p-5 border-t border-coffee-100 bg-white">
          <div className="flex justify-between items-center mb-4">
            <span className="font-body text-coffee-600">{t(lang, 'subtotal')}</span>
            <span className="font-display font-bold text-xl text-dark">
              {total()} <span className="text-sm font-body font-normal text-coffee-500">{t(lang,'currency')}</span>
            </span>
          </div>
          <button onClick={onCheckout} className="btn-primary w-full flex items-center justify-center gap-2">
            {t(lang, 'confirmOrder')}
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </motion.div>
  )
}

// ─── Checkout Modal ───────────────────────────────────────────────────────────
function CheckoutModal({ lang, onClose, onSuccess }) {
  const { items, total, clearCart } = useCartStore()
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const isRtl = lang === 'ar'

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = t(lang, 'nameRequired')
    if (!location) e.location = t(lang, 'locationRequired')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const orderItems = items.map(i => ({ menu_item_id: i.id, quantity: i.quantity, price: i.price }))
      const res = await orderApi.place({
        customer_name: name,
        location,
        notes,
        items: orderItems,
        total: total(),
        lang,
      })
      clearCart()
      onSuccess(res.data.order || { id: Math.floor(Math.random() * 9000) + 1000 })
    } catch (err) {
      // Demo mode - simulate success
      clearCart()
      onSuccess({ id: Math.floor(Math.random() * 9000) + 1000 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-dark/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-dark">{t(lang, 'orderDetails')}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-coffee-50 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        {/* Order summary */}
        <div className="bg-coffee-50 rounded-2xl p-4 mb-5">
          <p className="text-coffee-600 text-xs uppercase tracking-wider mb-2 font-semibold">{t(lang,'orderSummary')}</p>
          {items.map(item => {
            const name_display = isRtl ? (item.name_ar || item.name) : item.name
            return (
              <div key={item.id} className="flex justify-between text-sm py-1">
                <span className="text-dark font-body">{item.quantity}× {name_display}</span>
                <span className="text-coffee-700 font-semibold">{item.price * item.quantity} {t(lang,'currency')}</span>
              </div>
            )
          })}
          <div className="border-t border-coffee-200 mt-2 pt-2 flex justify-between font-bold">
            <span className="text-dark">{t(lang,'subtotal')}</span>
            <span className="text-coffee-700">{total()} {t(lang,'currency')}</span>
          </div>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-dark font-semibold text-sm mb-2 font-body">{t(lang,'yourName')}</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t(lang,'yourNamePlaceholder')}
            className={`w-full border-2 rounded-xl px-4 py-3 font-body text-dark outline-none transition-colors
                       ${errors.name ? 'border-red-300 bg-red-50' : 'border-coffee-200 focus:border-coffee-500 bg-coffee-50/30'}`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="block text-dark font-semibold text-sm mb-2 font-body">{t(lang,'location')}</label>
          <div className="grid grid-cols-2 gap-3">
            {['salon', 'reception'].map(loc => (
              <button
                key={loc}
                onClick={() => setLocation(loc)}
                className={`p-3 rounded-xl border-2 text-center transition-all duration-200
                           ${location === loc
                             ? 'border-coffee-500 bg-coffee-50 text-coffee-800'
                             : 'border-coffee-100 bg-white text-coffee-500 hover:border-coffee-300'
                           }`}
              >
                <div className="text-2xl mb-1">{loc === 'salon' ? '✂️' : '🚗'}</div>
                <div className="text-xs font-semibold font-body leading-tight">{t(lang, loc)}</div>
              </button>
            ))}
          </div>
          {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-dark font-semibold text-sm mb-2 font-body">{t(lang,'notes')}</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={t(lang,'notesPlaceholder')}
            rows={2}
            className="w-full border-2 border-coffee-200 focus:border-coffee-500 rounded-xl px-4 py-3 
                       font-body text-dark outline-none transition-colors bg-coffee-50/30 resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>☕ {t(lang, 'placeOrder')}</>
          )}
        </button>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Menu Page ───────────────────────────────────────────────────────────
export default function Menu() {
  const navigate = useNavigate()
  const lang = useLanguageStore((s) => s.lang)
  const { items: cartItems, addItem, count } = useCartStore()
  const [activeCategory, setActiveCategory] = useState('all')
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const isRtl = lang === 'ar'

  // Redirect if no language selected
  useEffect(() => { if (!lang) navigate('/') }, [lang, navigate])

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => menuApi.getCategories().then(r => r.data),
    placeholderData: { categories: MOCK_CATEGORIES },
    retry: false,
  })

  const { data: itemsData } = useQuery({
    queryKey: ['menu-items'],
    queryFn: () => menuApi.getAllItems().then(r => r.data),
    placeholderData: { items: MOCK_ITEMS },
    retry: false,
  })

  const categories = categoriesData?.categories || MOCK_CATEGORIES
  const allItems = itemsData?.items || MOCK_ITEMS

  const filteredItems = activeCategory === 'all'
    ? allItems.filter(i => i.available !== false)
    : allItems.filter(i => i.category_id === activeCategory && i.available !== false)

  const cartQtyFor = (id) => cartItems.find(i => i.id === id)?.quantity || 0

  const handleOrderSuccess = (order) => {
    setShowCheckout(false)
    navigate('/order-confirmation', { state: { order, lang } })
  }

  if (!lang) return null

  return (
    <div className={`min-h-screen bg-cream ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur-md border-b border-coffee-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-coffee-600 hover:text-coffee-800 transition-colors">
            {isRtl ? <ChevronRight size={20} /> : <ArrowLeft size={20} />}
            <span className="text-sm font-body font-medium">{isRtl ? 'اللغة' : 'Language'}</span>
          </button>

          <div className="text-center">
            <h1 className="font-display font-bold text-dark text-lg leading-none">
              {isRtl ? 'ذا كوفي لاونج' : 'The Coffee Lounge'}
            </h1>
            <p className="text-coffee-500 text-xs mt-0.5">{t(lang,'ourMenu')}</p>
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setShowCart(true)}
            className="relative p-2 rounded-xl bg-coffee-600 text-white hover:bg-coffee-700 transition-all shadow-md shadow-coffee-600/30"
          >
            <ShoppingCart size={20} />
            {count() > 0 && (
              <motion.div
                key={count()}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-5 h-5 rounded-full 
                           flex items-center justify-center text-xs font-bold"
              >
                {count()}
              </motion.div>
            )}
          </button>
        </div>

        {/* Category Filter */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold font-body transition-all
                         ${activeCategory === 'all'
                           ? 'bg-coffee-600 text-white shadow-md shadow-coffee-600/30'
                           : 'bg-white text-coffee-600 border border-coffee-200 hover:border-coffee-400'
                         }`}
            >
              {t(lang, 'allCategories')}
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold font-body transition-all
                           ${activeCategory === cat.id
                             ? 'bg-coffee-600 text-white shadow-md shadow-coffee-600/30'
                             : 'bg-white text-coffee-600 border border-coffee-200 hover:border-coffee-400'
                           }`}
              >
                <span>{cat.icon}</span>
                <span>{isRtl ? cat.name_ar : cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Items Grid */}
      <main className="max-w-2xl mx-auto px-4 py-5">
        <motion.div layout className="grid grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {filteredItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                lang={lang}
                onAdd={addItem}
                cartQty={cartQtyFor(item.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Floating Cart Button (if cart has items) */}
      <AnimatePresence>
        {count() > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
          >
            <button
              onClick={() => setShowCart(true)}
              className="flex items-center gap-3 bg-dark text-cream px-6 py-4 rounded-2xl 
                         shadow-2xl hover:bg-coffee-900 transition-all hover:-translate-y-1"
            >
              <ShoppingCart size={20} className="text-coffee-400" />
              <span className="font-body font-semibold">
                {count()} {count() === 1 ? t(lang,'item') : t(lang,'items')}
              </span>
              <span className="bg-coffee-600 px-3 py-1 rounded-xl text-sm font-bold ml-2">
                {useCartStore.getState().total()} {t(lang,'currency')}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-40"
              onClick={() => setShowCart(false)}
            />
            <CartDrawer
              lang={lang}
              onClose={() => setShowCart(false)}
              onCheckout={() => { setShowCart(false); setShowCheckout(true) }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <CheckoutModal
            lang={lang}
            onClose={() => setShowCheckout(false)}
            onSuccess={handleOrderSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
