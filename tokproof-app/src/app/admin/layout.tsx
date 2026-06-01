import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin'

export const metadata = { title: 'Admin — Tokproof', robots: 'noindex, nofollow' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser()
  if (!user) redirect('/dashboard')
  return <>{children}</>
}
