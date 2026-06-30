'use client'
// src/app/admin/products/page.tsx
// CRUD produk — tambah, edit, toggle availability, upload foto

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { formatRupiah, compressImage } from '@/lib/helpers'
import type { Product } from '@/types'

const CATEGORIES = ['PURE', 'SMOOTHIES', 'MIXOLOGY']

const EMPTY_FORM = {
  name: '', description: '', price: '', currentStock: '', lowStockAlert: '10', category: 'PURE', imageUrl: '',
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadProducts() }, [])

  const loadProducts = async () => {
    setLoading(true)
    const res = await fetch('/api/products?all=true')
    const data = await res.json()
    setProducts(data.data || [])
    setLoading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file, 800, 0.8)
    setImageFile(new File([compressed], file.name, { type: 'image/webp' }))
    setImagePreview(URL.createObjectURL(compressed))
  }

  const openAddForm = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setImageFile(null)
    setImagePreview(null)
    setShowForm(true)
  }

  const openEditForm = (p: Product) => {
    setForm({
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      currentStock: String(p.currentStock),
      lowStockAlert: String(p.lowStockAlert),
      category: p.category,
      imageUrl: p.imageUrl || '',
    })
    setEditingId(p.id)
    setImagePreview(p.imageUrl || null)
    setImageFile(null)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.price) return alert('Nama dan harga wajib diisi!')
    setSaving(true)

    try {
      let imageUrl = form.imageUrl

      // Upload foto baru jika ada
      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        fd.append('type', 'product')
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
        const upData = await upRes.json()
        if (upData.url) imageUrl = upData.url
      }

      const payload = {
        name: form.name,
        description: form.description || null,
        price: Number(form.price),
        currentStock: Number(form.currentStock) || 0,
        lowStockAlert: Number(form.lowStockAlert) || 10,
        category: form.category,
        imageUrl: imageUrl || null,
      }

      if (editingId) {
        await fetch(`/api/products/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      setShowForm(false)
      await loadProducts()
    } finally {
      setSaving(false)
    }
  }

  const toggleAvailability = async (p: Product) => {
    await fetch(`/api/products/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: !p.isAvailable }),
    })
    await loadProducts()
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-headline font-black text-3xl uppercase">Produk</h2>
          <p className="font-body text-sm text-on-surface-variant mt-1">{products.length} produk terdaftar</p>
        </div>
        <button onClick={openAddForm} className="bg-primary text-on-primary border-2 border-pure-black neubrutal-shadow-sm px-5 py-3 font-label font-bold text-sm uppercase hover:bg-juice-orange transition-colors">
          + Tambah Produk
        </button>
      </div>

      {/* Product grid */}
      {loading ? (
        <p className="text-center py-20 text-on-surface-variant font-label font-bold text-sm">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p.id} className={`bg-white border-2 border-pure-black neubrutal-shadow-sm overflow-hidden ${!p.isAvailable ? 'opacity-60' : ''}`}>
              <div className="aspect-square relative bg-surface-container">
                {p.imageUrl ? (
                  <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">🥤</div>
                )}
                <div className="absolute top-2 left-2">
                  <span className={`font-label font-bold text-[10px] px-2 py-1 border border-pure-black ${
                    p.currentStock === 0 ? 'bg-error text-on-error' :
                    p.currentStock <= p.lowStockAlert ? 'bg-error-container' :
                    'bg-primary-container'
                  }`}>
                    {p.currentStock} stok
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="font-label font-bold text-[10px] px-2 py-1 border border-pure-black bg-sky-accent">
                    {p.category}
                  </span>
                </div>
              </div>
              <div className="p-4 border-t-2 border-pure-black">
                <h4 className="font-headline font-bold text-base uppercase truncate">{p.name}</h4>
                <p className="font-headline font-bold text-lg text-primary">{formatRupiah(Number(p.price))}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEditForm(p)} className="flex-1 py-2 border-2 border-pure-black bg-sky-accent font-label font-bold text-xs uppercase hover:bg-primary hover:text-on-primary transition-colors">
                    ✏️ Edit
                  </button>
                  <button onClick={() => toggleAvailability(p)} className={`flex-1 py-2 border-2 border-pure-black font-label font-bold text-xs uppercase transition-colors ${p.isAvailable ? 'bg-error-container hover:bg-error hover:text-on-error' : 'bg-primary-container hover:bg-primary hover:text-on-primary'}`}>
                    {p.isAvailable ? '🚫 Hide' : '✅ Show'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface border-2 border-pure-black neubrutal-shadow w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-primary-container border-b-2 border-pure-black p-5 flex justify-between items-center">
              <h3 className="font-headline font-bold text-xl uppercase">
                {editingId ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 border-2 border-pure-black bg-white flex items-center justify-center">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Image upload */}
              <div>
                <label className="font-label font-bold text-xs uppercase block mb-2">Foto Produk</label>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
                <button onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-pure-black py-3 font-label font-bold text-xs uppercase hover:bg-sky-accent transition-colors">
                  {imagePreview ? '📷 Ganti Foto' : '📷 Upload Foto Produk'}
                </button>
                {imagePreview && (
                  <div className="mt-2 border-2 border-pure-black overflow-hidden aspect-square relative">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="font-label font-bold text-xs uppercase block mb-1">Nama Produk *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border-2 border-pure-black px-3 py-2 bg-white focus:outline-none" />
              </div>
              <div>
                <label className="font-label font-bold text-xs uppercase block mb-1">Deskripsi</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border-2 border-pure-black px-3 py-2 bg-white focus:outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label font-bold text-xs uppercase block mb-1">Harga (Rp) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border-2 border-pure-black px-3 py-2 bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="font-label font-bold text-xs uppercase block mb-1">Stok Awal</label>
                  <input type="number" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: e.target.value })} className="w-full border-2 border-pure-black px-3 py-2 bg-white focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label font-bold text-xs uppercase block mb-1">Alert Stok Kritis</label>
                  <input type="number" value={form.lowStockAlert} onChange={(e) => setForm({ ...form, lowStockAlert: e.target.value })} className="w-full border-2 border-pure-black px-3 py-2 bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="font-label font-bold text-xs uppercase block mb-1">Kategori</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border-2 border-pure-black px-2 py-2 bg-white focus:outline-none">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <button onClick={handleSubmit} disabled={saving} className="w-full py-4 bg-primary text-on-primary border-2 border-pure-black font-headline font-bold text-base uppercase neubrutal-shadow disabled:opacity-50 neubrutal-btn">
                {saving ? 'Menyimpan...' : editingId ? '✅ Simpan Perubahan' : '✅ Tambah Produk'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
