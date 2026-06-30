// src/app/api/ai/control/route.ts
// AI Copilot — natural language → DB actions via OpenAI function calling
// Supports: konsinyasi recap, sales summary, stock check

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { formatRupiah } from '@/lib/helpers'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const FUNCTIONS = [
  {
    name: 'recapConsignmentStock',
    description: 'Merekap hasil konsinyasi dari warung mitra. Dipanggil ketika admin melaporkan hasil penjualan titip barang.',
    parameters: {
      type: 'object',
      properties: {
        storeName: { type: 'string', description: 'Nama warung atau toko mitra' },
        qtySold: { type: 'number', description: 'Jumlah botol yang terjual' },
        qtyReturned: { type: 'number', description: 'Jumlah botol yang dikembalikan' },
      },
      required: ['storeName', 'qtySold'],
    },
  },
  {
    name: 'getSalesSummary',
    description: 'Mendapatkan ringkasan penjualan untuk periode tertentu.',
    parameters: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['today', 'yesterday', 'this_week', 'this_month'] },
      },
      required: ['period'],
    },
  },
  {
    name: 'getLowStockAlert',
    description: 'Mendapatkan daftar produk yang stoknya kritis.',
    parameters: {
      type: 'object',
      properties: {
        threshold: { type: 'number', description: 'Batas stok kritis, default 10' },
      },
    },
  },
]

async function getSalesSummary(period: string) {
  const now = new Date()
  let start: Date, end: Date

  switch (period) {
    case 'yesterday':
      start = new Date(now); start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0)
      end = new Date(now); end.setDate(end.getDate() - 1); end.setHours(23, 59, 59, 999)
      break
    case 'this_week':
      start = new Date(now); start.setDate(start.getDate() - start.getDay()); start.setHours(0, 0, 0, 0)
      end = new Date(now)
      break
    case 'this_month':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now)
      break
    default:
      start = new Date(now); start.setHours(0, 0, 0, 0)
      end = new Date(now); end.setHours(23, 59, 59, 999)
  }

  const [orders, expenses] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { items: { include: { product: true } } },
    }),
    prisma.operationalExpense.findMany({ where: { createdAt: { gte: start, lte: end } } }),
  ])

  const revenue = orders.reduce((s, o) => s + Number(o.totalPrice), 0)
  const expense = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const profit = revenue - expense

  const productMap: Record<string, number> = {}
  for (const order of orders) {
    for (const item of order.items) {
      productMap[item.product.name] = (productMap[item.product.name] || 0) + item.quantity
    }
  }
  const topProducts = Object.entries(productMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, qty]) => `${name} (${qty} botol)`)

  const labels: Record<string, string> = { today: 'Hari ini', yesterday: 'Kemarin', this_week: 'Minggu ini', this_month: 'Bulan ini' }
  return `📊 Ringkasan ${labels[period] || period}\n\n💰 Omzet: ${formatRupiah(revenue)}\n🧾 Pengeluaran: ${formatRupiah(expense)}\n✅ Laba Bersih: ${formatRupiah(profit)}\n📦 Total Order: ${orders.length}\n\n🏆 Top Produk:\n${topProducts.length ? topProducts.map((p, i) => `${i + 1}. ${p}`).join('\n') : 'Belum ada penjualan'}`
}

async function getLowStock(threshold = 10) {
  const products = await prisma.product.findMany({
    where: { isAvailable: true, currentStock: { lte: threshold } },
    orderBy: { currentStock: 'asc' },
  })
  if (products.length === 0) return `✅ Semua produk stoknya aman (threshold: ${threshold} botol).`
  const list = products.map((p) => `• ${p.name}: ${p.currentStock === 0 ? '❌ HABIS' : `⚠️ sisa ${p.currentStock} botol`}`).join('\n')
  return `⚠️ ${products.length} Produk Butuh Restock:\n\n${list}\n\nSegera tambah stok sebelum berjualan!`
}

