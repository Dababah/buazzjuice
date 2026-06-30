// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOrderId } from '@/lib/helpers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customerName, source, paymentMethod, locationTag, notes, paymentProofUrl, isConfirmed, items } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Items tidak boleh kosong' }, { status: 400 })
    }

    const orderId = await generateOrderId()

    // Atomic transaction: buat order + kurangi stok
    const order = await prisma.$transaction(async (tx) => {
      // Validasi & kalkulasi harga
      const itemsWithPrice = await Promise.all(
        items.map(async (item: { productId: number; quantity: number; sugarLevel: string }) => {
          const product = await tx.product.findUnique({ where: { id: item.productId } })
          if (!product) throw new Error(`Produk ID ${item.productId} tidak ditemukan`)
          if (product.currentStock < item.quantity) throw new Error(`Stok ${product.name} tidak cukup`)

          return {
            productId: item.productId,
            quantity: item.quantity,
            sugarLevel: item.sugarLevel,
            priceAtPurchase: product.price,
            subtotal: Number(product.price) * item.quantity,
          }
        })
      )

      const totalPrice = itemsWithPrice.reduce((s, i) => s + i.subtotal, 0)

      // Buat order
      const newOrder = await tx.order.create({
        data: {
          id: orderId,
          customerName: customerName || 'Pelanggan',
          totalPrice,
          source: source || 'LAPAK_OFFLINE',
          paymentMethod: paymentMethod || 'CASH',
          locationTag: locationTag || 'LAPAK_UTAMA',
          notes: notes || null,
          paymentProofUrl: paymentProofUrl || null,
          isConfirmed: isConfirmed ?? true,
          items: {
            create: itemsWithPrice,
          },
        },
        include: { items: { include: { product: true } } },
      })

      // Kurangi stok setiap produk
      await Promise.all(
        itemsWithPrice.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          })
        )
      )

      // Audit log
      await tx.auditLog.create({
        data: {
          action: 'CREATE_ORDER',
          tableName: 'orders',
          isAiAction: false,
          afterData: { orderId, totalPrice, source, itemCount: items.length },
          description: `Order ${orderId} dibuat — ${source}`,
        },
      })

      return newOrder
    })

    return NextResponse.json({ success: true, data: order }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Orders POST error:', error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')
    const location = searchParams.get('location')
    const limit = Number(searchParams.get('limit') || '50')

    const startOfDay = date ? new Date(`${date}T00:00:00.000Z`) : undefined
    const endOfDay = date ? new Date(`${date}T23:59:59.999Z`) : undefined

    const orders = await prisma.order.findMany({
      where: {
        ...(startOfDay && endOfDay ? { createdAt: { gte: startOfDay, lte: endOfDay } } : {}),
        ...(location && location !== 'ALL' ? { locationTag: location } : {}),
      },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ success: true, data: orders })
  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
