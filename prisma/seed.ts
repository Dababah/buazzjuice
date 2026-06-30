// prisma/seed.ts
// Seed data awal untuk development

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user — PIN: 123456 (ganti sebelum production!)
  const pinHash = await bcrypt.hash('123456', 12)
  await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Admin BUAZZZ',
      pinHash,
    },
  })
  console.log('✅ Admin user created (PIN: 123456)')

  // Seed produk
  const products = [
    {
      name: 'Mango Pure',
      description: '100% Mangga Gadung murni tanpa tambahan air. Kental dan manis alami.',
      price: 14000,
      currentStock: 30,
      lowStockAlert: 5,
      category: 'PURE',
      imageUrl: null,
    },
    {
      name: 'Watermelon Splash',
      description: 'Semangka merah segar diperas langsung. Dingin, manis, menyegarkan.',
      price: 10000,
      currentStock: 40,
      lowStockAlert: 10,
      category: 'PURE',
      imageUrl: null,
    },
    {
      name: 'Avocado Smoothies',
      description: 'Alpukat creamy blend dengan sedikit coklat. Kenyang dan menyehatkan.',
      price: 14000,
      currentStock: 20,
      lowStockAlert: 5,
      category: 'SMOOTHIES',
      imageUrl: null,
    },
    {
      name: 'Dragon Blood',
      description: 'Buah naga merah dengan perasan jeruk nipis. Bold, segar, anti-oksidan tinggi.',
      price: 12000,
      currentStock: 15,
      lowStockAlert: 5,
      category: 'PURE',
      imageUrl: null,
    },
    {
      name: 'Melon Fresh',
      description: 'Melon manis pilihan blended halus. Ringan dan menyegarkan.',
      price: 10000,
      currentStock: 25,
      lowStockAlert: 5,
      category: 'PURE',
      imageUrl: null,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: products.indexOf(product) + 1 },
      update: {},
      create: product,
    })
  }
  console.log('✅ Products seeded:', products.length, 'items')

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