async function recapConsignment(storeName: string, qtySold: number, qtyReturned?: number) {
  const activeItems = await prisma.consignmentStock.findMany({
    where: { status: 'ACTIVE' },
    include: { product: true },
  })

  const match = activeItems.find(
    (item) =>
      item.storeName.toLowerCase().includes(storeName.toLowerCase()) ||
      storeName.toLowerCase().includes(item.storeName.toLowerCase())
  )

  if (!match) {
    const names = activeItems.map((i) => `"${i.storeName}"`).join(', ')
    return { success: false, message: `Tidak ditemukan konsinyasi aktif untuk "${storeName}".\nKonsinyasi aktif: ${names || 'Tidak ada'}` }
  }

  const finalReturned = qtyReturned ?? Math.max(0, match.qtyConsigned - match.qtySold - qtySold)

  await prisma.$transaction(async (tx) => {
    await tx.consignmentStock.update({
      where: { id: match.id },
      data: { qtySold, qtyReturned: finalReturned, status: 'SETTLED', settledAt: new Date() },
    })

    if (finalReturned > 0) {
      await tx.product.update({ where: { id: match.productId }, data: { currentStock: { increment: finalReturned } } })
    }

    const totalPrice = qtySold * Number(match.pricePerUnit)
    await tx.order.create({
      data: {
        id: `BZ-KSY-${match.id}-${Date.now()}`,
        customerName: match.storeName,
        totalPrice,
        source: 'KONSINYASI',
        paymentMethod: 'TRANSFER',
        locationTag: 'KONSINYASI',
        isConfirmed: true,
        notes: `AI Recap: ${qtySold} laku, ${finalReturned} kembali`,
        items: { create: [{ productId: match.productId, quantity: qtySold, sugarLevel: 'NORMAL', priceAtPurchase: match.pricePerUnit, subtotal: totalPrice }] },
      },
    })

    await tx.auditLog.create({
      data: {
        action: 'SETTLE_CONSIGNMENT',
        tableName: 'consignment_stocks',
        isAiAction: true,
        beforeData: { id: match.id, status: 'ACTIVE' },
        afterData: { id: match.id, status: 'SETTLED', qtySold, qtyReturned: finalReturned },
        description: `AI settle: ${match.storeName} — ${qtySold} laku, ${finalReturned} kembali`,
      },
    })
  })

  return {
    success: true,
    message: `✅ Konsinyasi ${match.storeName} berhasil direkap!\n\n📦 Produk: ${match.product.name}\n✅ Laku: ${qtySold} botol\n↩️ Kembali: ${finalReturned} botol\n💰 Pendapatan: ${formatRupiah(qtySold * Number(match.pricePerUnit))}\n\nData tersimpan & stok dikembalikan otomatis.`,
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    if (!prompt?.trim()) return NextResponse.json({ success: false, error: 'Prompt kosong' }, { status: 400 })

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ success: false, error: '⚙️ OPENAI_API_KEY belum dikonfigurasi. Tambahkan ke .env.local' }, { status: 503 })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12000)

    let completion
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Kamu adalah asisten admin untuk bisnis jus buah BUAZZZ JUICE di Yogyakarta, Indonesia. Bantu admin rekap konsinyasi, cek penjualan, dan pantau stok. Selalu gunakan function call yang tersedia. Jawab singkat dalam Bahasa Indonesia.',
          },
          { role: 'user', content: prompt },
        ],
        tools: FUNCTIONS.map((f) => ({ type: 'function' as const, function: f })),
        tool_choice: 'auto',
      })
    } finally {
      clearTimeout(timeout)
    }

    const message = completion.choices[0]?.message
    const toolCall = message?.tool_calls?.[0]

    if (!toolCall) {
      return NextResponse.json({ success: true, message: message?.content || 'Tidak dapat memproses permintaan.' })
    }

    const fnName = toolCall.function.name
    const args = JSON.parse(toolCall.function.arguments)

    let result: string

    switch (fnName) {
      case 'recapConsignmentStock': {
        const recapResult = await recapConsignment(args.storeName, args.qtySold, args.qtyReturned)
        return NextResponse.json(recapResult)
      }
      case 'getSalesSummary':
        result = await getSalesSummary(args.period || 'today')
        break
      case 'getLowStockAlert':
        result = await getLowStock(args.threshold || 10)
        break
      default:
        result = 'Fungsi tidak dikenali.'
    }

    return NextResponse.json({ success: true, message: result })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error'
    console.error('AI control error:', error)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}