import { prisma } from './prisma';
import { SMSTemplateService, SMSTemplateContext, SMSTemplateType } from './sms-service';
import { createSMSService, SendSMSRequest } from './sms-api';
import { Customer, Invoice, Ticket, Transaction, SolarSystem } from '@prisma/client';

export class NotificationService {
  private smsService = createSMSService();

  /**
   * Send registration completion SMS
   */
  async sendRegistrationNotification(customerId: string): Promise<boolean> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId }
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      const context: SMSTemplateContext = {
        customer,
        customerCode: customer.customerCode,
        customerName: customer.fullName,
        contactNumber: customer.contactNumber,
        currentDate: SMSTemplateService.formatDate(new Date())
      };

      const message = SMSTemplateService.generateRegistrationMessage(context);

      const result = await this.smsService.sendSMS({
        to: customer.contactNumber,
        message,
        customerId: customer.id,
        type: 'REGISTRATION'
      });

      return result.success;
    } catch (error) {
      console.error('Failed to send registration notification:', error);
      return false;
    }
  }

  /**
   * Send invoice generation SMS
   */
  async sendInvoiceNotification(invoiceId: string): Promise<boolean> {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { customer: true }
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      const context: SMSTemplateContext = {
        customer: invoice.customer,
        customerCode: invoice.customer.customerCode,
        customerName: invoice.customer.fullName,
        contactNumber: invoice.customer.contactNumber,
        amount: Number(invoice.totalAmount),
        invoiceNumber: invoice.invoiceNumber,
        dueDate: SMSTemplateService.formatDate(invoice.dueDate),
        currentDate: SMSTemplateService.formatDate(new Date())
      };

      const message = SMSTemplateService.generateInvoiceMessage(context);

      const result = await this.smsService.sendSMS({
        to: invoice.customer.contactNumber,
        message,
        customerId: invoice.customer.id,
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
   * Send payment due reminder SMS
   */
  async sendPaymentDueReminder(invoiceId: string): Promise<boolean> {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { customer: true }
      });

      if (!invoice || invoice.status === 'Paid') {
        return false; // Don't send reminder for paid invoices
      }

      const context: SMSTemplateContext = {
        customer: invoice.customer,
        customerCode: invoice.customer.customerCode,
        customerName: invoice.customer.fullName,
        contactNumber: invoice.customer.contactNumber,
        amount: Number(invoice.totalAmount),
        invoiceNumber: invoice.invoiceNumber,
        dueDate: SMSTemplateService.formatDate(invoice.dueDate)
      };

      const message = SMSTemplateService.generatePaymentDueMessage(context);

      const result = await this.smsService.sendSMS({
        to: invoice.customer.contactNumber,
        message,
        customerId: invoice.customer.id,
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
   * Send payment received confirmation SMS
   */
  async sendPaymentReceivedNotification(transactionId: string): Promise<boolean> {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { customer: true }
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Generate receipt number (you may want to customize this format)
      const receiptNumber = `RCP-${transaction.id.slice(-8).toUpperCase()}`;

      const context: SMSTemplateContext = {
        customer: transaction.customer,
        customerCode: transaction.customer.customerCode,
        customerName: transaction.customer.fullName,
        contactNumber: transaction.customer.contactNumber,
        amount: Number(transaction.amount),
        receiptNumber,
        currentDate: SMSTemplateService.formatDate(new Date())
      };

      const message = SMSTemplateService.generatePaymentReceivedMessage(context);

      const result = await this.smsService.sendSMS({
        to: transaction.customer.contactNumber,
        message,
        customerId: transaction.customer.id,
        type: 'PAYMENT_CONFIRMATION'
      });

      return result.success;
    } catch (error) {
      console.error('Failed to send payment received notification:', error);
      return false;
    }
  }

  /**
   * Send complaint registered SMS
   */
  async sendComplaintRegisteredNotification(ticketId: string): Promise<boolean> {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { customer: true }
      });

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      const context: SMSTemplateContext = {
        customer: ticket.customer,
        customerCode: ticket.customer.customerCode,
        customerName: ticket.customer.fullName,
        contactNumber: ticket.customer.contactNumber,
        complaintNumber: ticket.ticketNumber,
        currentDate: SMSTemplateService.formatDate(ticket.createdAt)
      };

      const message = SMSTemplateService.generateComplaintRegisteredMessage(context);

      const result = await this.smsService.sendSMS({
        to: ticket.customer.contactNumber,
        message,
        customerId: ticket.customer.id,
        type: 'COMPLAINT_REGISTERED'
      });

      return result.success;
    } catch (error) {
      console.error('Failed to send complaint registered notification:', error);
      return false;
    }
  }

  /**
   * Send complaint resolved SMS
   */
  async sendComplaintResolvedNotification(ticketId: string): Promise<boolean> {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { customer: true }
      });

      if (!ticket || ticket.status !== 'RESOLVED') {
        return false; // Only send for resolved tickets
      }

      const context: SMSTemplateContext = {
        customer: ticket.customer,
        customerCode: ticket.customer.customerCode,
        customerName: ticket.customer.fullName,
        contactNumber: ticket.customer.contactNumber,
        complaintNumber: ticket.ticketNumber,
        closureDate: SMSTemplateService.formatDate(new Date()) // Use current date as closure date
      };

      const message = SMSTemplateService.generateComplaintResolvedMessage(context);

      const result = await this.smsService.sendSMS({
        to: ticket.customer.contactNumber,
        message,
        customerId: ticket.customer.id,
        type: 'COMPLAINT_RESOLVED'
      });

      return result.success;
    } catch (error) {
      console.error('Failed to send complaint resolved notification:', error);
      return false;
    }
  }

  /**
   * Send daily solar production report SMS
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

      if (!customer || !customer.solarSystem) {
        return false; // Customer must have a solar system
      }

      const context: SMSTemplateContext = {
        customer,
        customerCode: customer.customerCode,
        customerName: customer.fullName,
        contactNumber: customer.contactNumber,
        todayUnits: solarData.todayUnits,
        mtdUnits: solarData.mtdUnits,
        ytdUnits: solarData.ytdUnits
      };

      const message = SMSTemplateService.generateDailySolarReportMessage(context);

      const result = await this.smsService.sendSMS({
        to: customer.contactNumber,
        message,
        customerId: customer.id,
        type: 'SOLAR_REPORT'
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
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const overdueInvoices = await prisma.invoice.findMany({
        where: {
          status: 'Unpaid',
          dueDate: {
            lte: tomorrow
          }
        },
        include: { customer: true }
      });

      let sent = 0;
      let failed = 0;

      for (const invoice of overdueInvoices) {
        const success = await this.sendPaymentDueReminder(invoice.id);
        if (success) {
          sent++;
        } else {
          failed++;
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return { sent, failed };
    } catch (error) {
      console.error('Failed to send bulk overdue reminders:', error);
      return { sent: 0, failed: 0 };
    }
  }

  /**
   * Send custom SMS message
   */
  async sendCustomMessage(customerId: string, message: string): Promise<boolean> {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId }
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      const result = await this.smsService.sendSMS({
        to: customer.contactNumber,
        message,
        customerId: customer.id,
        type: 'CUSTOM'
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