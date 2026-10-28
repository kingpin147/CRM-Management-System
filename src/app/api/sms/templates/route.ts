import { NextResponse } from 'next/server';
import { SMSTemplateService } from '@/lib/sms-service';

export async function GET() {
  try {
    const today = SMSTemplateService.formatDate(new Date());

    // Return all 13 official Meta WhatsApp templates with full scenario definitions
    const templates = {
      CUSTOMER_WELCOME_CRF: {
        name: '1. Customer Welcome & Registration (CRF)',
        metaTemplateName: 'customer_welcome_crf',
        category: 'UTILITY',
        headerType: 'DOCUMENT (CRF.pdf)',
        trigger: 'Automatic: Sent when customer will be activated in CRM',
        description: 'Account Onboarding: Confirms account registration and delivers the official CRF document.',
        sample: 'Dear Nouman Attique, welcome to Energy Gurus! Your solar O&M service account has been successfully registered. Your Customer ID is 101 (CRF #CRF-2026-00101). Please find your official Customer Registration Form attached. For assistance, contact our helpline at +923009433303 - Energy Gurus Team.'
      },
      MONTHLY_INVOICE_DISPATCH: {
        name: '2. Monthly Invoice Dispatch',
        metaTemplateName: 'monthly_invoice_dispatch',
        category: 'UTILITY',
        headerType: 'DOCUMENT (Invoice.pdf)',
        trigger: 'Automatic: On 1st of every month (Due date: 10th)',
        description: 'Billing: Transactional monthly invoice and payment due date.',
        sample: 'Dear Nouman Attique, your solar O&M invoice INV-2026-001 for October 2026 amounting to PKR 4,500 has been generated. The payment due date is 10-Oct-2026. Please review your invoice PDF attached below.'
      },
      PAYMENT_DUE_REMINDER: {
        name: '3. Payment Due Reminder',
        metaTemplateName: 'payment_due_reminder',
        category: 'UTILITY',
        headerType: 'TEXT',
        trigger: 'Automatic: As Due date is 10th of every month, reminder msg will be sent on 9th',
        description: 'Billing Alert: Reminder of an existing active bill.',
        sample: 'Dear Nouman Attique, this is a friendly reminder that your solar O&M bill for invoice INV-2026-001 amounting to PKR 4,500 is due on 10-Oct-2026. Kindly settle your bill to ensure uninterrupted service. For inquiries, contact +923009433303.'
      },
      PAYMENT_OVERDUE_NOTICE: {
        name: '4. Overdue Payment Notice',
        metaTemplateName: 'payment_overdue_notice',
        category: 'UTILITY',
        headerType: 'TEXT',
        trigger: 'Automatic: Sent on 12th of every month, and after that as required',
        description: 'Billing / Account Alert: Warning of past-due payment.',
        sample: 'Dear Nouman Attique, invoice INV-2026-001 for PKR 4,500 is past due (due was 10-Oct-2026). Please clear this outstanding balance immediately to avoid disconnection. Contact +923009433303 for payment guidance.'
      },
      PAYMENT_RECEIPT_CONFIRMATION: {
        name: '5. Payment Receipt Confirmation',
        metaTemplateName: 'payment_receipt_confirmation',
        category: 'UTILITY',
        headerType: 'DOCUMENT (Receipt.pdf)',
        trigger: 'Automatic: Payment Receipt, with Thank you msg on entry and after posting',
        description: 'Transaction Confirmation: Proof of received payment and updated balance.',
        sample: 'Dear Nouman Attique, we have received your payment of PKR 4,500 via Bank Transfer (Receipt #RCP-8831). Your updated outstanding balance is PKR 0.00. Thank you for choosing Energy Gurus! Your official receipt is attached.'
      },
      SERVICE_SUSPENSION_NONPAYMENT: {
        name: '6. Service Suspension (Non-Payment)',
        metaTemplateName: 'service_suspension_nonpayment',
        category: 'UTILITY',
        headerType: 'TEXT',
        trigger: 'Triggered when customer status moves to NON_PAYMENT_BLOCKED',
        description: 'Notifies customer that monitoring & O&M service is suspended due to unpaid dues.',
        sample: 'Dear Nouman Attique, your solar monitoring and O&M service for Customer ID 101 has been temporarily suspended due to outstanding dues of PKR 9,000. Please clear your dues and share proof of payment with +923009433303 for immediate restoration.'
      },
      SERVICE_RESTORED_CONFIRMATION: {
        name: '7. Service Restoration (After Payment)',
        metaTemplateName: 'service_restored_confirmation',
        category: 'UTILITY',
        headerType: 'TEXT',
        trigger: 'Triggered when status transitions back to CONNECTION_ACTIVE',
        description: 'Confirms that O&M services have been restored following dues clearance.',
        sample: `Dear Nouman Attique, thank you for clearing your outstanding dues! Your solar O&M service for Customer ID 101 has been fully restored as of ${today}.`
      },
      TEMPORARY_HOLD_NOTICE: {
        name: '8. Temporary Hold Notice (Customer Request)',
        metaTemplateName: 'temporary_hold_notice',
        category: 'UTILITY',
        headerType: 'TEXT',
        trigger: 'Triggered when customer status is set to TEMPORARY_BLOCKED',
        description: 'Confirms customer request to pause service temporarily.',
        sample: `Dear Nouman Attique, as per your request, your solar O&M service (Customer ID: 101) has been placed on temporary hold effective ${today}. To reactivate your service anytime, contact +923009433303.`
      },
      TEMPORARY_HOLD_REACTIVATED: {
        name: '9. Temporary Hold Reactivated',
        metaTemplateName: 'temporary_hold_reactivated',
        category: 'UTILITY',
        headerType: 'TEXT',
        trigger: 'Triggered when temporarily blocked service is un-paused',
        description: 'Confirms successful reactivation after a voluntary pause.',
        sample: `Dear Nouman Attique, your solar service for Customer ID 101 has been successfully reactivated on ${today}. Active system monitoring and support features are now live.`
      },
      TICKET_REGISTERED_ACK: {
        name: '10. Support Ticket Registered',
        metaTemplateName: 'ticket_registered_ack',
        category: 'UTILITY',
        headerType: 'TEXT',
        trigger: 'Triggered when a support ticket or complaint is opened in CRM',
        description: 'Acknowledges ticket registration with assigned team and SLA timeline.',
        sample: 'Dear Nouman Attique, your support request has been registered under Ticket #TKT-2026-0042 (Category: Inverter Fault). Our O&M Technical team is reviewing your complaint with an expected resolution within 24 Hours. Contact +923009433303 for urgent updates.'
      },
      TICKET_RESOLVED_CLOSURE: {
        name: '11. Support Ticket Resolved & Closed',
        metaTemplateName: 'ticket_resolved_closure',
        category: 'UTILITY',
        headerType: 'TEXT',
        trigger: 'Triggered when a support ticket status is changed to RESOLVED',
        description: 'Notifies customer of resolution with technician remarks and feedback URL button.',
        sample: `Dear Nouman Attique, your Ticket #TKT-2026-0042 has been resolved on ${today}. Remarks: Inverter grid sync restored. Thank you for choosing Energy Gurus!`
      },
      DAILY_SOLAR_GENERATION_REPORT: {
        name: '12. Solar Performance Report (Weekly & Monthly)',
        metaTemplateName: 'daily_solar_generation_report',
        category: 'UTILITY',
        headerType: 'TEXT',
        trigger: 'Automatic: Weekly (Sundays) and Monthly (1st of month) only',
        description: 'Informational / Telemetry: Routine performance report for active monitoring subscribers (weekly and monthly only).',
        sample: `Dear Nouman Attique, your solar generation summary for ${today}:\n⚡ Today's Generation: 45.2 kWh (Units)\n📊 Month-to-Date: 520.4 kWh (Units)\n📈 Year-to-Date: 6,430 kWh (Units)\nEnergy Gurus Solar Monitoring`
      },
      
      SOLAR_PROMOTIONAL_OFFER: {
        name: '13. Promotional Flyer / Pamphlet Campaign',
        metaTemplateName: 'solar_promotional_offer',
        category: 'MARKETING',
        headerType: 'IMAGE (Pamphlet / Flyer Snapshot)',
        trigger: 'On-Demand: Sent to bulk lead contacts (1,000–1,500 numbers)',
        description: 'Marketing: Solar monitoring & O&M advertisement with image flyer snapshot.',
        sample: 'Protect Your Solar Investment!\n\nDear Customer,\n\nYour solar system is a valuable investment. Keep it performing efficiently with professional solar monitoring, operations, and maintenance services from EnergyGurusOnline. Give your solar system the care it deserves!\n\nContact us today to learn more.\nRegards,\nTeam – EnergyGurusOnline\nWhatsApp +923009433303\nInfo@energygurus.online\nwww.energygurus.online'
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