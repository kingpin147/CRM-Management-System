'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { PrismaClient, TicketType, TicketStatus } from '@prisma/client'

const prisma = new PrismaClient()

function generateTicketNumber() {
  return `TKT-${Math.floor(100000 + Math.random() * 900000)}`
}

export async function createTicket(formData: FormData) {
  const customerId = formData.get('customerId') as string
  const ticketType = formData.get('ticketType') as TicketType
  const source = formData.get('source') as string
  const assignedTo = formData.get('assignedTo') as string
  const escalation = formData.get('escalation') as string
  const actionPriority = formData.get('actionPriority') as string
  const category = formData.get('category') as string
  const description = formData.get('description') as string
  const attachmentUrl = formData.get('attachmentUrl') as string | null

  if (!customerId) return { error: 'Customer is required' }

  try {
    const ticketNumber = generateTicketNumber()

    await prisma.ticket.create({
      data: {
        ticketNumber,
        customerId,
        ticketType,
        source,
        assignedTo,
        escalation,
        status: TicketStatus.PENDING,
        actionPriority,
        category,
        description,
        attachmentUrl,
      }
    })

    revalidatePath('/dashboard/tickets')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Failed to log ticket.' }
  }
}
