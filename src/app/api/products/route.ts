// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET — public, untuk landing page & admin POS
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const includeUnavailable = searchParams.get('all') === 'true'

    const products = await prisma.product.findMany({
      where: {
        ...(includeUnavailable ? {} : { isAvailable: true }),
        ...(category ? { category } : {}),
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json({ success: true, data: products })
  } catch (error) {
    console.error('Products GET error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST — admin only, tambah produk baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, price, imageUrl, currentStock, lowStockAlert, category } = body

    if (!name || !price) {
      return NextResponse.json({ success: false, error: 'name dan price wajib diisi' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price,
        imageUrl: imageUrl || null,
        currentStock: currentStock || 0,
        lowStockAlert: lowStockAlert || 10,
        category: category || 'PURE',
      },
    })

    return NextResponse.json({ success: true, data: product }, { status: 201 })
  } catch (error) {
    console.error('Products POST error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
