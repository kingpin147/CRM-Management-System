import prisma from './prisma';
import { SMSTemplateService, SMSTemplateContext } from './sms-service';
import { createSMSService } from './sms-api';

export class NotificationService {
  private smsService = createSMSService();

  /**
   * Send registration completion WhatsApp (Scenario 1: customer_welcome_crf)
   */
  async sendRegistrationNotification(customerId: string): Promise<boolean> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId }
      });

      if (!customer || !customer.contactNumber) {
        throw new Error('Customer or contact number not found');
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crm.energygurus.pk';

      const result = await this.smsService.sendSMS({
        to: customer.contactNumber,
        customerId: customer.id,
        templateName: 'customer_welcome_crf',
        bodyParams: [
          customer.fullName,
          customer.customerCode,
          customer.crfNumber || `CRF-${customer.customerCode}`,
          '+92 316 4266004'
        ],
        headerDocument: {
          link: `${appUrl}/api/customers/${customer.id}/crf`,
          filename: `CRF_${customer.customerCode}.pdf`
        },
        type: 'WELCOME'
      });

      return result.success;
    } catch (error) {
      console.error('Failed to send registration notification:', error);
      return false;
    }
  }

  /**
   * Send invoice generation WhatsApp (Scenario 2: monthly_invoice_dispatch)
   */
  async sendInvoiceNotification(invoiceId: string): Promise<boolean> {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { customer: true }
      });

      if (!invoice || !invoice.customer || !invoice.customer.contactNumber) {
        throw new Error('Invoice or customer contact not found');
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crm.energygurus.pk';
      const monthName = new Date(invoice.billingPeriod).toLocaleString('en-US', { month: 'long', year: 'numeric' });
      const dueDateStr = SMSTemplateService.formatDate(invoice.dueDate);
      const formattedAmount = Number(invoice.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 });

      const result = await this.smsService.sendSMS({
        to: invoice.customer.contactNumber,
        customerId: invoice.customer.id,
        templateName: 'monthly_invoice_dispatch',
        bodyParams: [
          invoice.customer.fullName,
          invoice.invoiceNumber,
          monthName,
          formattedAmount,
          dueDateStr
        ],
        headerDocument: {
          link: `${appUrl}/api/invoice/${invoice.id}/pdf`,
          filename: `Invoice_${invoice.invoiceNumber}.pdf`
        },
        urlButtonParam: invoice.id,
        type: 'INVOICE',
        invoiceId: invoice.id
      });

      return result.success;
    } catch (error) {
      console.error('Failed to send invoice notification:', error);
      return false;
    }
  }

  /**
   * Send payment due reminder WhatsApp (Scenario 3: payment_due_reminder)
   */
  async sendPaymentDueReminder(invoiceId: string): Promise<boolean> {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { customer: true }
      });

      if (!invoice || invoice.status.toUpperCase() === 'PAID' || !invoice.customer.contactNumber) {
        return false;
      }

      const dueDateStr = SMSTemplateService.formatDate(invoice.dueDate);
      const formattedAmount = Number(invoice.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 });

      const result = await this.smsService.sendSMS({
        to: invoice.customer.contactNumber,
        customerId: invoice.customer.id,
        templateName: 'payment_due_reminder',
        bodyParams: [
          invoice.customer.fullName,
          invoice.invoiceNumber,
          formattedAmount,
          dueDateStr,
          '+92 316 4266004'
        ],
        type: 'DUE_REMINDER',
        invoiceId: invoice.id
      });

      return result.success;
    } catch (error) {
      console.error('Failed to send payment due reminder:', error);
      return false;
    }
  }

  /**
   * Send payment received confirmation WhatsApp (Scenario 5: payment_receipt_confirmation)
   */
  async sendPaymentReceivedNotification(transactionId: string): Promise<boolean> {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { customer: true }
      });

      if (!transaction || !transaction.customer || !transaction.customer.contactNumber) {
        throw new Error('Transaction or customer not found');
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crm.energygurus.pk';
      const receiptNumber = `RCP-${transaction.id.slice(-8).toUpperCase()}`;
      const formattedAmount = Number(transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2 });
      const paymentDate = SMSTemplateService.formatDate(transaction.createdAt);

      // Find current ledger balance
      const latestLedger = await prisma.ledgerEntry.findFirst({
        where: { customerId: transaction.customerId },
        orderBy: { date: 'desc' }
      });
      const balanceStr = Number(latestLedger?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });

      const result = await this.smsService.sendSMS({
        to: transaction.customer.contactNumber,
        customerId: transaction.customer.id,
        templateName: 'payment_receipt_confirmation',
        bodyParams: [
          transaction.customer.fullName,
          formattedAmount,
          receiptNumber,
          paymentDate,
          balanceStr
        ],
        headerDocument: {
          link: `${appUrl}/api/receipt/${transaction.id}`,
          filename: `Receipt_${receiptNumber}.pdf`
        },
        type: 'RECEIPT'
      });

      return result.success;
    } catch (error) {
      console.error('Failed to send payment received notification:', error);
      return false;
    }
  }

  /**
   * Send complaint registered WhatsApp (Scenario 10: ticket_registered_ack)
   */
  async sendComplaintRegisteredNotification(ticketId: string): Promise<boolean> {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { customer: true }
      });

      if (!ticket || !ticket.customer || !ticket.customer.contactNumber) {
        throw new Error('Ticket or customer not found');
      }

      const result = await this.smsService.sendSMS({
        to: ticket.customer.contactNumber,
        customerId: ticket.customer.id,
        templateName: 'ticket_registered_ack',
        bodyParams: [
          ticket.customer.fullName,
          ticket.ticketNumber,
          ticket.category || 'General Support',
          ticket.assignedTo || 'O&M Team',
          '24 Hours',
          '+92 316 4266004'
        ],
        type: 'TICKET'
      });

      return result.success;
    } catch (error) {
      console.error('Failed to send complaint registered notification:', error);
      return false;
    }
  }

  /**
   * Send complaint resolved WhatsApp (Scenario 11: ticket_resolved_closure)
   */
  async sendComplaintResolvedNotification(ticketId: string): Promise<boolean> {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { customer: true, histories: { orderBy: { createdAt: 'desc' }, take: 1 } }
      });

      if (!ticket || ticket.status !== 'RESOLVED' || !ticket.customer.contactNumber) {
        return false;
      }

      const closureDate = SMSTemplateService.formatDate(new Date());
      const remarks = ticket.histories[0]?.remarks || 'Issue has been successfully resolved.';

      const result = await this.smsService.sendSMS({
        to: ticket.customer.contactNumber,
        customerId: ticket.customer.id,
        templateName: 'ticket_resolved_closure',
        bodyParams: [
          ticket.customer.fullName,
          ticket.ticketNumber,
          closureDate,
          remarks
        ],
        urlButtonParam: ticket.ticketNumber,
        type: 'TICKET'
      });

      return result.success;
    } catch (error) {
      console.error('Failed to send complaint resolved notification:', error);
      return false;
    }
  }

  /**
   * Send daily solar production report WhatsApp (Scenario 12: daily_solar_generation_report)
   */
  async sendDailySolarReport(customerId: string, solarData: {
    todayUnits: number;
    mtdUnits: number;
    ytdUnits: number;
  }): Promise<boolean> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: { solarSystem: true }
      });

      if (!customer || !customer.solarSystem || !customer.contactNumber) {
        return false;
      }

      const reportDate = SMSTemplateService.formatDate(new Date());

      const result = await this.smsService.sendSMS({
        to: customer.contactNumber,
        customerId: customer.id,
        templateName: 'daily_solar_generation_report',
        bodyParams: [
          customer.fullName,
          reportDate,
          solarData.todayUnits,
          solarData.mtdUnits,
          solarData.ytdUnits
        ],
        type: 'REPORT'
      });

      return result.success;
    } catch (error) {
      console.error('Failed to send daily solar report:', error);
      return false;
    }
  }

  /**
   * Send bulk notifications for overdue invoices
   */
  async sendBulkOverdueReminders(): Promise<{ sent: number; failed: number }> {
    try {
      const now = new Date();
      const overdueInvoices = await prisma.invoice.findMany({
        where: {
          status: { in: ['Unpaid', 'UNPAID', 'Overdue', 'OVERDUE'] },
          dueDate: {
            lte: now
          }
        },
        include: { customer: true }
      });

      let sent = 0;
      let failed = 0;

      for (const invoice of overdueInvoices) {
        if (!invoice.customer || !invoice.customer.contactNumber) continue;

        const formattedDueDate = SMSTemplateService.formatDate(invoice.dueDate);
        const formattedAmount = Number(invoice.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 });
        const daysPastDue = Math.max(1, Math.floor((now.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)));

        const res = await this.smsService.sendSMS({
          to: invoice.customer.contactNumber,
          customerId: invoice.customer.id,
          templateName: 'payment_overdue_notice',
          bodyParams: [
            invoice.customer.fullName,
            invoice.invoiceNumber,
            formattedAmount,
            daysPastDue,
            '+92 316 4266004'
          ],
          type: 'OVERDUE_REMINDER',
          invoiceId: invoice.id
        });

        if (res.success) {
          sent++;
        } else {
          failed++;
        }

        await new Promise(resolve => setTimeout(resolve, 200));
      }

      return { sent, failed };
    } catch (error) {
      console.error('Failed to send bulk overdue reminders:', error);
      return { sent: 0, failed: 0 };
    }
  }

  /**
   * Send custom WhatsApp message
   */
  async sendCustomMessage(customerId: string, message: string): Promise<boolean> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId }
      });

      if (!customer || !customer.contactNumber) {
        throw new Error('Customer or contact number not found');
      }

      const result = await this.smsService.sendSMS({
        to: customer.contactNumber,
        message,
        customerId: customer.id,
        type: 'MANUAL'
      });

      return result.success;
    } catch (error) {
      console.error('Failed to send custom message:', error);
      return false;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();