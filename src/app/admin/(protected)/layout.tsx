// src/app/admin/layout.tsx
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminBottomNav from '@/components/admin/AdminBottomNav'
import OfflineIndicator from '@/components/admin/OfflineIndicator'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar adminName={session.name} />
      <main className="md:ml-64 min-h-screen pb-20 md:pb-0">
        <OfflineIndicator />
        {children}
      </main>
      <AdminBottomNav />
    </div>
  )
}
