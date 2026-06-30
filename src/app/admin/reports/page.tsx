'use client'
// src/app/admin/reports/page.tsx

import { useState } from 'react'

export default function ReportsPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [location, setLocation] = useState('LAPAK_UTAMA')
  const [loading, setLoading] = useState(false)

  const LOCATIONS = ['LAPAK_UTAMA', 'SUNMOR_UGM', 'LAPAK_B', 'EVENT', 'ALL']

  const handleDownload = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ date, location })
      const res = await fetch(`/api/export/pdf?${params}`)
      if (!res.ok) throw new Error('Failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `BUAZZZ_REPORT_${location}_${date}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Gagal generate PDF. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-8">
      <h2 className="font-headline font-black text-3xl uppercase mb-2">Laporan PDF</h2>
      <p className="font-body text-sm text-on-surface-variant mb-8">
        Generate laporan keuangan harian untuk dicatat atau dicetak.
      </p>

      <div className="max-w-md">
        <div className="bg-white border-2 border-pure-black neubrutal-shadow p-6 space-y-5">
          <div>
            <label className="font-label font-bold text-xs uppercase block mb-2">Tanggal Laporan</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border-2 border-pure-black px-4 py-3 font-body text-sm bg-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="font-label font-bold text-xs uppercase block mb-2">Lokasi</label>
            <div className="grid grid-cols-2 gap-2">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocation(loc)}
                  className={`py-2 border-2 border-pure-black font-label font-bold text-xs uppercase transition-all ${
                    location === loc
                      ? 'bg-primary text-on-primary neubrutal-shadow-sm'
                      : 'bg-white hover:bg-surface-variant'
                  }`}
                >
                  {loc.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t-2 border-pure-black pt-4">
            <p className="font-label font-bold text-xs text-on-surface-variant mb-3">
              📄 File: BUAZZZ_REPORT_{location}_{date}.pdf
            </p>
            <button
              onClick={handleDownload}
              disabled={loading}
              className="w-full py-4 bg-juice-orange text-white border-2 border-pure-black neubrutal-shadow font-headline font-bold text-lg uppercase disabled:opacity-50 neubrutal-btn"
            >
              {loading ? '⏳ Generating...' : '⬇️ Download PDF'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-sky-accent border-2 border-pure-black neubrutal-shadow-sm p-5 space-y-2">
          <h4 className="font-headline font-bold text-base uppercase">Isi Laporan:</h4>
          <ul className="space-y-1">
            {[
              '📊 Total omzet kotor',
              '💸 Total pengeluaran operasional',
              '💰 Laba bersih',
              '🥤 Rincian produk terjual & level gula',
              '🧾 Arus kas & catatan pengeluaran',
              '🤝 Rekap konsinyasi (jika ada)',
            ].map((item) => (
              <li key={item} className="font-label font-bold text-xs flex items-center gap-2">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
