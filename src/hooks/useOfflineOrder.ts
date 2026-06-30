// src/hooks/useOfflineOrder.ts
// Hook untuk handle submit order dengan fallback offline

import { useState, useCallback } from 'react'
import { isOnline, queueOfflineOrder, getOfflineQueue, clearOfflineQueue } from '@/lib/helpers'

interface OrderPayload {
  customerName?: string
  source: string
  paymentMethod: string
  locationTag: string
  notes?: string
  paymentProofUrl?: string
  isConfirmed: boolean
  items: { productId: number; quantity: number; sugarLevel: string }[]
}

export function useOfflineOrder() {
  const [syncing, setSyncing] = useState(false)

  const submitOrder = useCallback(async (payload: OrderPayload): Promise<{ success: boolean; orderId?: string; offline?: boolean; error?: string }> => {
    // Online — submit langsung
    if (isOnline()) {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        return { success: data.success, orderId: data.data?.id, error: data.error }
      } catch {
        // Kalau fetch gagal padahal "online", fallback ke offline queue
        queueOfflineOrder(payload)
        return { success: true, offline: true }
      }
    }

    // Offline — masuk queue
    queueOfflineOrder(payload)
    return { success: true, offline: true }
  }, [])

  const syncOfflineQueue = useCallback(async (): Promise<{ synced: number; failed: number }> => {
    const queue = getOfflineQueue()
    if (queue.length === 0) return { synced: 0, failed: 0 }

    setSyncing(true)
    let synced = 0
    let failed = 0

    const results = await Promise.allSettled(
      queue.map((entry) =>
        fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry.payload),
        }).then((r) => r.json())
      )
    )

    results.forEach((r) => {
      if (r.status === 'fulfilled' && r.value.success) synced++
      else failed++
    })

    if (failed === 0) clearOfflineQueue()
    setSyncing(false)

    return { synced, failed }
  }, [])

  const pendingCount = getOfflineQueue().length

  return { submitOrder, syncOfflineQueue, syncing, pendingCount }
}
