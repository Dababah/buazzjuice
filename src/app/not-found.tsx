// src/app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🥤</div>
        <h1 className="font-headline font-black text-6xl uppercase text-juice-orange mb-4">404</h1>
        <h2 className="font-headline font-bold text-2xl uppercase mb-4">Halaman Tidak Ditemukan</h2>
        <p className="font-body text-base text-on-surface-variant mb-8">
          Ups! Kayaknya jus yang kamu cari sudah habis. Kembali ke halaman utama yuk!
        </p>
        <Link
          href="/"
          className="inline-block neubrutal-btn neubrutal-shadow bg-primary text-on-primary border-2 border-pure-black px-8 py-4 font-headline font-bold text-lg uppercase"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
