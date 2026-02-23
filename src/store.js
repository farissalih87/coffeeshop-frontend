import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Language Store ─────────────────────────────────────────────────────────────
export const useLanguageStore = create(
  persist(
    (set) => ({
      lang: 'en',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'arica-lang' }
  )
)

// ── Auth Store ─────────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set) => ({
      user:  null,
      token: null,
      login:  (user, token) => set({ user, token }),
      logout: ()            => set({ user: null, token: null }),
    }),
    { name: 'coffeeshop-auth' }
  )
)

// ── Cart Store ─────────────────────────────────────────────────────────────────
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Always return a safe number
      get total() {
        const items = get().items || []
        const raw = items.reduce((sum, item) => {
          const price = parseFloat(item.price) || 0
          const qty   = parseInt(item.quantity) || 0
          return sum + price * qty
        }, 0)
        return Number(raw) || 0
      },

      get count() {
        const items = get().items || []
        return items.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)
      },

      addItem: (item) => set((state) => {
        const existing = state.items.find(i => i.id === item.id)
        if (existing) {
          return {
            items: state.items.map(i =>
              i.id === item.id
                ? { ...i, quantity: (parseInt(i.quantity) || 0) + 1 }
                : i
            )
          }
        }
        return {
          items: [...state.items, {
            ...item,
            price:    parseFloat(item.price) || 0,
            quantity: 1,
          }]
        }
      }),

      updateQty: (id, qty) => set((state) => {
        const newQty = parseInt(qty) || 0
        if (newQty <= 0) {
          return { items: state.items.filter(i => i.id !== id) }
        }
        return {
          items: state.items.map(i =>
            i.id === id ? { ...i, quantity: newQty } : i
          )
        }
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id)
      })),

      clearCart: () => set({ items: [] }),
    }),
    { name: 'arica-cart' }
  )
)
