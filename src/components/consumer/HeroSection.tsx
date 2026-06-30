// src/components/consumer/HeroSection.tsx
import Image from 'next/image'

export default function HeroSection() {
  return (
    <header className="relative overflow-hidden pt-12 md:pt-24 pb-16 md:pb-32 bg-surface">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-3/5 text-center lg:text-left">
            <h1 className="font-headline text-[clamp(2.8rem,9vw,5rem)] font-black uppercase text-pure-black mb-6 leading-[0.9]">
              KESEGARAN{' '}
              <span className="text-juice-orange">BUAH MURNI</span>,{' '}
              TANPA{' '}
              <span className="bg-primary-container inline-block px-2 transform -rotate-2">MANIPULASI!</span>
            </h1>
            <p className="font-body text-lg font-medium text-on-surface-variant mb-8 max-w-xl mx-auto lg:mx-0">
              Jus botolan premium dari buah asli pilihan. Kental, dingin, diperas murni tanpa tambahan air, pewarna, dan pengawet. 🥤
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <a href="#catalog" className="neubrutal-btn neubrutal-shadow bg-juice-orange text-pure-white border-2 border-pure-black px-8 py-4 font-headline text-xl font-bold uppercase">
                LIHAT MENU
              </a>
              <a href="#locations" className="neubrutal-btn neubrutal-shadow bg-sky-accent text-pure-black border-2 border-pure-black px-8 py-4 font-headline text-xl font-bold uppercase">
                CEK LOKASI
              </a>
            </div>
          </div>

          <div className="w-full lg:w-2/5 relative flex justify-center">
            <div className="relative z-10 transform lg:rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="border-2 border-pure-black neubrutal-shadow bg-white p-4 w-72 h-72 flex items-center justify-center">
                <Image src="/images/logo.png" alt="BUAZZZ JUICE" width={260} height={260} className="object-contain" priority />
              </div>
            </div>
            <div className="absolute -top-8 -right-8 w-28 h-28 bg-tertiary-container rounded-full mix-blend-multiply opacity-70 animate-pulse border-2 border-pure-black" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-primary-container rounded-full mix-blend-multiply opacity-70 border-2 border-pure-black animate-bounce" style={{ animationDuration: '4s' }} />
          </div>
        </div>
      </div>
      <div className="absolute top-1/2 left-0 w-full whitespace-nowrap opacity-[0.03] pointer-events-none -translate-y-1/2 select-none overflow-hidden">
        <span className="font-headline text-[20vw] leading-none uppercase font-black">BUAZZZ BUAZZZ BUAZZZ</span>
      </div>
    </header>
  )
}
