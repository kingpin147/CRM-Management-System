/**
 * WhatsApp Meta Cloud API Adapter for Messaging Service
 */
import prisma from './prisma';
import { sendWhatsAppTemplate, sendWhatsAppText, formatWhatsAppPhone } from './whatsapp';

export interface SMSApiResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryStatus?: 'SENT' | 'DELIVERED' | 'FAILED' | 'PENDING';
}

export interface SendSMSRequest {
  to: string;
  message?: string;
  templateName?: string;
  bodyParams?: (string | number)[];
  headerDocument?: {
    link: string;
    filename: string;
  };
  headerImage?: string;
  urlButtonParam?: string;
  customerId?: string;
  type?: string;
  invoiceId?: string;
}

export class SMSApiService {
  /**
   * Send WhatsApp notification using Meta WhatsApp Cloud API
   */
  async sendSMS(request: SendSMSRequest): Promise<SMSApiResponse> {
    try {
      const type = (request.type || 'MANUAL') as any;
      const customerId = request.customerId || 'system';

      if (request.templateName) {
        const result = await sendWhatsAppTemplate({
          customerId,
          recipientPhone: request.to,
          templateName: request.templateName,
          bodyParams: request.bodyParams || [],
          headerDocument: request.headerDocument,
          headerImage: request.headerImage,
          urlButtonParam: request.urlButtonParam,
          type,
          invoiceId: request.invoiceId,
        });

        return {
          success: result.success,
          messageId: result.wamid || undefined,
          error: result.error || undefined,
          deliveryStatus: result.success ? 'SENT' : 'FAILED',
        };
      } else {
        const result = await sendWhatsAppText({
          customerId,
          recipientPhone: request.to,
          message: request.message || '',
          type,
          invoiceId: request.invoiceId,
        });

        return {
          success: result.success,
          messageId: result.wamid || undefined,
          error: result.error || undefined,
          deliveryStatus: result.success ? 'SENT' : 'FAILED',
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
        deliveryStatus: 'FAILED',
      };
    }
  }

  /**
   * Send bulk WhatsApp messages
   */
  async sendBulkSMS(requests: SendSMSRequest[]): Promise<SMSApiResponse[]> {
    const results: SMSApiResponse[] = [];

    for (const request of requests) {
      try {
        const result = await this.sendSMS(request);
        results.push(result);
        await new Promise((resolve) => setTimeout(resolve, 150));
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          deliveryStatus: 'FAILED',
        });
      }
    }

    return results;
  }

  /**
   * Update message delivery status in database
   */
  async updateDeliveryStatus(externalId: string, status: string) {
    try {
      await prisma.communicationLog.updateMany({
        where: { externalId },
        data: {
          status,
          deliveredAt: status === 'DELIVERED' ? new Date() : undefined,
          openedAt: status === 'READ' || status === 'OPENED' ? new Date() : undefined,
        },
      });
    } catch (error) {
      console.error('Failed to update delivery status:', error);
    }
  }
}

// Factory function
export function createSMSService(): SMSApiService {
  return new SMSApiService();
}