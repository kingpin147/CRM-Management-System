import { NextResponse } from 'next/server';
import { SMSTemplateService } from '@/lib/sms-service';

export async function GET() {
  try {
    // Return available SMS templates with sample data
    const templates = {
      REGISTRATION_COMPLETE: {
        name: 'Registration Complete',
        description: 'Sent when customer registration is completed',
        sample: SMSTemplateService.generateRegistrationMessage({
          customer: {} as any,
          customerCode: 'EG-001234',
          customerName: 'John Doe',
          contactNumber: '+923001234567',
          currentDate: SMSTemplateService.formatDate(new Date())
        })
      },
      INVOICE_GENERATED: {
        name: 'Invoice Generated',
        description: 'Sent when a new invoice is generated',
        sample: SMSTemplateService.generateInvoiceMessage({
          customer: {} as any,
          customerCode: 'EG-001234',
          customerName: 'John Doe',
          contactNumber: '+923001234567',
          amount: 15000,
          invoiceNumber: 'INV-2024-001',
          dueDate: '15-Nov-2024',
          currentDate: SMSTemplateService.formatDate(new Date())
        })
      },
      PAYMENT_DUE_REMINDER: {
        name: 'Payment Due Reminder',
        description: 'Sent one day before payment due date',
        sample: SMSTemplateService.generatePaymentDueMessage({
          customer: {} as any,
          customerCode: 'EG-001234',
          customerName: 'John Doe',
          contactNumber: '+923001234567',
          amount: 15000,
          invoiceNumber: 'INV-2024-001',
          dueDate: '15-Nov-2024'
        })
      },
      PAYMENT_RECEIVED: {
        name: 'Payment Received',
        description: 'Sent when payment is received and confirmed',
        sample: SMSTemplateService.generatePaymentReceivedMessage({
          customer: {} as any,
          customerCode: 'EG-001234',
          customerName: 'John Doe',
          contactNumber: '+923001234567',
          amount: 15000,
          receiptNumber: 'RCP-12345678',
          currentDate: SMSTemplateService.formatDate(new Date())
        })
      },
      COMPLAINT_REGISTERED: {
        name: 'Complaint Registered',
        description: 'Sent when a customer complaint is registered',
        sample: SMSTemplateService.generateComplaintRegisteredMessage({
          customer: {} as any,
          customerCode: 'EG-001234',
          customerName: 'John Doe',
          contactNumber: '+923001234567',
          complaintNumber: 'TKT-2024-001',
          currentDate: SMSTemplateService.formatDate(new Date())
        })
      },
      COMPLAINT_RESOLVED: {
        name: 'Complaint Resolved',
        description: 'Sent when a customer complaint is resolved',
        sample: SMSTemplateService.generateComplaintResolvedMessage({
          customer: {} as any,
          customerCode: 'EG-001234',
          customerName: 'John Doe',
          contactNumber: '+923001234567',
          complaintNumber: 'TKT-2024-001',
          closureDate: SMSTemplateService.formatDate(new Date())
        })
      },
      DAILY_SOLAR_REPORT: {
        name: 'Daily Solar Report',
        description: 'Daily solar system production report',
        sample: SMSTemplateService.generateDailySolarReportMessage({
          customer: {} as any,
          customerCode: 'EG-001234',
          customerName: 'John Doe',
          contactNumber: '+923001234567',
          todayUnits: 45,
          mtdUnits: 1350,
          ytdUnits: 16200
        })
      }
    };

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Templates error:', error);
    return NextResponse.json(
      { error: 'Failed to get templates' },
      { status: 500 }
    );
  }
}