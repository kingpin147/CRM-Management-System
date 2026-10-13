import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { sendWhatsAppTemplate, formatWhatsAppPhone } from '@/lib/whatsapp';

export const maxDuration = 60; // Allow longer execution for bulk batches

export async function POST(request: NextRequest) {
  try {
    // 1. Role Authorization Check: Only Super Admin, Admin, Sales Manager & CEO
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }

    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { supabaseId: user.id },
          ...(user.email ? [{ email: { equals: user.email, mode: 'insensitive' as const } }] : [])
        ]
      },
      select: { role: true, designation: true, isActive: true }
    });

    const role = (dbUser?.role || '').toUpperCase().trim();
    const designation = (dbUser?.designation || '').toLowerCase().trim();
    const isCEO = designation.includes('ceo') || designation.includes('chief executive');

    const isAuthorized = Boolean(
      dbUser?.isActive && (
        ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'BILLING_MANAGER', 'MANAGER'].includes(role) ||
        isCEO
      )
    );

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden: Only Super Admin, Admin, and Sales Managers can send bulk broadcasts.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      recipients = [],
      templateName = 'solar_promotional_offer',
      headerImage,
      bodyParams = [],
      campaignName = 'Marketing Campaign'
    } = body;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'Recipients array is required and cannot be empty.' }, { status: 400 });
    }

    // Format & deduplicate numbers
    const cleanNumbers: string[] = [];
    const seen = new Set<string>();

    for (const raw of recipients) {
      const formatted = formatWhatsAppPhone(String(raw));
      if (formatted && formatted.length >= 10 && !seen.has(formatted)) {
        seen.add(formatted);
        cleanNumbers.push(formatted);
      }
    }

    if (cleanNumbers.length === 0) {
      return NextResponse.json({ error: 'No valid phone numbers found in the provided list.' }, { status: 400 });
    }

    const results: Array<{ phone: string; status: 'SENT' | 'FAILED'; error?: string; wamid?: string }> = [];
    let sentCount = 0;
    let failedCount = 0;

    // Process with slight pacing (100ms per message to prevent Meta rate limiting)
    for (const phone of cleanNumbers) {
      try {
        const sendResult = await sendWhatsAppTemplate({
          recipientPhone: phone,
          templateName,
          headerImage: headerImage || undefined,
          bodyParams,
          type: 'BROADCAST',
        });

        if (sendResult.success) {
          sentCount++;
          results.push({ phone, status: 'SENT', wamid: sendResult.wamid || undefined });
        } else {
          failedCount++;
          results.push({ phone, status: 'FAILED', error: sendResult.error || 'Failed to dispatch' });
        }
      } catch (err: any) {
        failedCount++;
        results.push({ phone, status: 'FAILED', error: err.message });
      }

      // Small pacing delay
      if (cleanNumbers.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
    }

    return NextResponse.json({
      success: true,
      campaignName,
      totalRequested: recipients.length,
      totalValid: cleanNumbers.length,
      sentCount,
      failedCount,
      results
    });

  } catch (error: any) {
    console.error('Bulk broadcast API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while processing broadcast.' },
      { status: 500 }
    );
  }
}
