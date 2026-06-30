'use client'
// src/app/admin/consignment/page.tsx

import { useState, useEffect } from 'react'
import { formatRupiah } from '@/lib/helpers'

interface ConsignmentItem {
  id: number
  storeName: string
  storeContact: string | null
  qtyConsigned: number
  qtySold: number
  qtyReturned: number
  pricePerUnit: number
  status: string
  createdAt: string
  product: { id: number; name: string }
}

interface Product { id: number; name: string; price: number }

export default function ConsignmentPage() {
  const [items, setItems] = useState<ConsignmentItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({
    storeName: '', storeContact: '', productId: '', qtyConsigned: '', pricePerUnit: '',
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/consignment').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
    ]).then(([c, p]) => {
      setItems(c.data || [])
      setProducts(p.data || [])
      setLoading(false)
    })
  }, [])

  const handleAI = async () => {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    setAiResult('')
    try {
      const res = await fetch('/api/ai/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      })
      const data = await res.json()
      if (data.success) {
        setAiResult(`✅ ${data.message}`)
        setAiPrompt('')
        // Refresh list
        fetch('/api/consignment').then((r) => r.json()).then((c) => setItems(c.data || []))
      } else {
        setAiResult(`❌ ${data.error}`)
      }
    } catch {
      setAiResult('❌ Gagal memproses perintah AI')
    } finally {
      setAiLoading(false)
    }
  }

  const handleAddConsignment = async () => {
    if (!form.storeName || !form.productId || !form.qtyConsigned) return alert('Isi semua field wajib!')
    try {
      const res = await fetch('/api/consignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: form.storeName,
          storeContact: form.storeContact || null,
          productId: Number(form.productId),
          qtyConsigned: Number(form.qtyConsigned),
          pricePerUnit: Number(form.pricePerUnit),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowAddForm(false)
        setForm({ storeName: '', storeContact: '', productId: '', qtyConsigned: '', pricePerUnit: '' })
        fetch('/api/consignment').then((r) => r.json()).then((c) => setItems(c.data || []))
      }
    } catch {
      alert('Gagal menambah konsinyasi')
    }
  }

  const activeItems = items.filter((i) => i.status === 'ACTIVE')
  const settledItems = items.filter((i) => i.status === 'SETTLED')

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="font-headline font-black text-3xl uppercase">Konsinyasi</h2>
          <p className="font-body text-sm text-on-surface-variant mt-1">
            Manajemen stok titipan di warung mitra
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-primary text-on-primary border-2 border-pure-black neubrutal-shadow-sm px-4 py-2 font-label font-bold text-sm uppercase"
        >
          + Titip Baru
        </button>
      </div>

      {/* AI Copilot */}
      <div className="mb-8 bg-tertiary-container border-2 border-pure-black neubrutal-shadow p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h4 className="font-headline font-bold text-lg uppercase">AI Copilot</h4>
            <p className="font-body text-xs text-on-surface-variant">
              Ketik rekap konsinyasi dalam bahasa natural
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAI()}
            placeholder='Contoh: "Warung Berkah laku 7 sisa 3" atau "Toko Madura sudah lunas semua"'
            className="flex-1 border-2 border-pure-black px-4 py-3 font-body text-sm bg-white focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleAI}
            disabled={aiLoading}
            className="bg-primary text-on-primary border-2 border-pure-black px-5 py-3 font-label font-bold text-sm uppercase disabled:opacity-50"
          >
            {aiLoading ? '...' : 'Proses'}
          </button>
        </div>
        {aiResult && (
          <div className={`mt-3 p-3 border-2 border-pure-black font-label font-bold text-sm ${aiResult.startsWith('✅') ? 'bg-primary-container' : 'bg-error-container'}`}>
            {aiResult}
          </div>
        )}
        <p className="font-label font-bold text-xs text-on-surface-variant mt-3 opacity-70">
          💡 Tips: Sebutkan nama warung + jumlah laku + jumlah kembali
        </p>
      </div>

      {/* Add form modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface border-2 border-pure-black neubrutal-shadow w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline font-bold text-xl uppercase">Titip Stok Baru</h3>
              <button onClick={() => setShowAddForm(false)} className="w-8 h-8 border-2 border-pure-black flex items-center justify-center">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-label font-bold text-xs uppercase block mb-1">Nama Warung *</label>
                <input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} className="w-full border-2 border-pure-black px-3 py-2 bg-white focus:outline-none" />
              </div>
              <div>
                <label className="font-label font-bold text-xs uppercase block mb-1">No WA Mitra</label>
                <input value={form.storeContact} onChange={(e) => setForm({ ...form, storeContact: e.target.value })} placeholder="628..." className="w-full border-2 border-pure-black px-3 py-2 bg-white focus:outline-none" />
              </div>
              <div>
                <label className="font-label font-bold text-xs uppercase block mb-1">Produk *</label>
                <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value, pricePerUnit: String(products.find((p) => p.id === Number(e.target.value))?.price || '') })} className="w-full border-2 border-pure-black px-3 py-2 bg-white focus:outline-none">
                  <option value="">Pilih produk...</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-label font-bold text-xs uppercase block mb-1">Qty Dititip *</label>
                  <input type="number" value={form.qtyConsigned} onChange={(e) => setForm({ ...form, qtyConsigned: e.target.value })} className="w-full border-2 border-pure-black px-3 py-2 bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="font-label font-bold text-xs uppercase block mb-1">Harga/botol</label>
                  <input type="number" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })} className="w-full border-2 border-pure-black px-3 py-2 bg-white focus:outline-none" />
                </div>
              </div>
              <button onClick={handleAddConsignment} className="w-full py-3 bg-primary text-on-primary border-2 border-pure-black font-label font-bold text-sm uppercase">
                Simpan Konsinyasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active consignments */}
      <div className="mb-8">
        <h3 className="font-headline font-bold text-xl uppercase mb-4">
          Aktif ({activeItems.length})
        </h3>
        {loading ? (
          <p className="text-on-surface-variant font-label font-bold text-sm">Loading...</p>
        ) : activeItems.length === 0 ? (
          <div className="border-2 border-dashed border-pure-black p-8 text-center text-on-surface-variant">
            <p className="font-label font-bold text-sm">Belum ada konsinyasi aktif</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeItems.map((item) => (
              <div key={item.id} className="bg-white border-2 border-pure-black neubrutal-shadow-sm p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-headline font-bold text-lg uppercase">{item.storeName}</h4>
                    <p className="font-body text-xs text-on-surface-variant">{item.product.name}</p>
                  </div>
                  <span className="bg-primary-container border border-pure-black px-2 py-1 font-label font-bold text-xs">AKTIF</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-sky-accent p-2 border border-pure-black">
                    <p className="font-headline font-bold text-xl">{item.qtyConsigned}</p>
                    <p className="font-label font-bold text-[10px] uppercase">Dititip</p>
                  </div>
                  <div className="bg-secondary-container p-2 border border-pure-black">
                    <p className="font-headline font-bold text-xl">{item.qtySold}</p>
                    <p className="font-label font-bold text-[10px] uppercase">Laku</p>
                  </div>
                  <div className="bg-tertiary-container p-2 border border-pure-black">
                    <p className="font-headline font-bold text-xl">{item.qtyReturned}</p>
                    <p className="font-label font-bold text-[10px] uppercase">Kembali</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="font-label font-bold text-xs text-on-surface-variant">
                    Sisa: {item.qtyConsigned - item.qtySold - item.qtyReturned} botol
                  </span>
                  <span className="font-headline font-bold text-sm text-primary">
                    {formatRupiah(item.qtySold * Number(item.pricePerUnit))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settled history */}
      {settledItems.length > 0 && (
        <div>
          <h3 className="font-headline font-bold text-xl uppercase mb-4 text-on-surface-variant">
            Sudah Settled ({settledItems.length})
          </h3>
          <div className="space-y-2">
            {settledItems.slice(0, 5).map((item) => (
              <div key={item.id} className="border-2 border-pure-black/30 p-4 flex justify-between items-center bg-surface-dim opacity-70">
                <div>
                  <p className="font-label font-bold text-sm">{item.storeName} — {item.product.name}</p>
                  <p className="font-label font-bold text-xs text-on-surface-variant">
                    {item.qtySold} laku • {new Date(item.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <span className="font-headline font-bold text-sm">{formatRupiah(item.qtySold * Number(item.pricePerUnit))}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
