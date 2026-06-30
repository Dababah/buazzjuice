'use client'
// src/app/admin/stock/page.tsx
// Manajemen stok produk + catat pengeluaran operasional

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { formatRupiah, compressImage } from '@/lib/helpers'
import type { Product } from '@/types'

interface Expense {
  id: number
  description: string
  amount: number
  category: string
  locationTag: string
  receiptUrl: string | null
  createdAt: string
}

const EXPENSE_CATEGORIES = ['BAHAN_BAKU', 'KEMASAN', 'TRANSPORT', 'OPERASIONAL']
const LOCATIONS = ['LAPAK_UTAMA', 'SUNMOR_UGM', 'LAPAK_B', 'EVENT']

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'stock' | 'expense'>('stock')
  const [expenseForm, setExpenseForm] = useState({
    description: '', amount: '', category: 'OPERASIONAL', locationTag: 'LAPAK_UTAMA',
  })
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [savingExpense, setSavingExpense] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [pRes, eRes] = await Promise.all([
        fetch('/api/products?all=true'),
        fetch('/api/inventory'),
      ])
      const [pData, eData] = await Promise.all([pRes.json(), eRes.json()])
      setProducts(pData.data || [])
      setExpenses(eData.data?.expenses || [])
    } finally {
      setLoading(false)
    }
  }

  const updateStock = async (productId: number, delta: number, currentStock: number) => {
    const newStock = Math.max(0, currentStock + delta)
    await fetch(`/api/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentStock: newStock }),
    })
    setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, currentStock: newStock } : p))
  }

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file, 800, 0.7)
    setReceiptFile(new File([compressed], file.name, { type: 'image/webp' }))
    setReceiptPreview(URL.createObjectURL(compressed))
  }

  const submitExpense = async () => {
    if (!expenseForm.description || !expenseForm.amount) return alert('Isi deskripsi dan jumlah!')
    setSavingExpense(true)
    try {
      let receiptUrl: string | undefined
      if (receiptFile) {
        const fd = new FormData()
        fd.append('file', receiptFile)
        fd.append('type', 'receipt')
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
        const upData = await upRes.json()
        receiptUrl = upData.url
      }

      await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...expenseForm, amount: Number(expenseForm.amount), receiptUrl }),
      })

      setExpenseForm({ description: '', amount: '', category: 'OPERASIONAL', locationTag: 'LAPAK_UTAMA' })
      setReceiptFile(null)
      setReceiptPreview(null)
      await loadData()
    } finally {
      setSavingExpense(false)
    }
  }

  const totalExpenseToday = expenses
    .filter((e) => new Date(e.createdAt).toDateString() === new Date().toDateString())
    .reduce((s, e) => s + Number(e.amount), 0)

  return (
    <div className="p-4 md:p-8">
      <h2 className="font-headline font-black text-3xl uppercase mb-6">Stok & Pengeluaran</h2>

      {/* Tab */}
      <div className="flex gap-0 border-2 border-pure-black mb-6 w-fit">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-6 py-3 font-label font-bold text-sm uppercase transition-colors ${activeTab === 'stock' ? 'bg-primary text-on-primary' : 'bg-white hover:bg-surface-variant'}`}
        >
          📦 Stok Produk
        </button>
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-6 py-3 font-label font-bold text-sm uppercase transition-colors border-l-2 border-pure-black ${activeTab === 'expense' ? 'bg-primary text-on-primary' : 'bg-white hover:bg-surface-variant'}`}
        >
          🧾 Pengeluaran
        </button>
      </div>

      {/* STOCK TAB */}
      {activeTab === 'stock' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <p className="col-span-3 text-center py-10 text-on-surface-variant font-label font-bold text-sm">Loading...</p>
          ) : (
            products.map((p) => (
              <div key={p.id} className={`bg-white border-2 border-pure-black neubrutal-shadow-sm p-5 ${!p.isAvailable ? 'opacity-50' : ''}`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-14 h-14 border-2 border-pure-black bg-surface-container rounded flex items-center justify-center overflow-hidden shrink-0">
                    {p.imageUrl ? (
                      <Image src={p.imageUrl} alt={p.name} width={56} height={56} className="object-cover" />
                    ) : (
                      <span className="text-2xl">🥤</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-label font-bold text-sm truncate">{p.name}</p>
                    <p className="font-body text-xs text-on-surface-variant">{p.category}</p>
                    <p className="font-headline font-bold text-base text-primary">{formatRupiah(Number(p.price))}</p>
                  </div>
                </div>

                <div className={`text-center py-2 border-2 border-pure-black mb-3 ${
                  p.currentStock === 0 ? 'bg-error text-on-error' :
                  p.currentStock <= p.lowStockAlert ? 'bg-error-container text-on-error-container' :
                  'bg-primary-container text-on-primary-container'
                }`}>
                  <p className="font-headline font-bold text-2xl">{p.currentStock}</p>
                  <p className="font-label font-bold text-[10px] uppercase">botol tersisa</p>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => updateStock(p.id, -1, p.currentStock)} className="flex-1 py-2 border-2 border-pure-black bg-error-container hover:bg-error hover:text-on-error font-headline font-bold text-lg transition-colors">−</button>
                  <button onClick={() => updateStock(p.id, 10, p.currentStock)} className="flex-1 py-2 border-2 border-pure-black bg-primary-container hover:bg-primary hover:text-on-primary font-label font-bold text-xs uppercase transition-colors">+10</button>
                  <button onClick={() => updateStock(p.id, 1, p.currentStock)} className="flex-1 py-2 border-2 border-pure-black bg-primary-container hover:bg-primary hover:text-on-primary font-headline font-bold text-lg transition-colors">+</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* EXPENSE TAB */}
      {activeTab === 'expense' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form tambah pengeluaran */}
          <div className="bg-white border-2 border-pure-black neubrutal-shadow p-6 space-y-4">
            <h3 className="font-headline font-bold text-xl uppercase">Catat Pengeluaran</h3>
            <div>
              <label className="font-label font-bold text-xs uppercase block mb-1">Deskripsi *</label>
              <input
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                placeholder="Contoh: Beli buah mangga 5kg"
                className="w-full border-2 border-pure-black px-3 py-2 font-body text-sm bg-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-label font-bold text-xs uppercase block mb-1">Jumlah (Rp) *</label>
                <input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="50000"
                  className="w-full border-2 border-pure-black px-3 py-2 font-body text-sm bg-surface focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="font-label font-bold text-xs uppercase block mb-1">Kategori</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full border-2 border-pure-black px-2 py-2 font-body text-sm bg-surface focus:outline-none"
                >
                  {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="font-label font-bold text-xs uppercase block mb-1">Lokasi</label>
              <select
                value={expenseForm.locationTag}
                onChange={(e) => setExpenseForm({ ...expenseForm, locationTag: e.target.value })}
                className="w-full border-2 border-pure-black px-3 py-2 font-body text-sm bg-surface focus:outline-none"
              >
                {LOCATIONS.map((l) => <option key={l} value={l}>{l.replace('_', ' ')}</option>)}
              </select>
            </div>

            {/* Foto nota */}
            <div>
              <label className="font-label font-bold text-xs uppercase block mb-1">Foto Nota (Opsional)</label>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleReceiptUpload} className="hidden" />
              <button onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-pure-black py-3 font-label font-bold text-xs uppercase hover:bg-sky-accent transition-colors">
                {receiptPreview ? '📷 Ganti Foto Nota' : '📷 Foto Nota Belanja'}
              </button>
              {receiptPreview && (
                <div className="mt-2 border-2 border-pure-black overflow-hidden">
                  <img src={receiptPreview} alt="Receipt" className="w-full h-28 object-cover" />
                </div>
              )}
            </div>

            <button
              onClick={submitExpense}
              disabled={savingExpense}
              className="w-full py-4 bg-juice-orange text-white border-2 border-pure-black font-headline font-bold text-base uppercase neubrutal-btn neubrutal-shadow disabled:opacity-50"
            >
              {savingExpense ? 'Menyimpan...' : `💾 Simpan Pengeluaran${expenseForm.amount ? ` • ${formatRupiah(Number(expenseForm.amount))}` : ''}`}
            </button>
          </div>

          {/* List pengeluaran hari ini */}
          <div className="bg-surface-container-high border-2 border-pure-black neubrutal-shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline font-bold text-xl uppercase">Pengeluaran Hari Ini</h3>
              <span className="font-headline font-bold text-lg text-error">{formatRupiah(totalExpenseToday)}</span>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {expenses
                .filter((e) => new Date(e.createdAt).toDateString() === new Date().toDateString())
                .map((e) => (
                  <div key={e.id} className="border-2 border-pure-black p-3 bg-white flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-label font-bold text-sm truncate">{e.description}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="font-label font-bold text-[10px] bg-surface-container border border-pure-black px-1.5 py-0.5">
                          {e.category.replace('_', ' ')}
                        </span>
                        <span className="font-label font-bold text-[10px] text-on-surface-variant">
                          {new Date(e.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-headline font-bold text-sm text-error">{formatRupiah(Number(e.amount))}</p>
                      {e.receiptUrl && (
                        <a href={e.receiptUrl} target="_blank" rel="noopener noreferrer" className="font-label font-bold text-[10px] text-primary underline">
                          📷 Nota
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              {expenses.filter((e) => new Date(e.createdAt).toDateString() === new Date().toDateString()).length === 0 && (
                <div className="text-center py-8 text-on-surface-variant">
                  <p className="font-label font-bold text-sm">Belum ada pengeluaran hari ini</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
