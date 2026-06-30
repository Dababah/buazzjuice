// src/components/consumer/JaminanMutuSection.tsx
export default function JaminanMutuSection() {
  return (
    <section id="jaminan" className="py-section-gap bg-surface">
      <div className="max-w-7xl mx-auto px-gutter">
        <h2 className="font-headline text-4xl md:text-5xl font-black uppercase text-center mb-16 underline decoration-juice-orange underline-offset-8">
          JAMINAN MUTU
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:h-[560px]">
          {/* Large */}
          <div className="md:col-span-8 bg-sky-accent border-2 border-pure-black neubrutal-shadow p-8 flex flex-col justify-between group overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="font-headline font-black text-4xl md:text-5xl uppercase leading-none mb-4">
                100% BUAH ASLI
              </h3>
              <p className="font-body text-lg font-medium max-w-md">
                Tidak ada konsentrat. Tidak ada pemanis buatan. Kami hanya
                memeras buah segar berkualitas grade A setiap pagi di dapur kami.
              </p>
            </div>
            <div className="mt-8 text-6xl">✅</div>
          </div>

          {/* Eco */}
          <div className="md:col-span-4 bg-primary-container border-2 border-pure-black neubrutal-shadow p-8 flex flex-col items-center text-center justify-center">
            <div className="text-8xl mb-6">♻️</div>
            <h3 className="font-headline font-bold text-2xl uppercase mb-2">ECO FRIENDLY</h3>
            <p className="font-body text-sm text-on-surface-variant">
              Kemasan ramah lingkungan. Kembalikan botol untuk diskon berikutnya!
            </p>
          </div>

          {/* Hygienic */}
          <div className="md:col-span-4 bg-tertiary-container border-2 border-pure-black neubrutal-shadow p-8 flex flex-col justify-center">
            <h3 className="font-headline font-bold text-2xl uppercase mb-2">PROSES HIGIENIS</h3>
            <p className="font-body text-sm text-on-surface-variant">
              Setiap botol diproses dengan standar kebersihan tinggi. Air matang
              konsumsi resmi & peralatan steril.
            </p>
            <div className="text-4xl mt-4">🧼</div>
          </div>

          {/* No sugar */}
          <div className="md:col-span-8 bg-secondary-container border-2 border-pure-black neubrutal-shadow p-8 flex items-center gap-8">
            <div className="flex-1">
              <h3 className="font-headline font-bold text-2xl uppercase mb-2">BEBAS PEMANIS BUATAN</h3>
              <p className="font-body text-sm text-on-surface-variant">
                Rasa manis kami murni berasal dari fruktosa alami buah &
                sedikit gula tebu cair asli. Sehat tanpa kompromi.
              </p>
            </div>
            <div className="text-6xl shrink-0">🚫</div>
          </div>
        </div>
      </div>
    </section>
  )
}
