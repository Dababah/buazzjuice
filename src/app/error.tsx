'use client'
// src/app/error.tsx
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="font-headline font-bold text-3xl uppercase mb-4">Terjadi Error</h2>
        <p className="font-body text-sm text-on-surface-variant mb-8 bg-error-container border-2 border-error p-4">
          {error.message || 'Something went wrong'}
        </p>
        <button
          onClick={() => reset()}
          className="neubrutal-btn neubrutal-shadow bg-primary text-on-primary border-2 border-pure-black px-8 py-4 font-headline font-bold text-lg uppercase"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  )
}
