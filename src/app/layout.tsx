// src/app/layout.tsx
import type { Metadata } from 'next'
import { Anybody, Hanken_Grotesk } from 'next/font/google'
import './globals.css'

const anybody = Anybody({
  subsets: ['latin'],
  weight: ['400', '700', '800', '900'],
  variable: '--font-anybody',
  display: 'swap',
})

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hanken',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://buazzjuice.vercel.app'),
  title: {
    default: 'BUAZZZ JUICE | Kesegaran Tanpa Manipulasi',
    template: '%s | BUAZZZ JUICE',
  },
  description: 'Jus buah premium dari buah asli pilihan. Kental, dingin, diperas murni. Tersedia di Sunmor UGM Yogyakarta setiap Minggu pagi.',
  keywords: ['jus buah', 'buah segar', 'yogyakarta', 'sunmor ugm', 'minuman sehat', 'no sugar', 'buazzz'],
  authors: [{ name: 'Core Pawas' }],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'BUAZZZ JUICE — Kesegaran Tanpa Manipulasi',
    description: '100% buah murni. Tanpa air tambahan. Tanpa pengawet. Diperas segar setiap pagi.',
    type: 'website',
    locale: 'id_ID',
    images: [{ url: '/images/logo.png', width: 800, height: 800, alt: 'BUAZZZ JUICE Logo' }],
  },
  twitter: {
    card: 'summary',
    title: 'BUAZZZ JUICE',
    description: 'Jus buah murni premium dari Yogyakarta',
    images: ['/images/logo.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${anybody.variable} ${hankenGrotesk.variable} bg-surface text-on-surface antialiased`}>
        {children}
      </body>
    </html>
  )
}
