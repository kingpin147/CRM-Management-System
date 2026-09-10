import { NextResponse } from 'next/server';
import { SMSHooks } from '@/lib/sms-hooks';

export async function GET() {
  try {
    // Verify cron job authorization
    const authHeader = process.env.CRON_SECRET;
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting overdue payment reminders...');
    const result = await SMSHooks.sendOverdueReminders();
    
    return NextResponse.json({
      success: true,
      message: `Overdue reminders processed: ${result.sent} sent, ${result.failed} failed`,
      sent: result.sent,
      failed: result.failed,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cron job error (overdue reminders):', error);
    return NextResponse.json(
      { error: 'Failed to process overdue reminders' },
      { status: 500 }
    );
  }
}