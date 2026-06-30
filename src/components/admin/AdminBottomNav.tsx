'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/admin/dashboard', icon: '📊', label: 'Home' },
  { href: '/admin/pos', icon: '🧾', label: 'Kasir' },
  { href: '/admin/products', icon: '🥤', label: 'Produk' },
  { href: '/admin/ai', icon: '🤖', label: 'AI' },
  { href: '/admin/reports', icon: '📄', label: 'Laporan' },
]

export default function AdminBottomNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-sky-accent border-t-2 border-pure-black flex justify-around items-center px-1 py-2 pb-safe">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link key={item.href} href={item.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded transition-all ${
              isActive ? 'bg-primary text-on-primary border-2 border-pure-black scale-105' : 'text-on-surface hover:bg-white/30'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-label font-bold text-[9px] uppercase">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
