'use server'

import { revalidatePath } from 'next/cache'
import { TicketStatus } from '@prisma/client'
import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

function parseTicketStatus(rawStatus?: string | null): TicketStatus {
  if (!rawStatus) return TicketStatus.PENDING
  const clean = rawStatus.trim().toUpperCase().replace(/[\s\-_]+/g, '_')
  if (clean === 'CLOSED' || clean === 'CLOSE') return TicketStatus.CLOSED
  if (clean === 'RESOLVED' || clean === 'RESOLVE') return TicketStatus.RESOLVED
  if (clean === 'ON_HOLD' || clean === 'ONHOLD' || clean === 'HOLD') return TicketStatus.ON_HOLD
  if (clean === 'CANCELED' || clean === 'CANCELLED' || clean === 'CANCEL') return TicketStatus.CANCELED
  return TicketStatus.PENDING
}

export async function updateTicket(formData: FormData) {
  const ticketId = formData.get('ticketId') as string
  const rawStatus = formData.get('status') as string
  const status = parseTicketStatus(rawStatus)
  const assignedTo = (formData.get('assignedTo') as string) || 'Operation & Maintenance'
  const escalation = (formData.get('escalation') as string) || undefined
  const actionPriority = (formData.get('actionPriority') as string) || 'High'
  const remarks = formData.get('remarks') as string

  if (!ticketId) {
    return { error: 'Ticket ID is required' }
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const dbUser = user ? await prisma.user.findUnique({ where: { supabaseId: user.id } }) : null
    const updaterName = dbUser?.fullName || dbUser?.email || user?.email?.split('@')[0] || 'Staff / Operations'

    // Fetch previous history or ticket creation time to calculate timeInDept
    const lastHistory = await prisma.ticketHistory.findFirst({
      where: { ticketId },
      orderBy: { createdAt: 'desc' },
    })

    const existingTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    })

    const prevDate = lastHistory?.createdAt || existingTicket?.createdAt || new Date()
    const diffMs = Math.max(0, Date.now() - new Date(prevDate).getTime())
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    let timeInDept = `${diffMins} min${diffMins === 1 ? '' : 's'}`
    if (diffDays > 0) {
      timeInDept = `${diffDays}d ${diffHours % 24}h`
    } else if (diffHours > 0) {
      timeInDept = `${diffHours}h ${diffMins % 60}m`
    }

    const dataToUpdate: any = {
      status,
      assignedTo,
      actionPriority,
    }
    if (escalation) {
      dataToUpdate.escalation = escalation
    }

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: dataToUpdate,
    })

    // Log history
    const newHistory = await prisma.ticketHistory.create({
      data: {
        ticketId,
        status,
        department: assignedTo,
        remarks: remarks || `Status updated to ${status} (Priority: ${actionPriority}).`,
        createdBy: updaterName,
        timeInDept,
      },
    })

    revalidatePath('/dashboard/tickets')
    if (updated.customerId) {
      revalidatePath(`/dashboard/customers/${updated.customerId}`)
    }
    return { success: true, history: JSON.parse(JSON.stringify(newHistory)) }
  } catch (error: any) {
    console.error('Error updating ticket:', error)
    return { error: error.message || 'Failed to update ticket.' }
  }
}

