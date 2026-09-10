import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  limit: z.string().optional().default('20'),
  offset: z.string().optional().default('0'),
  customerId: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams);
    const query = querySchema.parse(params);

    const limit = parseInt(query.limit);
    const offset = parseInt(query.offset);

    // Build where clause
    const where: any = {
      channel: 'SMS'
    };

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.communicationLog.findMany({
        where,
        include: {
          customer: {
            select: {
              customerCode: true,
              fullName: true,
              contactNumber: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.communicationLog.count({ where })
    ]);

    // Get statistics
    const stats = await prisma.communicationLog.groupBy({
      by: ['status'],
      where: {
        ...where,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      _count: true
    });

    const statistics = {
      last24Hours: stats.reduce((acc, stat) => {
        acc[stat.status.toLowerCase()] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      total,
      totalSent: stats.reduce((sum, stat) => sum + stat._count, 0)
    };

    return NextResponse.json({
      logs: logs.map(log => ({
        id: log.id,
        customerId: log.customerId,
        customerCode: log.customer.customerCode,
        customerName: log.customer.fullName,
        recipient: log.recipient,
        type: log.type,
        messageBody: log.messageBody,
        status: log.status,
        externalId: log.externalId,
        errorDetails: log.errorDetails,
        sentAt: log.sentAt,
        deliveredAt: log.deliveredAt,
        createdAt: log.createdAt
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      statistics
    });

  } catch (error) {
    console.error('SMS logs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SMS logs' },
      { status: 500 }
    );
  }
}