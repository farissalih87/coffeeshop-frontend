import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Language Store ───────────────────────────────────────────────────────────
export const useLanguageStore = create(
  persist(
    (set) => ({
      lang: null, // null = not selected yet
      setLang: (lang) => set({ lang }),
    }),
    { name: 'coffeeshop-lang' }
  )
)

// ─── Auth Store (Staff/Admin) ─────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => {
        set({ user: null, token: null })
        localStorage.removeItem('coffeeshop-auth')
      },
    }),
    { name: 'coffeeshop-auth' }
  )
)

// ─── Cart Store ───────────────────────────────────────────────────────────────
export const useCartStore = create((set, get) => ({
  items: [],
  addItem: (item) => {
    const existing = get().items.find((i) => i.id === item.id)
    if (existing) {
      set({
        items: get().items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      })
    } else {
      set({ items: [...get().items, { ...item, quantity: 1 }] })
    }
  },
  removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
  updateQty: (id, qty) => {
    if (qty <= 0) {
      set({ items: get().items.filter((i) => i.id !== id) })
    } else {
      set({ items: get().items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)) })
    }
  },
  clearCart: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}))
