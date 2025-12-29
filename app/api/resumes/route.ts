import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Resume } from '@/lib/mongoose';
import { auth } from '@/lib/auth';

// GET /api/resumes - List resumes (stub)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // TODO: Implement resume listing with Mongoose
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 });
  }
}

// POST /api/resumes - Create resume (stub)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // TODO: Implement resume creation with Mongoose
    return NextResponse.json({ message: 'Resume creation not yet implemented' }, { status: 501 });
  } catch (error) {
    console.error('Error creating resume:', error);
    return NextResponse.json({ error: 'Failed to create resume' }, { status: 500 });
  }
}
