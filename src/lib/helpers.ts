// src/lib/helpers.ts

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

export function formatRupiahShort(amount: number): string {
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}jt`
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}rb`
  return `Rp ${amount}`
}

export function formatDateID(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
}

export function formatTimeID(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date)
}

import { prisma } from './prisma'

export async function generateOrderId(): Promise<string> {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  const startOfDay = new Date(today); startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(today); endOfDay.setHours(23, 59, 59, 999)
  const count = await prisma.order.count({ where: { createdAt: { gte: startOfDay, lte: endOfDay } } })
  return `BZ-${dateStr}-${String(count + 1).padStart(4, '0')}`
}

export async function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ratio = Math.min(maxWidth / img.width, 1)
        canvas.width = Math.round(img.width * ratio)
        canvas.height = Math.round(img.height * ratio)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => { if (blob) resolve(blob); else reject(new Error('Compress failed')) }, 'image/webp', quality)
      }
      img.onerror = reject
    }
    reader.onerror = reject
  })
}

export const OFFLINE_QUEUE_KEY = 'buazzz_offline_orders'

export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true
  return navigator.onLine
}

export function queueOfflineOrder(payload: unknown) {
  const queue = getOfflineQueue()
  queue.push({ payload, queuedAt: new Date().toISOString() })
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
}

export function getOfflineQueue(): { payload: unknown; queuedAt: string }[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]') } catch { return [] }
}

export function clearOfflineQueue() {
  if (typeof window !== 'undefined') localStorage.removeItem(OFFLINE_QUEUE_KEY)
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
