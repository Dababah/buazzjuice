// src/app/admin/dashboard/page.tsx
import { prisma } from '@/lib/prisma'
import { formatRupiah } from '@/lib/helpers'
import Link from 'next/link'

async function getDashboardData() {
  const today = new Date()
  const startOfDay = new Date(today.setHours(0, 0, 0, 0))
  const endOfDay = new Date(today.setHours(23, 59, 59, 999))

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0))
  const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999))

  const [todayOrders, yesterdayOrders, todayExpenses, recentOrders, lowStockProducts, products] =
    await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: startOfDay, lte: endOfDay } },
        include: { items: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: startOfYesterday, lte: endOfYesterday } },
      }),
      prisma.operationalExpense.findMany({
        where: { createdAt: { gte: startOfDay, lte: endOfDay } },
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: true } } },
      }),
      prisma.product.findMany({
        where: { currentStock: { lte: prisma.product.fields.lowStockAlert } },
        take: 5,
      }),
      prisma.product.findMany({ where: { isAvailable: true } }),
    ])

  const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.totalPrice), 0)
  const yesterdayRevenue = yesterdayOrders.reduce((s, o) => s + Number(o.totalPrice), 0)
  const todayExpense = todayExpenses.reduce((s, e) => s + Number(e.amount), 0)
  const todayProfit = todayRevenue - todayExpense

  const revenueChangePercent =
    yesterdayRevenue > 0
      ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
      : 0

  return {
    todayRevenue,
    todayProfit,
    todayExpense,
    todayOrders: todayOrders.length,
    revenueChangePercent,
    recentOrders,
    lowStockProducts,
    products,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="font-headline font-black text-3xl md:text-4xl uppercase">
            Ringkasan Performa
          </h2>
          <p className="font-body text-sm text-on-surface-variant mt-1">
            Data real-time hari ini —{' '}
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <Link
          href="/admin/pos"
          className="hidden md:flex items-center gap-2 bg-primary text-on-primary border-2 border-pure-black neubrutal-shadow-sm px-5 py-3 font-label font-bold text-sm uppercase hover:bg-juice-orange transition-colors"
        >
          🧾 Buka Kasir
        </Link>
      </div>

      {/* Low stock alert */}
      {data.lowStockProducts.length > 0 && (
        <div className="mb-6 bg-error-container border-2 border-error p-4 flex items-start gap-4 neubrutal-shadow-sm">
          <span className="text-2xl shrink-0">⚠️</span>
          <div className="flex-1">
            <p className="font-label font-bold text-sm">Stok Hampir Habis!</p>
            <p className="font-body text-sm text-on-error-container">
              {data.lowStockProducts.map((p) => `${p.name} (sisa ${p.currentStock})`).join(', ')}
            </p>
          </div>
          <Link
            href="/admin/pos"
            className="shrink-0 font-label font-bold text-sm underline hover:no-underline"
          >
            Update Stok
          </Link>
        </div>
      )}

      {/* Metrics bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Omzet Hari Ini"
          value={formatRupiah(data.todayRevenue)}
          sub={`${data.revenueChangePercent >= 0 ? '+' : ''}${data.revenueChangePercent}% vs kemarin`}
          subColor={data.revenueChangePercent >= 0 ? 'text-primary' : 'text-error'}
          bg="bg-sky-accent"
          icon="💰"
        />
        <MetricCard
          label="Laba Bersih"
          value={formatRupiah(data.todayProfit)}
          sub="Omzet - Pengeluaran"
          subColor="text-primary"
          bg="bg-primary-container"
          icon="📈"
        />
        <MetricCard
          label="Pengeluaran"
          value={formatRupiah(data.todayExpense)}
          sub="Total operasional hari ini"
          subColor="text-on-surface-variant"
          bg="bg-tertiary-fixed"
          icon="🧾"
        />
        <MetricCard
          label="Total Order"
          value={`${data.todayOrders} order`}
          sub="Semua channel hari ini"
          subColor="text-on-surface-variant"
          bg="bg-secondary-container"
          icon="🥤"
        />
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white border-2 border-pure-black neubrutal-shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-headline font-bold text-xl uppercase">Transaksi Terbaru</h4>
            <Link href="/admin/reports" className="font-label font-bold text-xs text-primary underline">
              Lihat semua
            </Link>
          </div>
          <div className="space-y-3">
            {data.recentOrders.length === 0 ? (
              <div className="text-center py-10 text-on-surface-variant">
                <div className="text-4xl mb-3">🥤</div>
                <p className="font-label font-bold text-sm">Belum ada transaksi hari ini</p>
                <Link href="/admin/pos" className="text-primary underline text-sm font-label font-bold mt-2 block">
                  Mulai catat penjualan →
                </Link>
              </div>
            ) : (
              data.recentOrders.map((order) => (
                <div key={order.id} className="border-2 border-pure-black p-3 flex justify-between items-center bg-surface-container-low hover:bg-primary-container transition-colors">
                  <div>
                    <p className="font-label font-bold text-sm">{order.id}</p>
                    <p className="font-body text-xs text-on-surface-variant">
                      {order.customerName} • {order.locationTag} •{' '}
                      {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-headline font-bold text-base">{formatRupiah(Number(order.totalPrice))}</p>
                    <span className={`font-label font-bold text-xs px-2 py-0.5 border border-pure-black ${
                      order.paymentMethod === 'CASH'
                        ? 'bg-primary-container'
                        : order.paymentMethod === 'QRIS'
                        ? 'bg-sky-accent'
                        : 'bg-tertiary-container'
                    }`}>
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stok overview */}
        <div className="bg-surface-container-high border-2 border-pure-black neubrutal-shadow p-6">
          <h4 className="font-headline font-bold text-xl uppercase mb-6">Status Stok</h4>
          <div className="space-y-3">
            {data.products.map((p) => (
              <div key={p.id} className="flex justify-between items-center border-b border-pure-black/10 pb-3">
                <span className="font-label font-bold text-sm truncate mr-2">{p.name}</span>
                <span className={`font-label font-bold text-xs px-2 py-1 border border-pure-black shrink-0 ${
                  p.currentStock === 0
                    ? 'bg-error text-on-error'
                    : p.currentStock <= p.lowStockAlert
                    ? 'bg-error-container text-on-error-container'
                    : 'bg-primary-container text-on-primary-container'
                }`}>
                  {p.currentStock} botol
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/admin/pos"
            className="block w-full mt-6 py-3 bg-primary text-on-primary border-2 border-pure-black text-center font-label font-bold text-sm uppercase hover:bg-juice-orange transition-colors"
          >
            Update Stok
          </Link>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  label, value, sub, subColor, bg, icon,
}: {
  label: string; value: string; sub: string; subColor: string; bg: string; icon: string
}) {
  return (
    <div className={`${bg} border-2 border-pure-black neubrutal-shadow-sm p-5 hover:-translate-y-0.5 transition-transform`}>
      <div className="flex justify-between items-start mb-3">
        <p className="font-label font-bold text-xs uppercase tracking-wide">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="font-headline font-bold text-2xl mb-1">{value}</h3>
      <p className={`font-label font-bold text-xs ${subColor}`}>{sub}</p>
    </div>
  )
}
