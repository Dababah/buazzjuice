'use client'
// src/app/admin/pos/page.tsx
// Kasir POS — tap produk, pilih gula, upload bukti QRIS, submit

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { formatRupiah, compressImage } from '@/lib/helpers'
import type { Product, SugarLevel } from '@/types'

type CartItem = { product: Product; quantity: number; sugarLevel: SugarLevel }
type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER'

const SUGAR_OPTIONS: { value: SugarLevel; label: string }[] = [
  { value: 'NO_SUGAR', label: 'Tanpa Gula' },
  { value: 'LESS_SUGAR', label: 'Kurang Manis' },
  { value: 'NORMAL', label: 'Normal' },
]

const LOCATIONS = ['LAPAK_UTAMA', 'SUNMOR_UGM', 'LAPAK_B', 'EVENT']

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState('Pelanggan')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [locationTag, setLocationTag] = useState('LAPAK_UTAMA')
  const [source, setSource] = useState<'LAPAK_OFFLINE' | 'WHATSAPP_ONLINE'>('LAPAK_OFFLINE')
  const [qrisProof, setQrisProof] = useState<File | null>(null)
  const [qrisPreview, setQrisPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/products').then((r) => r.json()).then((d) => setProducts(d.data || []))
  }, [])

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1, sugarLevel: 'NORMAL' }]
    })
  }

  const updateQty = (productId: number, qty: number) => {
    if (qty <= 0) setCart((prev) => prev.filter((i) => i.product.id !== productId))
    else setCart((prev) => prev.map((i) => i.product.id === productId ? { ...i, quantity: qty } : i))
  }

  const updateSugar = (productId: number, sugar: SugarLevel) => {
    setCart((prev) => prev.map((i) => i.product.id === productId ? { ...i, sugarLevel: sugar } : i))
  }

  const total = cart.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0)

  const handleQrisUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file, 800, 0.7)
    const compressedFile = new File([compressed], file.name, { type: 'image/webp' })
    setQrisProof(compressedFile)
    setQrisPreview(URL.createObjectURL(compressed))
  }

  const handleSubmit = async () => {
    if (cart.length === 0) return alert('Keranjang kosong!')
    setLoading(true)
    try {
      let paymentProofUrl: string | undefined

      // Upload bukti QRIS dulu kalau ada
      if (qrisProof && paymentMethod === 'QRIS') {
        const formData = new FormData()
        formData.append('file', qrisProof)
        formData.append('type', 'payment_proof')
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        const uploadData = await uploadRes.json()
        paymentProofUrl = uploadData.url
      }

      const payload = {
        customerName,
        source,
        paymentMethod,
        locationTag,
        paymentProofUrl,
        isConfirmed: true,
        items: cart.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          sugarLevel: i.sugarLevel,
        })),
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (data.success) {
        setSuccessMsg(`✅ Order ${data.data.id} berhasil dicatat! Total: ${formatRupiah(total)}`)
        setCart([])
        setCustomerName('Pelanggan')
        setQrisProof(null)
        setQrisPreview(null)
        // Refresh produk untuk update stok
        fetch('/api/products').then((r) => r.json()).then((d) => setProducts(d.data || []))
        setTimeout(() => setSuccessMsg(''), 5000)
      } else {
        alert('Error: ' + data.error)
      }
    } catch {
      alert('Gagal menyimpan order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <h2 className="font-headline font-black text-3xl uppercase mb-6">Kasir POS</h2>

      {successMsg && (
        <div className="mb-4 bg-primary-container border-2 border-primary p-4 font-label font-bold text-sm">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => p.currentStock > 0 && addToCart(p)}
                disabled={p.currentStock === 0}
                className={`border-2 border-pure-black p-3 text-left neubrutal-shadow-sm hover:-translate-y-0.5 transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                  p.currentStock === 0 ? 'bg-surface-dim opacity-50 cursor-not-allowed' : 'bg-white hover:bg-primary-container'
                }`}
              >
                <div className="aspect-square relative mb-2 bg-surface-container rounded overflow-hidden">
                  {p.imageUrl ? (
                    <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🥤</div>
                  )}
                  {p.currentStock <= p.lowStockAlert && p.currentStock > 0 && (
                    <span className="absolute top-1 right-1 bg-error text-on-error text-[9px] px-1 font-bold border border-pure-black">
                      TIPIS
                    </span>
                  )}
                </div>
                <p className="font-label font-bold text-xs leading-tight truncate">{p.name}</p>
                <p className="font-headline font-bold text-sm text-primary">{formatRupiah(Number(p.price))}</p>
                <p className="font-label font-bold text-[10px] text-on-surface-variant">Stok: {p.currentStock}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Cart + Order form */}
        <div className="space-y-4">
          {/* Cart */}
          <div className="bg-white border-2 border-pure-black neubrutal-shadow p-4">
            <h4 className="font-headline font-bold text-lg uppercase mb-4">Keranjang</h4>
            {cart.length === 0 ? (
              <p className="text-center py-8 text-on-surface-variant font-label font-bold text-sm">
                Tap produk untuk menambah
              </p>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.product.id} className="border-b border-pure-black/10 pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-label font-bold text-sm">{item.product.name}</span>
                      <span className="font-headline font-bold text-sm">
                        {formatRupiah(Number(item.product.price) * item.quantity)}
                      </span>
                    </div>
                    {/* Sugar selector */}
                    <div className="flex gap-1 mb-2">
                      {SUGAR_OPTIONS.map((s) => (
                        <button
                          key={s.value}
                          onClick={() => updateSugar(item.product.id, s.value)}
                          className={`flex-1 py-1 border border-pure-black font-label font-bold text-[9px] transition-colors ${
                            item.sugarLevel === s.value ? 'bg-primary text-on-primary' : 'bg-white hover:bg-surface-variant'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                    {/* Qty controls */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.product.id, item.quantity - 1)} className="w-7 h-7 border-2 border-pure-black bg-error-container flex items-center justify-center font-bold hover:bg-error hover:text-on-error">−</button>
                      <span className="font-headline font-bold w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product.id, item.quantity + 1)} className="w-7 h-7 border-2 border-pure-black bg-primary-container flex items-center justify-center font-bold hover:bg-primary hover:text-on-primary">+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {cart.length > 0 && (
              <div className="border-t-2 border-pure-black mt-4 pt-3 flex justify-between">
                <span className="font-label font-bold text-sm uppercase">Total</span>
                <span className="font-headline font-bold text-xl">{formatRupiah(total)}</span>
              </div>
            )}
          </div>

          {/* Order details */}
          <div className="bg-surface-container border-2 border-pure-black neubrutal-shadow p-4 space-y-3">
            <div>
              <label className="font-label font-bold text-xs uppercase block mb-1">Nama Pembeli</label>
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full border-2 border-pure-black px-3 py-2 font-body text-sm bg-white focus:outline-none focus:border-primary" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-label font-bold text-xs uppercase block mb-1">Pembayaran</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="w-full border-2 border-pure-black px-2 py-2 font-body text-sm bg-white focus:outline-none">
                  <option value="CASH">Cash</option>
                  <option value="QRIS">QRIS</option>
                  <option value="TRANSFER">Transfer</option>
                </select>
              </div>
              <div>
                <label className="font-label font-bold text-xs uppercase block mb-1">Lokasi</label>
                <select value={locationTag} onChange={(e) => setLocationTag(e.target.value)} className="w-full border-2 border-pure-black px-2 py-2 font-body text-sm bg-white focus:outline-none">
                  {LOCATIONS.map((l) => <option key={l} value={l}>{l.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="font-label font-bold text-xs uppercase block mb-1">Sumber Order</label>
              <div className="flex gap-2">
                {(['LAPAK_OFFLINE', 'WHATSAPP_ONLINE'] as const).map((s) => (
                  <button key={s} onClick={() => setSource(s)} className={`flex-1 py-2 border-2 border-pure-black font-label font-bold text-xs transition-colors ${source === s ? 'bg-primary text-on-primary' : 'bg-white hover:bg-surface-variant'}`}>
                    {s === 'LAPAK_OFFLINE' ? '🏪 Lapak' : '💬 WA'}
                  </button>
                ))}
              </div>
            </div>

            {/* QRIS proof upload */}
            {paymentMethod === 'QRIS' && (
              <div>
                <label className="font-label font-bold text-xs uppercase block mb-1">Bukti QRIS</label>
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleQrisUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-pure-black py-3 font-label font-bold text-xs uppercase hover:bg-sky-accent transition-colors">
                  {qrisPreview ? '📷 Ganti Foto' : '📷 Foto Bukti QRIS'}
                </button>
                {qrisPreview && (
                  <div className="mt-2 border-2 border-pure-black overflow-hidden">
                    <img src={qrisPreview} alt="QRIS proof" className="w-full h-32 object-cover" />
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || cart.length === 0}
              className="w-full py-4 bg-juice-orange text-white border-2 border-pure-black font-headline font-bold text-lg uppercase neubrutal-shadow hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed neubrutal-btn"
            >
              {loading ? 'Menyimpan...' : `✅ Simpan Order • ${formatRupiah(total)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
