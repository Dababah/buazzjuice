// src/store/cart.ts
// Zustand cart store — pure client state, tidak ada server call

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, CartStore, SugarLevel } from '@/types'

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const items = get().items
        const existing = items.find(
          (i) => i.productId === newItem.productId && i.sugarLevel === newItem.sugarLevel
        )

        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === newItem.productId && i.sugarLevel === newItem.sugarLevel
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          })
        } else {
          set({ items: [...items, { ...newItem, quantity: 1 }] })
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) })
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        })
      },

      updateSugarLevel: (productId, sugarLevel: SugarLevel) => {
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, sugarLevel } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'buazzz-cart', // localStorage key
    }
  )
)
