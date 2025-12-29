import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Template, UsageHistory } from '@/lib/mongoose';
import { auth } from '@/lib/auth';
import mongoose from 'mongoose';

// POST /api/usage - Track template usage
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const usage = await UsageHistory.create({
      templateId: new mongoose.Types.ObjectId(body.templateId),
      userId: new mongoose.Types.ObjectId(session.user.id),
      resumeId: body.resumeId ? new mongoose.Types.ObjectId(body.resumeId) : undefined,
      variableValues: body.variableValues || {},
      recipientName: body.recipientName,
      companyName: body.companyName,
      success: body.success,
      notes: body.notes
    });

    // Note: Template usageCount is auto-incremented by UsageHistory post-save hook

    return NextResponse.json({
      ...usage.toObject(),
      id: usage._id.toString()
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating usage record:', error);
    return NextResponse.json(
      { error: 'Failed to create usage record' },
      { status: 500 }
    );
  }
}
