import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // RBAC Check for Admin Access
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { role: true }
  })

  if (!dbUser || !['SUPER_ADMIN', 'ADMIN'].includes(dbUser.role)) {
    // Redirect unauthorized users back to the main search page
    redirect('/dashboard/customers')
  }

  return (
    <div className="w-full">
      {children}
    </div>
  )
}
