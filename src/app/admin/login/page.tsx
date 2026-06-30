'use client'
// src/app/admin/login/page.tsx
// PIN-based login dengan auto-submit setelah 6 digit

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const PIN_LENGTH = 6

export default function AdminLoginPage() {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  // Auto-submit ketika PIN sudah 6 digit
  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      handleSubmit(pin)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin])

  const handleSubmit = async (pinValue: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinValue }),
      })
      const data = await res.json()

      if (data.success) {
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        setError(data.error || 'PIN salah')
        setShake(true)
        setTimeout(() => {
          setShake(false)
          setPin('')
        }, 600)
      }
    } catch {
      setError('Gagal terhubung ke server')
      setPin('')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (digit: string) => {
    if (pin.length < PIN_LENGTH && !loading) {
      setPin((prev) => prev + digit)
    }
  }

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1))
    setError('')
  }

  const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-headline font-black text-5xl uppercase text-juice-orange mb-2">
            BUAZZZ
          </h1>
          <p className="font-label font-bold text-xs uppercase text-on-surface-variant tracking-widest">
            ADMIN DASHBOARD
          </p>
        </div>

        {/* PIN Display */}
        <div
          className={`bg-white border-2 border-pure-black neubrutal-shadow p-8 mb-6 ${
            shake ? 'animate-[shake_0.5s_ease-in-out]' : ''
          }`}
        >
          <p className="font-label font-bold text-xs uppercase text-center mb-6 text-on-surface-variant">
            Masukkan PIN Admin
          </p>

          {/* Dots */}
          <div className="flex justify-center gap-4 mb-6">
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 border-pure-black transition-all duration-150 ${
                  i < pin.length
                    ? 'bg-primary scale-110'
                    : 'bg-surface-container'
                }`}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-error-container border-2 border-error text-on-error-container px-4 py-2 text-center font-label font-bold text-sm mb-4">
              {error}
            </div>
          )}

          {loading && (
            <p className="text-center font-label font-bold text-xs text-primary animate-pulse">
              Memverifikasi...
            </p>
          )}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3">
          {KEYS.map((key, idx) => {
            if (key === '') return <div key={idx} />
            if (key === '⌫') {
              return (
                <button
                  key={idx}
                  onClick={handleDelete}
                  disabled={loading}
                  className="neubrutal-btn bg-error-container text-on-error-container border-2 border-pure-black py-5 font-headline font-bold text-2xl neubrutal-shadow-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
                >
                  {key}
                </button>
              )
            }
            return (
              <button
                key={idx}
                onClick={() => handleKeyPress(key)}
                disabled={loading}
                className="neubrutal-btn bg-white border-2 border-pure-black py-5 font-headline font-bold text-2xl neubrutal-shadow-sm hover:bg-primary-container active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
              >
                {key}
              </button>
            )
          })}
        </div>

        <p className="text-center font-label font-bold text-xs text-on-surface-variant mt-6 opacity-50">
          BUAZZZ JUICE Management System
        </p>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  )
}
