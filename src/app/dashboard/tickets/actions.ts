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
    const updaterName = user?.email || 'Staff'

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
    await prisma.ticketHistory.create({
      data: {
        ticketId,
        status,
        department: assignedTo,
        remarks: remarks || `Status updated to ${status} and assigned to ${assignedTo}.`,
        createdBy: updaterName,
      },
    })

    revalidatePath('/dashboard/tickets')
    if (updated.customerId) {
      revalidatePath(`/dashboard/customers/${updated.customerId}`)
    }
    return { success: true }
  } catch (error: any) {
    console.error('Error updating ticket:', error)
    return { error: error.message || 'Failed to update ticket.' }
  }
}

