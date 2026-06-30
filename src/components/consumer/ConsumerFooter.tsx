// src/components/consumer/ConsumerFooter.tsx
export default function ConsumerFooter() {
  const waNumber = process.env.NEXT_PUBLIC_ADMIN_WA_NUMBER || '6281234567890'

  return (
    <footer className="bg-surface-container-highest border-t-2 border-pure-black py-section-gap">
      <div className="max-w-7xl mx-auto px-gutter grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <span className="font-headline font-black text-4xl uppercase text-juice-orange mb-6 block">
            BUAZZZ
          </span>
          <p className="font-body text-lg font-medium max-w-md mb-8">
            Mengubah persepsi tentang jus buah. Dari yang membosankan menjadi
            sebuah pengalaman rasa yang meledak-ledak. 🥤
          </p>
          <div className="flex gap-4">
            <a
              href="https://instagram.com/buazzz.juice"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 border-2 border-pure-black flex items-center justify-center bg-white neubrutal-shadow-sm hover:-translate-y-1 transition-all"
              aria-label="Instagram"
            >
              📸
            </a>
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 border-2 border-pure-black flex items-center justify-center bg-white neubrutal-shadow-sm hover:-translate-y-1 transition-all"
              aria-label="WhatsApp"
            >
              💬
            </a>
            <a
              href="https://tiktok.com/@buazzz.juice"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 border-2 border-pure-black flex items-center justify-center bg-white neubrutal-shadow-sm hover:-translate-y-1 transition-all"
              aria-label="TikTok"
            >
              🎵
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-label font-bold text-xs uppercase mb-6 text-primary">NAVIGASI</h4>
          <nav className="flex flex-col gap-4">
            {[
              ['#catalog', 'Menu'],
              ['#locations', 'Lokasi Lapak'],
              ['#jaminan', 'Jaminan Mutu'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="font-body text-sm text-on-surface-variant hover:text-juice-orange transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        <div>
          <h4 className="font-label font-bold text-xs uppercase mb-6 text-primary">KONTAK</h4>
          <nav className="flex flex-col gap-4">
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm text-on-surface-variant hover:text-juice-orange transition-colors"
            >
              WhatsApp Admin
            </a>
            <span className="font-body text-sm text-on-surface-variant">Yogyakarta, Indonesia</span>
            <span className="font-body text-sm text-on-surface-variant">
              Sunmor UGM — Setiap Minggu
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-gutter mt-16 pt-8 border-t-2 border-pure-black flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="font-label font-bold text-xs text-on-surface-variant">
          © 2026 BUAZZZ JUICE. RASAKAN SENSASINYA.
        </p>
        <div className="flex gap-8">
          <span className="font-label font-bold text-xs uppercase opacity-50">JOGJA • INDONESIA</span>
          <span className="font-label font-bold text-xs uppercase opacity-50">
            Powered by{' '}
            <a href="https://corepawas.com" className="hover:text-juice-orange transition-colors">
              Core Pawas
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
