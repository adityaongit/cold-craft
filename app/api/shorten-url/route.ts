import { NextRequest, NextResponse } from 'next/server';
import { connectDB, ShortenedUrl } from '@/lib/mongoose';
import { auth } from '@/lib/auth';
import mongoose from 'mongoose';

// Validate URL format
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// Call TinyURL API to shorten URL (more reliable than is.gd)
async function shortenWithTinyUrl(url: string): Promise<string> {
  const apiUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PitchPad/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`TinyURL API returned status ${response.status}`);
    }

    const shortenedUrl = await response.text();

    // TinyURL returns plain text with the shortened URL
    if (!shortenedUrl || !shortenedUrl.startsWith('http')) {
      throw new Error('Invalid response from URL shortener');
    }

    return shortenedUrl.trim();
  } catch (error: any) {
    console.error('TinyURL API error:', error);
    throw new Error('Failed to shorten URL. Please try again later.');
  }
}

// POST /api/shorten-url - Shorten a URL
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { url, templateId, variableName } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Check cache: Has this user already shortened this URL?
    const existingShortened = await ShortenedUrl.findOne({
      userId,
      originalUrl: url
    }).lean();

    if (existingShortened) {
      // Return cached shortened URL
      return NextResponse.json({
        originalUrl: url,
        shortenedUrl: existingShortened.shortenedUrl,
        cached: true
      });
    }

    // Not cached - call TinyURL API
    let shortenedUrl: string;
    try {
      shortenedUrl = await shortenWithTinyUrl(url);
    } catch (error: any) {
      console.error('URL shortener API error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to shorten URL' },
        { status: 500 }
      );
    }

    // Store in database
    const shortened = await ShortenedUrl.create({
      userId,
      originalUrl: url,
      shortenedUrl,
      templateId: templateId ? new mongoose.Types.ObjectId(templateId) : undefined,
      variableName: variableName || undefined,
      usageCount: 0,
      metadata: {
        detectedAt: new Date(),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined
      }
    });

    return NextResponse.json({
      originalUrl: url,
      shortenedUrl: shortened.shortenedUrl,
      cached: false
    });

  } catch (error) {
    console.error('Error shortening URL:', error);
    return NextResponse.json(
      { error: 'Failed to shorten URL' },
      { status: 500 }
    );
  }
}
