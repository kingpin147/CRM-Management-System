import * as z from 'zod';

export const TicketType = {
  TECHNICAL_COMPLAINT: 'TECHNICAL_COMPLAINT',
  BILLING_COMPLAINT: 'BILLING_COMPLAINT',
  SERVICE_REQUEST: 'SERVICE_REQUEST',
} as const;

export const ticketSchema = z.object({
  customerId: z.string().min(1, 'Please select a customer'),
  ticketType: z.nativeEnum(TicketType),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().optional(),
  faultCode: z.string().optional(),
  escalation: z.string().min(1, 'Escalation is required'),
  assignedTo: z.string().min(1, 'Department is required'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
});
