import { prisma } from './prisma';

export interface SMSApiConfig {
  apiKey: string;
  apiUrl?: string;
  sender?: string;
}

export interface SMSApiResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  deliveryStatus?: 'SENT' | 'DELIVERED' | 'FAILED' | 'PENDING';
}

export interface SendSMSRequest {
  to: string;
  message: string;
  customerId?: string;
  type?: string;
  invoiceId?: string;
}

export class SMSApiService {
  private config: SMSApiConfig;

  constructor(config: SMSApiConfig) {
    this.config = config;
  }

  /**
   * Send SMS using the configured SMS provider
   * This is a generic implementation - you'll need to adapt it to your specific SMS API
   */
  async sendSMS(request: SendSMSRequest): Promise<SMSApiResponse> {
    try {
      // Example implementation for a generic SMS API
      // Replace this with your specific SMS provider's API
      const payload = {
        apikey: this.config.apiKey,
        sender: this.config.sender || 'EnergyGuru',
        number: request.to,
        message: request.message,
        format: 'json'
      };

      const response = await fetch(this.config.apiUrl || 'https://your-sms-provider.com/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      // Log the communication in the database
      if (request.customerId) {
        await this.logCommunication({
          customerId: request.customerId,
          channel: 'SMS',
          type: request.type || 'MANUAL',
          recipient: request.to,
          messageBody: request.message,
          status: result.success ? 'SENT' : 'FAILED',
          externalId: result.messageId,
          invoiceId: request.invoiceId,
          errorDetails: result.error
        });
      }

      return {
        success: result.success || false,
        messageId: result.messageId,
        error: result.error,
        deliveryStatus: result.success ? 'SENT' : 'FAILED'
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log failed communication
      if (request.customerId) {
        await this.logCommunication({
          customerId: request.customerId,
          channel: 'SMS',
          type: request.type || 'MANUAL',
          recipient: request.to,
          messageBody: request.message,
          status: 'FAILED',
          errorDetails: errorMessage
        });
      }

      return {
        success: false,
        error: errorMessage,
        deliveryStatus: 'FAILED'
      };
    }
  }

  /**
   * Send bulk SMS messages
   */
  async sendBulkSMS(requests: SendSMSRequest[]): Promise<SMSApiResponse[]> {
    const results: SMSApiResponse[] = [];
    
    for (const request of requests) {
      try {
        const result = await this.sendSMS(request);
        results.push(result);
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          deliveryStatus: 'FAILED'
        });
      }
    }

    return results;
  }

  /**
   * Log communication to the database
   */
  private async logCommunication(data: {
    customerId: string;
    channel: string;
    type: string;
    recipient: string;
    messageBody: string;
    status: string;
    externalId?: string;
    invoiceId?: string;
    errorDetails?: string;
  }) {
    try {
      await prisma.communicationLog.create({
        data: {
          customerId: data.customerId,
          channel: data.channel,
          type: data.type,
          recipient: data.recipient,
          messageBody: data.messageBody,
          status: data.status,
          externalId: data.externalId,
          invoiceId: data.invoiceId,
          errorDetails: data.errorDetails,
        }
      });
    } catch (error) {
      console.error('Failed to log communication:', error);
    }
  }

  /**
   * Get delivery status for a message
   */
  async getDeliveryStatus(messageId: string): Promise<string> {
    try {
      // Example implementation - replace with your SMS provider's status API
      const response = await fetch(`${this.config.apiUrl}/status/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      const result = await response.json();
      return result.status || 'UNKNOWN';
    } catch (error) {
      console.error('Failed to get delivery status:', error);
      return 'UNKNOWN';
    }
  }

  /**
   * Update delivery status in database
   */
  async updateDeliveryStatus(externalId: string, status: string) {
    try {
      await prisma.communicationLog.updateMany({
        where: { externalId },
        data: { 
          status,
          deliveredAt: status === 'DELIVERED' ? new Date() : undefined
        }
      });
    } catch (error) {
      console.error('Failed to update delivery status:', error);
    }
  }
}

// Factory function to create SMS service with environment config
export function createSMSService(): SMSApiService {
  const config: SMSApiConfig = {
    apiKey: process.env.SMS_API_KEY || '',
    apiUrl: process.env.SMS_API_URL || '',
    sender: process.env.SMS_SENDER_NAME || 'EnergyGuru'
  };

  if (!config.apiKey) {
    throw new Error('SMS_API_KEY environment variable is required');
  }

  return new SMSApiService(config);
}