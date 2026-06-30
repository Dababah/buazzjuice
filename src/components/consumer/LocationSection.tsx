// src/components/consumer/LocationSection.tsx
export default function LocationSection() {
  return (
    <section id="locations" className="py-section-gap bg-primary border-t-2 border-pure-black overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-gutter relative z-10">
        <h2 className="font-headline text-4xl md:text-5xl font-black uppercase text-white mb-12 leading-tight">
          TEMUKAN LAPAK KAMI DI JOGJA
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sunmor */}
          <div className="bg-surface border-2 border-pure-black neubrutal-shadow p-8 hover:bg-sky-accent transition-colors group">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-headline font-bold text-2xl uppercase">SUNMOR UGM</h3>
                <p className="font-body text-sm text-on-surface-variant italic mt-1">
                  Setiap Minggu | 06.00 – Selesai
                </p>
              </div>
              <span className="text-3xl">📍</span>
            </div>
            <p className="font-body text-sm mb-6">
              Lapak ikonik kami di kawasan Sunday Morning UGM. Cari booth warna
              oranye yang paling ramai! Bayar tunai atau scan QRIS DANA langsung di tempat.
            </p>
            <a
              href="https://maps.google.com/?q=Sunday+Morning+UGM+Yogyakarta"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 bg-pure-black text-white font-label font-bold text-sm uppercase border-2 border-pure-black hover:bg-white hover:text-pure-black transition-all text-center"
            >
              📍 PETUNJUK ARAH
            </a>
          </div>

          {/* Mitra konsinyasi */}
          <div className="bg-surface border-2 border-pure-black neubrutal-shadow p-8 hover:bg-primary-container transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-headline font-bold text-2xl uppercase">MITRA KONSINYASI</h3>
                <p className="font-body text-sm text-on-surface-variant italic mt-1">
                  Berbagai titik di Yogyakarta
                </p>
              </div>
              <span className="text-3xl">🏪</span>
            </div>
            <div className="space-y-3 mb-6">
              {['Toko Berkah', 'Warung Madura Kampus', 'Kantin UMY', 'Co-working Space'].map(
                (store) => (
                  <div
                    key={store}
                    className="border-b border-pure-black/10 pb-3 flex justify-between items-center hover:pl-1 transition-all"
                  >
                    <span className="font-label font-bold text-sm">{store}</span>
                    <span>→</span>
                  </div>
                )
              )}
            </div>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WA_NUMBER || '6281234567890'}?text=Halo%20BUAZZZ!%20Saya%20mau%20tanya%20lokasi%20mitra%20terdekat%20dong%20%F0%9F%A5%A4`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 bg-pure-black text-white font-label font-bold text-sm uppercase border-2 border-pure-black hover:bg-white hover:text-pure-black transition-all text-center"
            >
              💬 TANYA LOKASI TERDEKAT
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
