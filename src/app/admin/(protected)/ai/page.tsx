'use client'
// src/app/admin/ai/page.tsx
// AI Business Copilot — natural language command center

import { useState, useRef, useEffect } from 'react'
import { formatRupiah } from '@/lib/helpers'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  type?: 'success' | 'error' | 'info'
}

const QUICK_COMMANDS = [
  { label: '📦 Rekap Konsinyasi', example: 'Warung Berkah laku 7 sisa 3' },
  { label: '📊 Ringkasan Hari Ini', example: 'Berikan ringkasan penjualan hari ini' },
  { label: '⚠️ Cek Stok Kritis', example: 'Produk mana yang stoknya hampir habis?' },
  { label: '💰 Perkiraan Laba', example: 'Berapa estimasi laba minggu ini?' },
]

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: '🤖 Halo! Saya AI Copilot BUAZZZ JUICE. Saya bisa bantu rekap konsinyasi, analisis penjualan, dan menjawab pertanyaan tentang bisnis kamu. Ketik perintah atau pilih template di bawah!',
      timestamp: new Date(),
      type: 'info',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      })
      const data = await res.json()

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.success
          ? data.message || 'Selesai!'
          : `❌ ${data.error || 'Gagal memproses perintah'}`,
        timestamp: new Date(),
        type: data.success ? 'success' : 'error',
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '❌ Gagal terhubung ke server AI. Cek koneksi internet.',
          timestamp: new Date(),
          type: 'error',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh-0px)] p-4 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-tertiary-container border-2 border-pure-black flex items-center justify-center text-2xl neubrutal-shadow-sm">
            🤖
          </div>
          <div>
            <h2 className="font-headline font-black text-2xl md:text-3xl uppercase">AI Copilot</h2>
            <p className="font-label font-bold text-xs text-on-surface-variant uppercase tracking-widest">
              Business Intelligence Assistant
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-label font-bold text-xs text-primary">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Quick command chips */}
      <div className="mb-4">
        <p className="font-label font-bold text-xs uppercase text-on-surface-variant mb-2">
          Template Cepat:
        </p>
        <div className="flex gap-2 overflow-x-auto scroll-hide pb-1">
          {QUICK_COMMANDS.map((cmd) => (
            <button
              key={cmd.label}
              onClick={() => sendMessage(cmd.example)}
              disabled={loading}
              className="shrink-0 px-3 py-2 bg-white border-2 border-pure-black font-label font-bold text-xs hover:bg-primary-container transition-colors disabled:opacity-50 neubrutal-shadow-sm"
            >
              {cmd.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] border-2 border-pure-black p-4 ${
                msg.role === 'user'
                  ? 'bg-primary text-on-primary'
                  : msg.type === 'success'
                  ? 'bg-primary-container'
                  : msg.type === 'error'
                  ? 'bg-error-container'
                  : 'bg-sky-accent'
              } neubrutal-shadow-sm`}
            >
              <p className="font-body text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className={`font-label font-bold text-[10px] mt-2 opacity-60 ${msg.role === 'user' ? 'text-right' : ''}`}>
                {msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-sky-accent border-2 border-pure-black p-4 neubrutal-shadow-sm">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="font-label font-bold text-xs ml-2 text-on-surface-variant">AI sedang memproses...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="bg-white border-2 border-pure-black neubrutal-shadow flex gap-2 p-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Ketik perintah... contoh: "Warung Berkah laku 7 sisa 3"'
          rows={2}
          disabled={loading}
          className="flex-1 resize-none font-body text-sm focus:outline-none bg-transparent p-2 disabled:opacity-50"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="self-end bg-primary text-on-primary border-2 border-pure-black px-5 py-3 font-label font-bold text-sm uppercase disabled:opacity-40 hover:bg-juice-orange transition-colors neubrutal-btn"
        >
          Kirim
        </button>
      </div>
      <p className="font-label font-bold text-[10px] text-on-surface-variant mt-2 text-center">
        Enter untuk kirim • Shift+Enter untuk baris baru
      </p>
    </div>
  )
}
