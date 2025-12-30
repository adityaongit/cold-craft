import { NextRequest, NextResponse } from 'next/server';
import { connectDB, ShortenedUrl } from '@/lib/mongoose';
import { auth } from '@/lib/auth';
import mongoose from 'mongoose';

// GET /api/shortened-urls - List all shortened URLs for user
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'recent';

    const skip = (page - 1) * limit;
    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Build sort query
    let sort: any = { createdAt: -1 }; // Default: most recent
    if (sortBy === 'mostUsed') {
      sort = { usageCount: -1, createdAt: -1 };
    } else if (sortBy === 'alphabetical') {
      sort = { originalUrl: 1 };
    }

    // Fetch shortened URLs with pagination
    const [urls, total] = await Promise.all([
      ShortenedUrl.find({ userId })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('templateId', 'title')
        .lean(),
      ShortenedUrl.countDocuments({ userId })
    ]);

    // Format response
    const formattedUrls = urls.map((url: any) => ({
      ...url,
      id: url._id.toString(),
      templateTitle: url.templateId?.title || null,
      templateId: url.templateId?._id ? url.templateId._id.toString() : null,
    }));

    return NextResponse.json({
      data: formattedUrls,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching shortened URLs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shortened URLs' },
      { status: 500 }
    );
  }
}
