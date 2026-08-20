import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { TicketsView } from './TicketsView'

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const params = await searchParams
  const statusParam = typeof params?.status === 'string' ? params.status : undefined

  // Fetch logged in user details to determine role & department auto-filtering
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userRole = 'SUPER_ADMIN'
  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: { role: true },
    })
    if (dbUser?.role) {
      userRole = dbUser.role
    }
  }

  // Fetch all tickets with full customer details and history
  const tickets = await prisma.ticket.findMany({
    include: {
      customer: true,
      histories: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <TicketsView
      tickets={tickets}
      userRole={userRole}
      initialStatusParam={statusParam}
    />
  )
}
