'use client'
// src/components/consumer/CartBar.tsx
// Floating cart bar + WA checkout modal

import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { openWAOrder } from '@/lib/whatsapp'
import { formatRupiah } from '@/lib/helpers'

const SUGAR_LABEL: Record<string, string> = {
  NO_SUGAR: 'Tanpa Gula',
  LESS_SUGAR: 'Kurang Manis',
  NORMAL: 'Normal',
}

export default function CartBar() {
  const items = useCartStore((s) => s.items)
  const totalItems = useCartStore((s) => s.totalItems())
  const totalPrice = useCartStore((s) => s.totalPrice())
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const clearCart = useCartStore((s) => s.clearCart)

  const [showModal, setShowModal] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS'>('CASH')

  if (totalItems === 0) return null

  const handleCheckout = () => {
    if (!customerName.trim()) {
      alert('Masukkan nama kamu dulu ya!')
      return
    }
    openWAOrder(items, customerName, notes, paymentMethod)
    setShowModal(false)
    clearCart()
    setCustomerName('')
    setNotes('')
    setPaymentMethod('CASH')
  }

  return (
    <>
      {/* Floating Cart Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-lg">
        <div className="bg-sky-accent border-2 border-pure-black neubrutal-shadow p-3 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 pl-2">
            <div className="relative">
              <span className="text-3xl">🛒</span>
              <span className="absolute -top-1 -right-1 bg-juice-orange text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-pure-black font-bold">
                {totalItems}
              </span>
            </div>
            <div>
              <p className="font-label font-bold text-xs leading-none">{totalItems} Item</p>
              <p className="font-headline font-bold text-xl leading-tight">{formatRupiah(totalPrice)}</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="neubrutal-btn bg-primary text-white border-2 border-pure-black px-5 py-3 rounded-lg font-label font-bold text-sm uppercase neubrutal-shadow-sm"
          >
            Pesan via WA
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-end md:items-center justify-center p-4">
          <div className="bg-surface w-full max-w-lg border-2 border-pure-black neubrutal-shadow rounded-xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-primary-container border-b-2 border-pure-black p-5 flex justify-between items-center shrink-0">
              <h3 className="font-headline font-bold text-2xl uppercase">Ringkasan Order</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 border-2 border-pure-black bg-white flex items-center justify-center hover:bg-error-container"
              >
                ✕
              </button>
            </div>

            {/* Content Area (Scrollable) */}
            <div className="flex-1 overflow-y-auto">
              {/* Items */}
              <div className="p-5 space-y-3">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.sugarLevel}`} className="flex justify-between items-center">
                    <div>
                      <p className="font-label font-bold text-sm">{item.name}</p>
                      <p className="text-xs text-on-surface-variant">{SUGAR_LABEL[item.sugarLevel]}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-7 h-7 border-2 border-pure-black bg-white flex items-center justify-center font-bold hover:bg-error-container"
                      >
                        −
                      </button>
                      <span className="font-headline font-bold w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-7 h-7 border-2 border-pure-black bg-primary-container flex items-center justify-center font-bold hover:bg-primary hover:text-white"
                      >
                        +
                      </button>
                      <span className="font-label font-bold text-sm w-20 text-right">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t-2 border-b-2 border-pure-black px-5 py-4 flex justify-between items-center bg-surface-container-low">
                <span className="font-label font-bold text-sm uppercase">Total Tagihan</span>
                <span className="font-headline font-bold text-2xl text-primary">{formatRupiah(totalPrice)}</span>
              </div>

              {/* Form & Payment */}
              <div className="p-5 space-y-4">
                <div>
                  <label className="font-label font-bold text-xs uppercase block mb-2">
                    Nama Kamu <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Budi"
                    className="w-full border-2 border-pure-black px-4 py-3 font-body text-sm focus:outline-none focus:border-primary bg-white"
                  />
                </div>
                <div>
                  <label className="font-label font-bold text-xs uppercase block mb-2">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Tolong dingin-in dulu, atau pick up di Sunmor"
                    rows={2}
                    className="w-full border-2 border-pure-black px-4 py-3 font-body text-sm focus:outline-none focus:border-primary bg-white resize-none"
                  />
                </div>

                {/* Payment Selection */}
                <div>
                  <label className="font-label font-bold text-xs uppercase block mb-2">
                    Metode Pembayaran <span className="text-error">*</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CASH')}
                      className={`flex-1 py-3 border-2 border-pure-black font-label font-bold text-xs uppercase transition-all ${
                        paymentMethod === 'CASH'
                          ? 'bg-primary text-on-primary'
                          : 'bg-white text-on-surface hover:bg-surface-variant'
                      }`}
                    >
                      💵 Cash (Lapak)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('QRIS')}
                      className={`flex-1 py-3 border-2 border-pure-black font-label font-bold text-xs uppercase transition-all ${
                        paymentMethod === 'QRIS'
                          ? 'bg-primary text-on-primary'
                          : 'bg-white text-on-surface hover:bg-surface-variant'
                      }`}
                    >
                      📱 QRIS (Scan)
                    </button>
                  </div>
                </div>

                {/* Conditional QRIS Display */}
                {paymentMethod === 'QRIS' && (
                  <div className="border-2 border-pure-black bg-white p-4 text-center rounded-lg">
                    <p className="font-label font-bold text-xs uppercase mb-3 text-juice-orange">
                      Scan QRIS BUAZZZ Juice
                    </p>
                    <div className="relative w-48 mx-auto border-2 border-pure-black mb-3 overflow-hidden rounded-md bg-white">
                      <img
                        src="/images/qris.jpg"
                        alt="QRIS Buazzz Juice"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                    <p className="font-body text-xs text-on-surface-variant">
                      Total Transfer: <strong className="text-sm font-headline text-primary">{formatRupiah(totalPrice)}</strong>
                    </p>
                    <p className="font-body text-[10px] text-on-surface-variant mt-2 leading-relaxed">
                      Silakan scan dan bayar sebelum menekan tombol Kirim Order. Bukti bayar bisa dikirimkan ke WhatsApp admin.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-5 border-t-2 border-pure-black bg-white shrink-0">
              <button
                onClick={handleCheckout}
                className="neubrutal-btn w-full bg-juice-orange text-white border-2 border-pure-black py-4 font-headline font-bold text-lg uppercase neubrutal-shadow"
              >
                🚀 Kirim Order via WhatsApp
              </button>
              <p className="text-[10px] text-center text-on-surface-variant mt-2">
                Pesanan akan langsung terkirim ke chat WhatsApp admin BUAZZZ untuk konfirmasi pesanan Anda.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
