import { NextRequest, NextResponse } from 'next/server';
import { connectDB, UsageHistory } from '@/lib/mongoose';
import { auth } from '@/lib/auth';
import mongoose from 'mongoose';

// GET /api/usage/stats - Get usage statistics for authenticated user
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days

    // Use the optimized getUserStats method - replaces 7 queries with 1 aggregation!
    const stats = await UsageHistory.getUserStats(
      new mongoose.Types.ObjectId(session.user.id),
      parseInt(period)
    );

    const response = NextResponse.json(stats);

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
