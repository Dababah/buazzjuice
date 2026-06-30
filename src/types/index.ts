// src/types/index.ts
// Shared TypeScript types untuk seluruh project BUAZZZ

// ─── Cart Types (Client-side only) ───────────────────────────────────────────

export type SugarLevel = 'NO_SUGAR' | 'LESS_SUGAR' | 'NORMAL'

export interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  sugarLevel: SugarLevel
  imageUrl?: string | null
}

export interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  updateSugarLevel: (productId: number, sugarLevel: SugarLevel) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

// ─── Product Types ────────────────────────────────────────────────────────────

export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  currentStock: number
  lowStockAlert: number
  isAvailable: boolean
  category: string
  createdAt: Date
  updatedAt: Date
}

export type ProductCategory = 'PURE' | 'SMOOTHIES' | 'MIXOLOGY'

// ─── Order Types ──────────────────────────────────────────────────────────────

export type OrderSource = 'LAPAK_OFFLINE' | 'WHATSAPP_ONLINE' | 'KONSINYASI'
export type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER'

export interface CreateOrderPayload {
  customerName?: string
  source: OrderSource
  paymentMethod: PaymentMethod
  locationTag: string
  notes?: string
  items: {
    productId: number
    quantity: number
    sugarLevel: SugarLevel
  }[]
}

export interface OrderWithItems {
  id: string
  customerName: string
  totalPrice: number
  source: OrderSource
  paymentMethod: string
  paymentProofUrl: string | null
  isConfirmed: boolean
  locationTag: string
  notes: string | null
  createdAt: Date
  items: {
    id: number
    quantity: number
    sugarLevel: SugarLevel
    priceAtPurchase: number
    subtotal: number
    product: {
      id: number
      name: string
      imageUrl: string | null
    }
  }[]
}

// ─── Consignment Types ────────────────────────────────────────────────────────

export interface ConsignmentStock {
  id: number
  storeName: string
  storeContact: string | null
  productId: number
  qtyConsigned: number
  qtySold: number
  qtyReturned: number
  pricePerUnit: number
  status: 'ACTIVE' | 'SETTLED'
  settledAt: Date | null
  createdAt: Date
  product: Product
}

export interface ConsignmentRecapPayload {
  storeName: string
  qtySold: number
  qtyReturned: number
}

// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface DashboardStats {
  todayRevenue: number
  todayProfit: number
  todayExpense: number
  todayOrders: number
  revenueChangePercent: number
  lowStockProducts: Product[]
  recentOrders: OrderWithItems[]
  topProducts: { name: string; sold: number; revenue: number }[]
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface JWTPayload {
  userId: number
  name: string
  iat: number
  exp: number
}
