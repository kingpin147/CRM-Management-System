import { NextRequest, NextResponse } from 'next/server';
import { SMSHooks } from '@/lib/sms-hooks';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Also allow direct CRON_SECRET query or header match
      const secretQuery = request.nextUrl.searchParams.get('secret');
      if (secretQuery !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const force = request.nextUrl.searchParams.get('force') === 'true';
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday
    const dayOfMonth = now.getDate(); // 1st is monthly

    const isSunday = dayOfWeek === 0;
    const isFirstOfMonth = dayOfMonth === 1;

    // Automatic Client Requirement: "weekly and monthly only"
    if (!force && !isSunday && !isFirstOfMonth) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: 'Solar reports scheduled for weekly (Sundays) and monthly (1st of month) only. Daily send skipped.',
        nextScheduledRun: isSunday ? 'Today (Weekly)' : isFirstOfMonth ? 'Today (Monthly)' : 'Upcoming Sunday / 1st of Month'
      });
    }

    const reportType = isFirstOfMonth ? 'Monthly Performance Summary' : 'Weekly Solar Performance';
    console.log(`Starting ${reportType} report dispatch...`);
    const result = await SMSHooks.sendDailySolarReports();
    
    return NextResponse.json({
      success: true,
      reportType,
      message: `${reportType} processed: ${result.sent} sent, ${result.failed} failed`,
      sent: result.sent,
      failed: result.failed,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cron job error (solar reports):', error);
    return NextResponse.json(
      { error: 'Failed to process solar reports' },
      { status: 500 }
    );
  }
}