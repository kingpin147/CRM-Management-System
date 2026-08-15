import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
    where: { id: user.id },
    select: { role: true }
  })

  if (!dbUser || dbUser.role !== 'SUPER_ADMIN') {
    // Redirect unauthorized users back to the main dashboard
    redirect('/dashboard')
  }

  return (
    <div className="w-full">
      {children}
    </div>
  )
}
