// src/app/api/consignment/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.consignmentStock.findMany({
      include: { product: true },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { storeName, storeContact, productId, qtyConsigned, pricePerUnit } = body

    if (!storeName || !productId || !qtyConsigned) {
      return NextResponse.json({ success: false, error: 'Field wajib tidak lengkap' }, { status: 400 })
    }

    // Kurangi stok produk
    const item = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } })
      if (!product) throw new Error('Produk tidak ditemukan')
      if (product.currentStock < qtyConsigned) throw new Error(`Stok ${product.name} tidak cukup`)

      await tx.product.update({
        where: { id: productId },
        data: { currentStock: { decrement: qtyConsigned } },
      })

      return tx.consignmentStock.create({
        data: {
          storeName,
          storeContact: storeContact || null,
          productId,
          qtyConsigned,
          pricePerUnit: pricePerUnit || product.price,
        },
        include: { product: true },
      })
    })

    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
