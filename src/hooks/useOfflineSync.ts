// src/hooks/useOfflineSync.ts
// Sinkronisasi order offline ke server ketika koneksi pulih
// Penting untuk lapak Sunmor UGM yang sinyal sering putus

import { useEffect, useCallback } from 'react'
import { getOfflineQueue, clearOfflineQueue, isOnline } from '@/lib/helpers'

export function useOfflineSync() {
  const syncQueue = useCallback(async () => {
    const queue = getOfflineQueue()
    if (queue.length === 0) return

    console.log(`[OfflineSync] Syncing ${queue.length} offline orders...`)

    const results = await Promise.allSettled(
      queue.map(async (entry) => {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry.payload),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
    )

    const failed = results.filter((r) => r.status === 'rejected')
    const success = results.filter((r) => r.status === 'fulfilled')

    console.log(`[OfflineSync] ${success.length} synced, ${failed.length} failed`)

    if (failed.length === 0) {
      clearOfflineQueue()
      console.log('[OfflineSync] Queue cleared')
    }
  }, [])

  useEffect(() => {
    // Sync ketika tab pertama kali dibuka dan online
    if (isOnline()) {
      syncQueue()
    }

    // Sync ketika koneksi pulih
    window.addEventListener('online', syncQueue)
    return () => window.removeEventListener('online', syncQueue)
  }, [syncQueue])

  return { syncQueue }
}
