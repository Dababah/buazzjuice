'use client'
// src/components/consumer/CatalogSection.tsx

import { useState } from 'react'
import Image from 'next/image'
import { useCartStore } from '@/store/cart'
import type { Product } from '@/types'
import type { SugarLevel } from '@/types'
import { formatRupiah } from '@/lib/helpers'

const SUGAR_OPTIONS: { value: SugarLevel; label: string }[] = [
  { value: 'NO_SUGAR', label: 'Tanpa Gula' },
  { value: 'LESS_SUGAR', label: 'Kurang Manis' },
  { value: 'NORMAL', label: 'Normal' },
]

const CATEGORIES = ['SEMUA', 'PURE', 'SMOOTHIES', 'MIXOLOGY']

interface CatalogSectionProps {
  products: Product[]
}

export default function CatalogSection({ products }: CatalogSectionProps) {
  const [activeCategory, setActiveCategory] = useState('SEMUA')
  const addItem = useCartStore((s) => s.addItem)
  const items = useCartStore((s) => s.items)

  const filtered =
    activeCategory === 'SEMUA'
      ? products
      : products.filter((p) => p.category === activeCategory)

  const getQtyInCart = (productId: number) =>
    items.find((i) => i.productId === productId)?.quantity ?? 0

  return (
    <section id="catalog" className="py-section-gap bg-surface-container-low border-y-2 border-pure-black">
      <div className="max-w-7xl mx-auto px-gutter">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <span className="font-label font-bold text-xs text-primary uppercase tracking-widest bg-primary-container px-3 py-1 border-2 border-pure-black inline-block mb-4">
              PILIH MINUMANMU
            </span>
            <h2 className="font-headline text-4xl md:text-5xl font-black uppercase leading-tight">
              MENU KAMI
            </h2>
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto scroll-hide pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-2 border-2 border-pure-black font-label font-bold text-xs rounded-full transition-all ${
                  activeCategory === cat
                    ? 'bg-primary text-on-primary neubrutal-shadow-sm'
                    : 'bg-white text-on-surface hover:bg-secondary-container'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              qtyInCart={getQtyInCart(product.id)}
              onAdd={(sugarLevel) =>
                addItem({
                  productId: product.id,
                  name: product.name,
                  price: Number(product.price),
                  sugarLevel,
                  imageUrl: product.imageUrl,
                })
              }
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-on-surface-variant">
            <div className="text-6xl mb-4">🥤</div>
            <p className="font-label font-bold text-sm uppercase">Belum ada produk di kategori ini</p>
          </div>
        )}
      </div>
    </section>
  )
}

function ProductCard({
  product,
  qtyInCart,
  onAdd,
}: {
  product: Product
  qtyInCart: number
  onAdd: (sugar: SugarLevel) => void
}) {
  const [selectedSugar, setSelectedSugar] = useState<SugarLevel>('NORMAL')
  const isLowStock = product.currentStock <= product.lowStockAlert && product.currentStock > 0
  const isOutOfStock = product.currentStock === 0

  return (
    <div className="group bg-white border-2 border-pure-black neubrutal-shadow flex flex-col overflow-hidden transition-all hover:-translate-y-1">
      {/* Image */}
      <div className="aspect-square relative overflow-hidden bg-sky-accent">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-7xl">🥤</span>
          </div>
        )}

        {/* Badges */}
        {isLowStock && !isOutOfStock && (
          <div className="absolute top-3 left-3 bg-error text-on-error border-2 border-pure-black px-3 py-1 font-label font-bold text-xs -rotate-3">
            HAMPIR HABIS
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-headline font-black text-2xl">HABIS</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 border-t-2 border-pure-black flex flex-col gap-4 flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-headline font-bold text-xl uppercase">{product.name}</h3>
            {product.description && (
              <p className="font-body text-sm text-on-surface-variant mt-1 line-clamp-2">
                {product.description}
              </p>
            )}
          </div>
          <span className="font-headline font-bold text-xl text-primary shrink-0 ml-2">
            {formatRupiah(Number(product.price))}
          </span>
        </div>

        {/* Sugar level selector */}
        <div>
          <p className="font-label font-bold text-xs uppercase mb-2">Level Gula</p>
          <div className="flex gap-1">
            {SUGAR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedSugar(opt.value)}
                className={`flex-1 py-2 border-2 border-pure-black font-label font-bold text-xs transition-all ${
                  selectedSugar === opt.value
                    ? 'bg-primary text-on-primary'
                    : 'bg-white text-on-surface hover:bg-surface-variant'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Add to cart */}
        <button
          onClick={() => onAdd(selectedSugar)}
          disabled={isOutOfStock}
          className={`w-full py-3 border-2 border-pure-black font-label font-bold text-sm uppercase transition-all neubrutal-btn ${
            isOutOfStock
              ? 'bg-outline-variant text-on-surface-variant cursor-not-allowed'
              : 'bg-juice-orange text-white neubrutal-shadow-sm hover:bg-primary'
          }`}
        >
          {isOutOfStock
            ? 'Stok Habis'
            : qtyInCart > 0
            ? `+ Tambah (${qtyInCart} di keranjang)`
            : '+ Tambah ke Keranjang'}
        </button>
      </div>
    </div>
  )
}
