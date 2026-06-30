// src/app/page.tsx
// Landing page consumer — branding + katalog + WA checkout

import { prisma } from '@/lib/prisma'
import ConsumerNavbar from '@/components/consumer/ConsumerNavbar'
import HeroSection from '@/components/consumer/HeroSection'
import CatalogSection from '@/components/consumer/CatalogSection'
import JaminanMutuSection from '@/components/consumer/JaminanMutuSection'
import LocationSection from '@/components/consumer/LocationSection'
import ConsumerFooter from '@/components/consumer/ConsumerFooter'
import CartBar from '@/components/consumer/CartBar'

async function getProducts() {
  return prisma.product.findMany({
    where: { isAvailable: true },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })
}

export default async function HomePage() {
  const products = await getProducts()

  return (
    <>
      <ConsumerNavbar />
      <main>
        <HeroSection />
        <CatalogSection products={products} />
        <JaminanMutuSection />
        <LocationSection />
      </main>
      <ConsumerFooter />
      <CartBar />
    </>
  )
}
