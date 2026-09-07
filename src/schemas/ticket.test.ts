import { describe, it, expect } from 'vitest';
import { ticketSchema, TicketType } from './ticket';

describe('Ticket Schema', () => {
  it('validates a correct ticket payload', () => {
    const validTicket = {
      customerId: '123',
      ticketType: TicketType.TECHNICAL_COMPLAINT,
      category: 'Inverter',
      escalation: 'High',
      assignedTo: 'O&M',
      description: 'The inverter is not turning on despite being connected properly.',
    };
    
    const result = ticketSchema.safeParse(validTicket);
    expect(result.success).toBe(true);
  });

  it('fails validation on invalid description length', () => {
    const invalidTicket = {
      customerId: '123',
      ticketType: TicketType.TECHNICAL_COMPLAINT,
      category: 'Inverter',
      escalation: 'High',
      assignedTo: 'O&M',
      description: 'Short', // Less than 10 characters
    };
    
    const result = ticketSchema.safeParse(invalidTicket);
    expect(result.success).toBe(false);
  });
});
