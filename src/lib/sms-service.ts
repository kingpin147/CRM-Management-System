import { Customer, Invoice, Ticket, Transaction, SolarSystem } from '@prisma/client';

export interface SMSTemplateContext {
  customer: Customer;
  customerCode: string;
  customerName: string;
  contactNumber: string;
  amount?: number;
  invoiceNumber?: string;
  receiptNumber?: string;
  complaintNumber?: string;
  dueDate?: string;
  currentDate?: string;
  closureDate?: string;
  todayUnits?: number;
  mtdUnits?: number;
  ytdUnits?: number;
}

export class SMSTemplateService {
  private static readonly SUPPORT_WHATSAPP = '+923009433303';

  // Template definitions with placeholders
  private static readonly TEMPLATES = {
    REGISTRATION_COMPLETE: `Dear Customer, Welcome to EnergyGurus.online! Your registration is complete. Customer ID: {{customerCode}}. 

For support: WhatsApp ${SMSTemplateService.SUPPORT_WHATSAPP}. Thank you!`,

    INVOICE_GENERATED: `Dear Customer, Invoice {{invoiceNumber}} for {{billingMonth}} {{billingYear}}: PKR {{amount}} | Due: {{dueDate}}. Please pay by the due date to continue uninterrupted service. 

For support: WhatsApp ${SMSTemplateService.SUPPORT_WHATSAPP}. Thank you!`,

    PAYMENT_DUE_REMINDER: `Dear Customer, Invoice {{invoiceNumber}} of PKR {{amount}} is due tomorrow, {{dueDate}}. Please clear your dues to avoid service interruption.

For support: WhatsApp ${SMSTemplateService.SUPPORT_WHATSAPP}. Thank you!`,

    PAYMENT_RECEIVED: `Dear Customer, Payment of PKR {{amount}} received. Receipt {{receiptNumber}} | {{currentDate}}.

For support: WhatsApp ${SMSTemplateService.SUPPORT_WHATSAPP}. Thank you!`,

    COMPLAINT_REGISTERED: `Dear Customer, Your complaint has been registered. Complaint {{complaintNumber}} | Date: {{currentDate}}. Our support team will review it shortly.

For support: WhatsApp ${SMSTemplateService.SUPPORT_WHATSAPP}. Thank you!`,

    COMPLAINT_RESOLVED: `Dear Customer, Complaint {{complaintNumber}} has been resolved and closed. Closure Date: {{closureDate}}. 

For support: WhatsApp ${SMSTemplateService.SUPPORT_WHATSAPP}. Thank you!`,

    DAILY_SOLAR_REPORT: `Dear Customer, 

Your Solar System | Produced {{todayUnits}} Units Today | MTD Units {{mtdUnits}} | YTD Units {{ytdUnits}} .

For support: WhatsApp ${SMSTemplateService.SUPPORT_WHATSAPP}. Thank you!`
  } as const;

  /**
   * Replace template placeholders with actual values
   */
  private static replacePlaceholders(template: string, context: SMSTemplateContext): string {
    let message = template;

    // Customer info
    message = message.replace(/{{customerCode}}/g, context.customerCode);
    message = message.replace(/{{customerName}}/g, context.customerName);

    // Financial info
    if (context.amount !== undefined) {
      message = message.replace(/{{amount}}/g, context.amount.toLocaleString('en-PK'));
    }
    if (context.invoiceNumber) {
      message = message.replace(/{{invoiceNumber}}/g, context.invoiceNumber);
    }
    if (context.receiptNumber) {
      message = message.replace(/{{receiptNumber}}/g, context.receiptNumber);
    }

    // Complaint info
    if (context.complaintNumber) {
      message = message.replace(/{{complaintNumber}}/g, context.complaintNumber);
    }

    // Date info
    if (context.dueDate) {
      message = message.replace(/{{dueDate}}/g, context.dueDate);
    }
    if (context.currentDate) {
      message = message.replace(/{{currentDate}}/g, context.currentDate);
    }
    if (context.closureDate) {
      message = message.replace(/{{closureDate}}/g, context.closureDate);
    }

    // Solar system info
    if (context.todayUnits !== undefined) {
      message = message.replace(/{{todayUnits}}/g, context.todayUnits.toString());
    }
    if (context.mtdUnits !== undefined) {
      message = message.replace(/{{mtdUnits}}/g, context.mtdUnits.toString());
    }
    if (context.ytdUnits !== undefined) {
      message = message.replace(/{{ytdUnits}}/g, context.ytdUnits.toString());
    }

    // Handle billing month/year from due date
    if (context.dueDate) {
      const dueDateTime = new Date(context.dueDate);
      const billingDate = new Date(dueDateTime);
      billingDate.setMonth(billingDate.getMonth() - 1); // Billing is for previous month
      
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      
      message = message.replace(/{{billingMonth}}/g, monthNames[billingDate.getMonth()]);
      message = message.replace(/{{billingYear}}/g, billingDate.getFullYear().toString());
    }

    return message;
  }

  /**
   * Generate SMS message for customer registration completion
   */
  static generateRegistrationMessage(context: SMSTemplateContext): string {
    return this.replacePlaceholders(this.TEMPLATES.REGISTRATION_COMPLETE, context);
  }

  /**
   * Generate SMS message for invoice generation
   */
  static generateInvoiceMessage(context: SMSTemplateContext): string {
    return this.replacePlaceholders(this.TEMPLATES.INVOICE_GENERATED, context);
  }

  /**
   * Generate SMS message for payment due reminder
   */
  static generatePaymentDueMessage(context: SMSTemplateContext): string {
    return this.replacePlaceholders(this.TEMPLATES.PAYMENT_DUE_REMINDER, context);
  }

  /**
   * Generate SMS message for payment received
   */
  static generatePaymentReceivedMessage(context: SMSTemplateContext): string {
    return this.replacePlaceholders(this.TEMPLATES.PAYMENT_RECEIVED, context);
  }

  /**
   * Generate SMS message for complaint registration
   */
  static generateComplaintRegisteredMessage(context: SMSTemplateContext): string {
    return this.replacePlaceholders(this.TEMPLATES.COMPLAINT_REGISTERED, context);
  }

  /**
   * Generate SMS message for complaint resolution
   */
  static generateComplaintResolvedMessage(context: SMSTemplateContext): string {
    return this.replacePlaceholders(this.TEMPLATES.COMPLAINT_RESOLVED, context);
  }

  /**
   * Generate SMS message for daily solar report
   */
  static generateDailySolarReportMessage(context: SMSTemplateContext): string {
    return this.replacePlaceholders(this.TEMPLATES.DAILY_SOLAR_REPORT, context);
  }

  /**
   * Format date for SMS display (dd-MMM-yyyy format)
   */
  static formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  }
}

export type SMSTemplateType = 
  | 'REGISTRATION_COMPLETE'
  | 'INVOICE_GENERATED'
  | 'PAYMENT_DUE_REMINDER'  
  | 'PAYMENT_RECEIVED'
  | 'COMPLAINT_REGISTERED'
  | 'COMPLAINT_RESOLVED'
  | 'DAILY_SOLAR_REPORT';