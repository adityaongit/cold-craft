import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// GET /api/usage/stats - Get usage statistics for authenticated user
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Total messages in period for this user
    const total = await prisma.usageHistory.count({
      where: {
        template: {
          userId: session.user.id,
        },
        createdAt: { gte: startDate },
      },
    });

    // This week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const thisWeek = await prisma.usageHistory.count({
      where: {
        template: {
          userId: session.user.id,
        },
        createdAt: { gte: weekStart },
      },
    });

    // This month
    const monthStart = new Date();
    monthStart.setDate(monthStart.getDate() - 30);
    const thisMonth = await prisma.usageHistory.count({
      where: {
        template: {
          userId: session.user.id,
        },
        createdAt: { gte: monthStart },
      },
    });

    // Top templates for this user
    const topTemplates = await prisma.template.findMany({
      where: {
        userId: session.user.id,
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

    // Platform breakdown for this user
    const platformBreakdown = await prisma.usageHistory.groupBy({
      by: ['platform'],
      where: {
        template: {
          userId: session.user.id,
        },
        createdAt: { gte: startDate },
      },
      _count: {
        platform: true,
      },
    });

    // Success rate (if tracked) for this user
    const successTracked = await prisma.usageHistory.count({
      where: {
        template: {
          userId: session.user.id,
        },
        createdAt: { gte: startDate },
        success: { not: null },
      },
    });

    const successCount = await prisma.usageHistory.count({
      where: {
        template: {
          userId: session.user.id,
        },
        createdAt: { gte: startDate },
        success: true,
      },
    });

    const successRate = successTracked > 0 ? (successCount / successTracked) * 100 : null;

    const response = NextResponse.json({
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

    // Cache for 2 minutes in browser, revalidate in background
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');

    return response;
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage statistics' },
      { status: 500 }
    );
  }
}
