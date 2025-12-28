import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for usage tracking
const createUsageSchema = z.object({
  templateId: z.string(),
  resumeId: z.string().optional(),
  variableValues: z.record(z.string(), z.string()),
  platform: z.enum(['LINKEDIN', 'GMAIL', 'TWITTER', 'COLD_EMAIL', 'OTHER']),
  recipientName: z.string().optional(),
  companyName: z.string().optional(),
  notes: z.string().optional(),
});

// POST /api/usage - Track template usage
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createUsageSchema.parse(body);

    // Create usage history entry
    const usage = await prisma.usageHistory.create({
      data: {
        templateId: validatedData.templateId,
        resumeId: validatedData.resumeId,
        variableValues: validatedData.variableValues,
        platform: validatedData.platform,
        recipientName: validatedData.recipientName,
        companyName: validatedData.companyName,
        notes: validatedData.notes,
      },
      include: {
        template: true,
        resume: {
          include: {
            currentVersion: true,
          },
        },
      },
    });

    // Update template usage count and last used date
    await prisma.template.update({
      where: { id: validatedData.templateId },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    return NextResponse.json(usage, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error tracking usage:', error);
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    );
  }
}

// GET /api/usage/stats - Get usage statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Total messages in period
    const total = await prisma.usageHistory.count({
      where: {
        createdAt: { gte: startDate },
      },
    });

    // This week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const thisWeek = await prisma.usageHistory.count({
      where: {
        createdAt: { gte: weekStart },
      },
    });

    // This month
    const monthStart = new Date();
    monthStart.setDate(monthStart.getDate() - 30);
    const thisMonth = await prisma.usageHistory.count({
      where: {
        createdAt: { gte: monthStart },
      },
    });

    // Top templates
    const topTemplates = await prisma.template.findMany({
      where: {
        usageHistory: {
          some: {
            createdAt: { gte: startDate },
          },
        },
      },
      take: 5,
      orderBy: {
        usageCount: 'desc',
      },
      select: {
        id: true,
        title: true,
        platform: true,
        usageCount: true,
        _count: {
          select: {
            usageHistory: {
              where: {
                createdAt: { gte: startDate },
              },
            },
          },
        },
      },
    });

    // Platform breakdown
    const platformBreakdown = await prisma.usageHistory.groupBy({
      by: ['platform'],
      where: {
        createdAt: { gte: startDate },
      },
      _count: {
        platform: true,
      },
    });

    // Success rate (if tracked)
    const successTracked = await prisma.usageHistory.count({
      where: {
        createdAt: { gte: startDate },
        success: { not: null },
      },
    });

    const successCount = await prisma.usageHistory.count({
      where: {
        createdAt: { gte: startDate },
        success: true,
      },
    });

    const successRate = successTracked > 0 ? (successCount / successTracked) * 100 : null;

    return NextResponse.json({
      totalMessages: total,
      thisWeek,
      thisMonth,
      topTemplates: topTemplates.map(t => ({
        template: {
          id: t.id,
          title: t.title,
          platform: t.platform,
        },
        count: t._count.usageHistory,
      })),
      platformBreakdown: platformBreakdown.map(p => ({
        platform: p.platform,
        count: p._count.platform,
      })),
      successRate,
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    );
  }
}
