// src/app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const today = new Date()
    const startOfDay = new Date(today); startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(today); endOfDay.setHours(23, 59, 59, 999)
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    const startOfYesterday = new Date(yesterday); startOfYesterday.setHours(0, 0, 0, 0)
    const endOfYesterday = new Date(yesterday); endOfYesterday.setHours(23, 59, 59, 999)

    const [todayOrders, yesterdayOrders, todayExpenses, recentOrders, allProducts] = await Promise.all([
      prisma.order.findMany({ where: { createdAt: { gte: startOfDay, lte: endOfDay } }, include: { items: { include: { product: true } } } }),
      prisma.order.findMany({ where: { createdAt: { gte: startOfYesterday, lte: endOfYesterday } } }),
      prisma.operationalExpense.findMany({ where: { createdAt: { gte: startOfDay, lte: endOfDay } } }),
      prisma.order.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { items: { include: { product: true } } } }),
      prisma.product.findMany({ where: { isAvailable: true }, orderBy: { currentStock: 'asc' } }),
    ])

    const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.totalPrice), 0)
    const yesterdayRevenue = yesterdayOrders.reduce((s, o) => s + Number(o.totalPrice), 0)
    const todayExpense = todayExpenses.reduce((s, e) => s + Number(e.amount), 0)
    const todayProfit = todayRevenue - todayExpense
    const revenueChange = yesterdayRevenue > 0 ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100) : 0

    const productMap: Record<string, { qty: number; revenue: number }> = {}
    for (const order of todayOrders) {
      for (const item of order.items) {
        if (!productMap[item.product.name]) productMap[item.product.name] = { qty: 0, revenue: 0 }
        productMap[item.product.name].qty += item.quantity
        productMap[item.product.name].revenue += Number(item.subtotal)
      }
    }
    const topProducts = Object.entries(productMap).sort((a, b) => b[1].qty - a[1].qty).slice(0, 5).map(([name, d]) => ({ name, ...d }))
    const lowStockProducts = allProducts.filter((p) => p.currentStock <= p.lowStockAlert)

    return NextResponse.json({
      success: true,
      data: {
        todayRevenue, todayProfit, todayExpense,
        todayOrders: todayOrders.length,
        revenueChangePercent: revenueChange,
        recentOrders, lowStockProducts, topProducts, allProducts,
      },
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
