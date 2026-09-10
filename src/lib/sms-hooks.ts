/**
 * SMS Notification Hooks
 * These functions are called automatically when certain events occur in the system
 */

import { notificationService } from './notification-service';
import { prisma } from './prisma';

export class SMSHooks {
  /**
   * Hook called after customer registration is completed
   */
  static async onCustomerRegistered(customerId: string) {
    try {
      await notificationService.sendRegistrationNotification(customerId);
      console.log(`Registration SMS sent for customer: ${customerId}`);
    } catch (error) {
      console.error('Failed to send registration SMS:', error);
    }
  }

  /**
   * Hook called after invoice is created
   */
  static async onInvoiceCreated(invoiceId: string) {
    try {
      await notificationService.sendInvoiceNotification(invoiceId);
      console.log(`Invoice SMS sent for invoice: ${invoiceId}`);
    } catch (error) {
      console.error('Failed to send invoice SMS:', error);
    }
  }

  /**
   * Hook called after payment is received
   */
  static async onPaymentReceived(transactionId: string) {
    try {
      await notificationService.sendPaymentReceivedNotification(transactionId);
      console.log(`Payment confirmation SMS sent for transaction: ${transactionId}`);
    } catch (error) {
      console.error('Failed to send payment confirmation SMS:', error);
    }
  }

  /**
   * Hook called after complaint/ticket is created
   */
  static async onComplaintRegistered(ticketId: string) {
    try {
      await notificationService.sendComplaintRegisteredNotification(ticketId);
      console.log(`Complaint registration SMS sent for ticket: ${ticketId}`);
    } catch (error) {
      console.error('Failed to send complaint registration SMS:', error);
    }
  }

  /**
   * Hook called after complaint/ticket is resolved
   */
  static async onComplaintResolved(ticketId: string) {
    try {
      await notificationService.sendComplaintResolvedNotification(ticketId);
      console.log(`Complaint resolution SMS sent for ticket: ${ticketId}`);
    } catch (error) {
      console.error('Failed to send complaint resolution SMS:', error);
    }
  }

  /**
   * Hook for daily solar reports (called by cron job)
   */
  static async sendDailySolarReports() {
    try {
      // Get all customers with active solar systems
      const customersWithSolar = await prisma.customer.findMany({
        where: {
          solarSystem: {
            isNot: null
          },
          status: 'CONNECTION_ACTIVE'
        },
        include: {
          solarSystem: true
        }
      });

      let sent = 0;
      let failed = 0;

      for (const customer of customersWithSolar) {
        try {
          // You would replace this with actual solar data from your monitoring system
          const solarData = await getSolarProductionData(customer.id);
          
          if (solarData) {
            const success = await notificationService.sendDailySolarReport(customer.id, solarData);
            if (success) {
              sent++;
            } else {
              failed++;
            }
          }

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to send solar report for customer ${customer.id}:`, error);
          failed++;
        }
      }

      console.log(`Daily solar reports: ${sent} sent, ${failed} failed`);
      return { sent, failed };
    } catch (error) {
      console.error('Failed to send daily solar reports:', error);
      return { sent: 0, failed: 0 };
    }
  }

  /**
   * Hook for overdue payment reminders (called by cron job)
   */
  static async sendOverdueReminders() {
    try {
      const result = await notificationService.sendBulkOverdueReminders();
      console.log(`Overdue reminders: ${result.sent} sent, ${result.failed} failed`);
      return result;
    } catch (error) {
      console.error('Failed to send overdue reminders:', error);
      return { sent: 0, failed: 0 };
    }
  }
}

/**
 * Helper function to get solar production data
 * Replace this with actual implementation based on your solar monitoring system
 */
async function getSolarProductionData(customerId: string): Promise<{
  todayUnits: number;
  mtdUnits: number;
  ytdUnits: number;
} | null> {
  try {
    // This is a placeholder - replace with actual solar monitoring API calls
    // You might integrate with inverter APIs, monitoring platforms, or your own data collection
    
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const yearStart = new Date(today.getFullYear(), 0, 1);

    // Placeholder data - replace with actual solar monitoring data
    return {
      todayUnits: Math.floor(Math.random() * 50) + 20, // 20-70 units
      mtdUnits: Math.floor(Math.random() * 1500) + 800, // 800-2300 units
      ytdUnits: Math.floor(Math.random() * 15000) + 10000 // 10k-25k units
    };
  } catch (error) {
    console.error('Failed to get solar production data:', error);
    return null;
  }
}

export { getSolarProductionData };