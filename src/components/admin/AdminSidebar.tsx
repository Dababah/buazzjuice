'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/admin/pos', icon: '🧾', label: 'Kasir POS' },
  { href: '/admin/products', icon: '🥤', label: 'Produk' },
  { href: '/admin/stock', icon: '📦', label: 'Stok & Biaya' },
  { href: '/admin/consignment', icon: '🤝', label: 'Konsinyasi' },
  { href: '/admin/ai', icon: '🤖', label: 'AI Copilot' },
  { href: '/admin/reports', icon: '📄', label: 'Laporan PDF' },
]

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname()
  return (
    <aside className="h-full w-64 fixed left-0 top-0 bg-surface-container border-r-2 border-pure-black flex flex-col p-4 gap-2 z-40 hidden md:flex">
      <div className="mb-5 pb-4 border-b-2 border-pure-black flex items-center gap-3">
        <Image src="/images/logo.png" alt="BUAZZZ" width={38} height={38} className="object-contain" />
        <div>
          <h1 className="font-headline font-black text-xl uppercase text-juice-orange leading-none">BUAZZZ</h1>
          <p className="font-label font-bold text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">Admin Console</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded transition-all font-label font-bold text-sm ${
                isActive
                  ? 'bg-primary-container text-on-primary-container border-2 border-pure-black neubrutal-shadow-sm translate-x-0.5 translate-y-0.5'
                  : 'text-on-surface-variant hover:bg-surface-variant hover:translate-x-0.5'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
              {item.href === '/admin/ai' && (
                <span className="ml-auto text-[9px] bg-tertiary-container border border-pure-black px-1.5 py-0.5 font-bold uppercase">NEW</span>
              )}
            </Link>
          )
        })}
      </nav>
      <div className="pt-4 border-t-2 border-pure-black">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full border-2 border-pure-black bg-juice-orange flex items-center justify-center font-headline font-black text-white text-sm shrink-0">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-label font-bold text-sm truncate">{adminName}</p>
            <p className="font-label font-bold text-[10px] text-on-surface-variant">Super Admin</p>
          </div>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="w-full py-2 border-2 border-pure-black bg-white hover:bg-error-container font-label font-bold text-xs uppercase transition-colors">
            🚪 Logout
          </button>
        </form>
      </div>
    </aside>
  )
}
