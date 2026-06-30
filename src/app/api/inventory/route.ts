// src/app/api/inventory/route.ts
// Pengeluaran operasional & log stok

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET — ambil pengeluaran & log stok
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date')
    const location = searchParams.get('location')

    const startOfDay = date ? new Date(`${date}T00:00:00.000Z`) : undefined
    const endOfDay = date ? new Date(`${date}T23:59:59.999Z`) : undefined

    const [expenses, logs] = await Promise.all([
      prisma.operationalExpense.findMany({
        where: {
          ...(startOfDay && endOfDay ? { createdAt: { gte: startOfDay, lte: endOfDay } } : {}),
          ...(location && location !== 'ALL' ? { locationTag: location } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.inventoryLog.findMany({
        where: {
          ...(startOfDay && endOfDay ? { createdAt: { gte: startOfDay, lte: endOfDay } } : {}),
          ...(location && location !== 'ALL' ? { locationTag: location } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
    ])

    return NextResponse.json({ success: true, data: { expenses, logs } })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST — catat pengeluaran operasional
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { description, amount, receiptUrl, locationTag, category } = body

    if (!description || !amount) {
      return NextResponse.json({ success: false, error: 'description dan amount wajib diisi' }, { status: 400 })
    }

    const expense = await prisma.operationalExpense.create({
      data: {
        description,
        amount: Number(amount),
        receiptUrl: receiptUrl || null,
        locationTag: locationTag || 'LAPAK_UTAMA',
        category: category || 'OPERASIONAL',
      },
    })

    return NextResponse.json({ success: true, data: expense }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
