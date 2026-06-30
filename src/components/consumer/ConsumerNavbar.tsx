'use client'
// src/components/consumer/ConsumerNavbar.tsx

import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/store/cart'

export default function ConsumerNavbar() {
  const totalItems = useCartStore((s) => s.totalItems())

  return (
    <nav className="sticky top-0 z-[60] bg-surface border-b-2 border-pure-black">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image src="/images/logo.png" alt="BUAZZZ JUICE Logo" width={40} height={40} className="object-contain" />
          <span className="font-headline font-black text-2xl uppercase tracking-tighter text-on-surface hover:text-juice-orange transition-colors">
            BUAZZZ
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#catalog" className="font-label font-bold text-sm text-primary border-b-2 border-primary pb-1">CATALOG</a>
          <a href="#locations" className="font-label font-bold text-sm text-on-surface-variant hover:text-primary transition-colors">LOKASI</a>
          <a href="#jaminan" className="font-label font-bold text-sm text-on-surface-variant hover:text-primary transition-colors">JAMINAN MUTU</a>
        </div>

        <a href="#catalog" className="neubrutal-btn neubrutal-shadow-sm bg-primary text-on-primary border-2 border-pure-black px-5 py-2 font-label font-bold text-sm uppercase relative">
          Pesan Sekarang
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-juice-orange text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-pure-black font-bold">
              {totalItems}
            </span>
          )}
        </a>
      </div>
    </nav>
  )
}
