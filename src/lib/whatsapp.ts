// src/lib/whatsapp.ts
// Builder untuk WhatsApp checkout message

import type { CartItem } from '@/types'

const ADMIN_WA_NUMBER = process.env.NEXT_PUBLIC_ADMIN_WA_NUMBER || '6281234567890'

const SUGAR_LABEL: Record<string, string> = {
  NO_SUGAR: 'Tanpa Gula',
  LESS_SUGAR: 'Kurang Manis',
  NORMAL: 'Gula Normal',
}

export function buildWAOrderMessage(
  cart: CartItem[],
  customerName: string,
  locationNote?: string,
  paymentMethod: string = 'CASH'
): string {
  const itemLines = cart
    .map((item) => {
      const subtotal = item.price * item.quantity
      return `• ${item.name} x${item.quantity} (${SUGAR_LABEL[item.sugarLevel]}) — Rp ${subtotal.toLocaleString('id-ID')}`
    })
    .join('\n')

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const paymentLabel = paymentMethod === 'QRIS' ? 'QRIS (Sudah Bayar / Scan)' : 'Bayar di Lapak (Cash)'

  const message = [
    `Halo BUAZZZ! Saya mau pesan 🥤`,
    ``,
    itemLines,
    ``,
    `*Total: Rp ${total.toLocaleString('id-ID')}*`,
    `*Metode Bayar: ${paymentLabel}*`,
    ``,
    `Nama: ${customerName}`,
    locationNote ? `Lokasi/Catatan: ${locationNote}` : '',
    ``,
    paymentMethod === 'QRIS'
      ? `Saya sudah scan QRIS & transfer ya kak. Berikut ordernya 🙏`
      : `Mohon konfirmasi ordernya ya kak 🙏`,
  ]
    .filter((line) => line !== undefined)
    .join('\n')

  return message
}

export function getWAOrderURL(message: string): string {
  return `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(message)}`
}

export function openWAOrder(
  cart: CartItem[],
  customerName: string,
  locationNote?: string,
  paymentMethod: string = 'CASH'
) {
  const message = buildWAOrderMessage(cart, customerName, locationNote, paymentMethod)
  const url = getWAOrderURL(message)
  window.open(url, '_blank', 'noopener,noreferrer')
}
