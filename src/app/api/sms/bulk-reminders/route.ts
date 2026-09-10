import { NextResponse } from 'next/server';
import { notificationService } from '@/lib/notification-service';

export async function POST() {
  try {
    const result = await notificationService.sendBulkOverdueReminders();
    
    return NextResponse.json({
      success: true,
      message: `Sent ${result.sent} reminders, ${result.failed} failed`,
      sent: result.sent,
      failed: result.failed
    });
  } catch (error) {
    console.error('Bulk reminder error:', error);
    return NextResponse.json(
      { error: 'Failed to send bulk reminders' },
      { status: 500 }
    );
  }
}