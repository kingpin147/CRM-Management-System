import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/notification-service';
import { z } from 'zod';

const sendSMSSchema = z.object({
  type: z.enum([
    'REGISTRATION',
    'INVOICE',
    'DUE_REMINDER',
    'PAYMENT_RECEIVED',
    'COMPLAINT_REGISTERED',
    'COMPLAINT_RESOLVED',
    'SOLAR_REPORT',
    'CUSTOM'
  ]),
  customerId: z.string().optional(),
  invoiceId: z.string().optional(),
  ticketId: z.string().optional(),
  transactionId: z.string().optional(),
  message: z.string().optional(),
  solarData: z.object({
    todayUnits: z.number(),
    mtdUnits: z.number(),
    ytdUnits: z.number()
  }).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = sendSMSSchema.parse(body);

    let success = false;

    switch (data.type) {
      case 'REGISTRATION':
        if (!data.customerId) {
          return NextResponse.json({ error: 'Customer ID required for registration SMS' }, { status: 400 });
        }
        success = await notificationService.sendRegistrationNotification(data.customerId);
        break;

      case 'INVOICE':
        if (!data.invoiceId) {
          return NextResponse.json({ error: 'Invoice ID required for invoice SMS' }, { status: 400 });
        }
        success = await notificationService.sendInvoiceNotification(data.invoiceId);
        break;

      case 'DUE_REMINDER':
        if (!data.invoiceId) {
          return NextResponse.json({ error: 'Invoice ID required for due reminder SMS' }, { status: 400 });
        }
        success = await notificationService.sendPaymentDueReminder(data.invoiceId);
        break;

      case 'PAYMENT_RECEIVED':
        if (!data.transactionId) {
          return NextResponse.json({ error: 'Transaction ID required for payment received SMS' }, { status: 400 });
        }
        success = await notificationService.sendPaymentReceivedNotification(data.transactionId);
        break;

      case 'COMPLAINT_REGISTERED':
        if (!data.ticketId) {
          return NextResponse.json({ error: 'Ticket ID required for complaint registered SMS' }, { status: 400 });
        }
        success = await notificationService.sendComplaintRegisteredNotification(data.ticketId);
        break;

      case 'COMPLAINT_RESOLVED':
        if (!data.ticketId) {
          return NextResponse.json({ error: 'Ticket ID required for complaint resolved SMS' }, { status: 400 });
        }
        success = await notificationService.sendComplaintResolvedNotification(data.ticketId);
        break;

      case 'SOLAR_REPORT':
        if (!data.customerId || !data.solarData) {
          return NextResponse.json({ error: 'Customer ID and solar data required for solar report SMS' }, { status: 400 });
        }
        success = await notificationService.sendDailySolarReport(data.customerId, data.solarData);
        break;

      case 'CUSTOM':
        if (!data.customerId || !data.message) {
          return NextResponse.json({ error: 'Customer ID and message required for custom SMS' }, { status: 400 });
        }
        success = await notificationService.sendCustomMessage(data.customerId, data.message);
        break;

      default:
        return NextResponse.json({ error: 'Invalid SMS type' }, { status: 400 });
    }

    return NextResponse.json({ 
      success,
      message: success ? 'SMS sent successfully' : 'Failed to send SMS'
    });

  } catch (error) {
    console.error('SMS send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}