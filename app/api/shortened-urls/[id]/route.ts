import { NextRequest, NextResponse } from 'next/server';
import { connectDB, ShortenedUrl, Template } from '@/lib/mongoose';
import { auth } from '@/lib/auth';
import mongoose from 'mongoose';

// GET /api/shortened-urls/[id] - Get a single shortened URL
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = new mongoose.Types.ObjectId(session.user.id);
    const urlId = new mongoose.Types.ObjectId(id);

    // Find URL and verify ownership
    const url = await ShortenedUrl.findOne({
      _id: urlId,
      userId: userId
    }).lean();

    if (!url) {
      return NextResponse.json(
        { error: 'Shortened URL not found or unauthorized' },
        { status: 404 }
      );
    }

    // Populate template title if templateId exists
    let templateTitle = null;
    if (url.templateId) {
      const template = await Template.findById(url.templateId).select('title').lean();
      templateTitle = template?.title || null;
    }

    return NextResponse.json({
      ...url,
      id: url._id.toString(),
      _id: url._id.toString(),
      userId: url.userId.toString(),
      templateId: url.templateId?.toString() || null,
      templateTitle,
    });
  } catch (error) {
    console.error('Error fetching shortened URL:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shortened URL' },
      { status: 500 }
    );
  }
}

// DELETE /api/shortened-urls/[id] - Delete a shortened URL
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = new mongoose.Types.ObjectId(session.user.id);
    const urlId = new mongoose.Types.ObjectId(id);

    // Delete only if owned by user
    const result = await ShortenedUrl.findOneAndDelete({
      _id: urlId,
      userId: userId
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Shortened URL not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shortened URL:', error);
    return NextResponse.json(
      { error: 'Failed to delete shortened URL' },
      { status: 500 }
    );
  }
}
