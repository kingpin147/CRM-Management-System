/**
 * Integration helpers for connecting SMS notifications with existing API endpoints
 * Add these function calls to your existing API routes to trigger SMS notifications
 */

import { SMSHooks } from './sms-hooks';

/**
 * Call this function after creating a new customer signup
 * Add to your customer registration/signup API endpoint
 */
export async function triggerRegistrationSMS(customerId: string) {
  // Run in background to avoid blocking the API response
  setImmediate(() => {
    SMSHooks.onCustomerRegistered(customerId);
  });
}

/**
 * Call this function after creating a new invoice
 * Add to your invoice creation API endpoint
 */
export async function triggerInvoiceSMS(invoiceId: string) {
  // Run in background to avoid blocking the API response
  setImmediate(() => {
    SMSHooks.onInvoiceCreated(invoiceId);
  });
}

/**
 * Call this function after processing a payment
 * Add to your payment processing API endpoint
 */
export async function triggerPaymentReceivedSMS(transactionId: string) {
  // Run in background to avoid blocking the API response
  setImmediate(() => {
    SMSHooks.onPaymentReceived(transactionId);
  });
}

/**
 * Call this function after creating a new ticket/complaint
 * Add to your ticket creation API endpoint
 */
export async function triggerComplaintRegisteredSMS(ticketId: string) {
  // Run in background to avoid blocking the API response
  setImmediate(() => {
    SMSHooks.onComplaintRegistered(ticketId);
  });
}

/**
 * Call this function after resolving a ticket/complaint
 * Add to your ticket update API endpoint when status changes to RESOLVED
 */
export async function triggerComplaintResolvedSMS(ticketId: string) {
  // Run in background to avoid blocking the API response
  setImmediate(() => {
    SMSHooks.onComplaintResolved(ticketId);
  });
}

/**
 * Example integration snippets for your existing API routes:
 */

// Example 1: Customer Registration (add to your signup API)
/*
// In your customer signup API route:
const customer = await prisma.customer.create({
  data: customerData
});

// Trigger registration SMS
triggerRegistrationSMS(customer.id);

return NextResponse.json({ success: true, customer });
*/

// Example 2: Invoice Creation (add to your invoice API)
/*
// In your invoice creation API route:
const invoice = await prisma.invoice.create({
  data: invoiceData
});

// Trigger invoice SMS
triggerInvoiceSMS(invoice.id);

return NextResponse.json({ success: true, invoice });
*/

// Example 3: Payment Processing (add to your payment API)
/*
// In your payment processing API route:
const transaction = await prisma.transaction.create({
  data: transactionData
});

// Update invoice status to paid
await prisma.invoice.update({
  where: { id: invoiceId },
  data: { status: 'Paid' }
});

// Trigger payment received SMS
triggerPaymentReceivedSMS(transaction.id);

return NextResponse.json({ success: true, transaction });
*/

// Example 4: Ticket Creation (add to your ticket API)
/*
// In your ticket creation API route:
const ticket = await prisma.ticket.create({
  data: ticketData
});

// Trigger complaint registered SMS
triggerComplaintRegisteredSMS(ticket.id);

return NextResponse.json({ success: true, ticket });
*/

// Example 5: Ticket Resolution (add to your ticket update API)
/*
// In your ticket update API route:
const ticket = await prisma.ticket.update({
  where: { id: ticketId },
  data: { status: 'RESOLVED' }
});

// If status changed to resolved, trigger resolution SMS
if (ticket.status === 'RESOLVED') {
  triggerComplaintResolvedSMS(ticket.id);
}

return NextResponse.json({ success: true, ticket });
*/