'use client'
// src/components/admin/OfflineIndicator.tsx
// Indikator koneksi + sync button untuk kasir lapangan

import { useState, useEffect } from 'react'
import { useOfflineOrder } from '@/hooks/useOfflineOrder'

export default function OfflineIndicator() {
  const [online, setOnline] = useState(true)
  const { syncOfflineQueue, syncing, pendingCount } = useOfflineOrder()
  const [syncResult, setSyncResult] = useState<string | null>(null)

  useEffect(() => {
    setOnline(navigator.onLine)
    const handleOnline = () => { setOnline(true); handleSync() }
    const handleOffline = () => setOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleSync = async () => {
    if (pendingCount === 0) return
    const result = await syncOfflineQueue()
    setSyncResult(`✅ ${result.synced} order berhasil disync${result.failed > 0 ? `, ${result.failed} gagal` : ''}`)
    setTimeout(() => setSyncResult(null), 4000)
  }

  if (online && pendingCount === 0) return null

  return (
    <div className={`fixed top-16 left-0 right-0 z-50 mx-4 md:mx-8 border-2 border-pure-black p-3 flex items-center gap-3 neubrutal-shadow-sm ${
      online ? 'bg-sky-accent' : 'bg-error-container'
    }`}>
      <div className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-primary animate-pulse' : 'bg-error'}`} />
      <div className="flex-1">
        {!online ? (
          <p className="font-label font-bold text-xs">
            ⚠️ Offline — Order akan disimpan lokal & sync otomatis saat koneksi pulih
          </p>
        ) : (
          <p className="font-label font-bold text-xs">
            🔄 {pendingCount} order belum tersync
          </p>
        )}
        {syncResult && <p className="font-label font-bold text-xs text-primary mt-0.5">{syncResult}</p>}
      </div>
      {online && pendingCount > 0 && (
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-primary text-on-primary border-2 border-pure-black px-3 py-1.5 font-label font-bold text-xs uppercase disabled:opacity-50"
        >
          {syncing ? 'Syncing...' : `Sync (${pendingCount})`}
        </button>
      )}
    </div>
  )
}
