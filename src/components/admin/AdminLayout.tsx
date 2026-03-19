import { ReactNode } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
    </AppLayout>
  )
}
