// src/app/api/export/pdf/route.ts
// Generate laporan PDF harian menggunakan @react-pdf/renderer

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#191d11' },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#737a62' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', marginBottom: 10, borderBottomWidth: 2, borderBottomColor: '#000', paddingBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#e1e5d0' },
  label: { color: '#434934' },
  value: { fontFamily: 'Helvetica-Bold' },
  metricsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  metricBox: { flex: 1, padding: 12, backgroundColor: '#f2f6e1', borderWidth: 2, borderColor: '#000' },
  metricLabel: { fontSize: 8, color: '#737a62', marginBottom: 4, textTransform: 'uppercase' },
  metricValue: { fontSize: 16, fontFamily: 'Helvetica-Bold' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#737a62' },
})

function formatRp(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dateParam = searchParams.get('date') || new Date().toISOString().slice(0, 10)
    const location = searchParams.get('location') || 'ALL'

    const startOfDay = new Date(`${dateParam}T00:00:00.000Z`)
    const endOfDay = new Date(`${dateParam}T23:59:59.999Z`)

    const [orders, expenses] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
          ...(location !== 'ALL' ? { locationTag: location } : {}),
        },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.operationalExpense.findMany({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
          ...(location !== 'ALL' ? { locationTag: location } : {}),
        },
        orderBy: { createdAt: 'asc' },
      }),
    ])

    const totalRevenue = orders.reduce((s, o) => s + Number(o.totalPrice), 0)
    const totalExpense = expenses.reduce((s, e) => s + Number(e.amount), 0)
    const netProfit = totalRevenue - totalExpense

    // Build product summary
    const productSummary: Record<string, { qty: number; revenue: number }> = {}
    for (const order of orders) {
      for (const item of order.items) {
        const key = item.product.name
        if (!productSummary[key]) productSummary[key] = { qty: 0, revenue: 0 }
        productSummary[key].qty += item.quantity
        productSummary[key].revenue += Number(item.subtotal)
      }
    }

    const dateLabel = new Date(dateParam).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })

    const pdfBuffer = await renderToBuffer(
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>BUAZZZ JUICE</Text>
            <Text style={styles.subtitle}>Laporan Harian • {dateLabel}</Text>
            <Text style={styles.subtitle}>Lokasi: {location.replace(/_/g, ' ')}</Text>
          </View>

          {/* Metrics */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Omzet Kotor</Text>
              <Text style={styles.metricValue}>{formatRp(totalRevenue)}</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Pengeluaran</Text>
              <Text style={styles.metricValue}>{formatRp(totalExpense)}</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Laba Bersih</Text>
              <Text style={{ ...styles.metricValue, color: netProfit >= 0 ? '#4a6700' : '#ba1a1a' }}>
                {formatRp(netProfit)}
              </Text>
            </View>
          </View>

          {/* Product summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rekap Produk ({orders.length} Order)</Text>
            {Object.entries(productSummary).map(([name, data]) => (
              <View key={name} style={styles.row}>
                <Text style={styles.label}>{name}</Text>
                <Text>{data.qty} botol</Text>
                <Text style={styles.value}>{formatRp(data.revenue)}</Text>
              </View>
            ))}
            {Object.keys(productSummary).length === 0 && (
              <Text style={styles.label}>Tidak ada penjualan di hari ini.</Text>
            )}
          </View>

          {/* Orders list */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daftar Transaksi</Text>
            {orders.map((order) => (
              <View key={order.id} style={styles.row}>
                <Text style={{ ...styles.label, fontSize: 9 }}>{order.id}</Text>
                <Text style={{ fontSize: 9 }}>{order.customerName}</Text>
                <Text style={{ fontSize: 9 }}>{order.paymentMethod}</Text>
                <Text style={{ ...styles.value, fontSize: 9 }}>{formatRp(Number(order.totalPrice))}</Text>
              </View>
            ))}
          </View>

          {/* Expenses */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pengeluaran Operasional</Text>
            {expenses.map((exp) => (
              <View key={exp.id} style={styles.row}>
                <Text style={styles.label}>{exp.description}</Text>
                <Text>{exp.category}</Text>
                <Text style={styles.value}>{formatRp(Number(exp.amount))}</Text>
              </View>
            ))}
            {expenses.length === 0 && <Text style={styles.label}>Tidak ada pengeluaran tercatat.</Text>}
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            Digenerate otomatis oleh BUAZZZ JUICE Management System • Powered by Core Pawas
          </Text>
        </Page>
      </Document>
    )

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="BUAZZZ_REPORT_${location}_${dateParam}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF export error:', error)
    return NextResponse.json({ success: false, error: 'Gagal generate PDF' }, { status: 500 })
  }
}
