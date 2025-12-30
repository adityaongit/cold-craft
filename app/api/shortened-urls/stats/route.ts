import { NextRequest, NextResponse } from 'next/server';
import { connectDB, ShortenedUrl } from '@/lib/mongoose';
import { auth } from '@/lib/auth';
import mongoose from 'mongoose';

// GET /api/shortened-urls/stats - Get statistics
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Calculate stats
    const [totalUrls, urlsWithCounts, mostUsedUrl, recentUrls] = await Promise.all([
      // Total count
      ShortenedUrl.countDocuments({ userId }),

      // Get all URLs to calculate total clicks
      ShortenedUrl.find({ userId }).select('usageCount').lean(),

      // Most used URL
      ShortenedUrl.findOne({ userId })
        .sort({ usageCount: -1 })
        .select('originalUrl shortenedUrl usageCount')
        .lean(),

      // Recent count (last 7 days)
      ShortenedUrl.countDocuments({
        userId,
        createdAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      })
    ]);

    // Calculate total clicks
    const totalClicks = urlsWithCounts.reduce((sum: number, url: any) => sum + (url.usageCount || 0), 0);

    return NextResponse.json({
      totalUrls,
      totalClicks,
      recentCount: recentUrls,
      mostUsedUrl: mostUsedUrl ? {
        originalUrl: mostUsedUrl.originalUrl,
        shortenedUrl: mostUsedUrl.shortenedUrl,
        usageCount: mostUsedUrl.usageCount
      } : null
    });
  } catch (error) {
    console.error('Error fetching shortened URL stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
