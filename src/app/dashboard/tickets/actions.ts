'use server'

import { revalidatePath } from 'next/cache'
import { TicketStatus } from '@prisma/client'
import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'

export async function updateTicket(formData: FormData) {
  const ticketId = formData.get('ticketId') as string
  const status = formData.get('status') as TicketStatus
  const assignedTo = formData.get('assignedTo') as string
  const escalation = formData.get('escalation') as string
  const actionPriority = formData.get('actionPriority') as string
  const remarks = formData.get('remarks') as string

  if (!ticketId) {
    return { error: 'Ticket ID is required' }
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const updaterName = user?.email || 'Staff'

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status,
        assignedTo,
        escalation,
        actionPriority,
      },
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
    return { success: true }
  } catch (error: any) {
    console.error('Error updating ticket:', error)
    return { error: error.message || 'Failed to update ticket.' }
  }
}
