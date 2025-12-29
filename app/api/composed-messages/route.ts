import { NextRequest, NextResponse } from 'next/server';
import { connectDB, ComposedMessage } from '@/lib/mongoose';
import { auth } from '@/lib/auth';
import mongoose from 'mongoose';

// GET /api/composed-messages - List all composed messages
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messages = await ComposedMessage.find({
      userId: new mongoose.Types.ObjectId(session.user.id)
    })
      .populate('templateId', 'title')
      .sort({ createdAt: -1 })
      .lean();

    const messagesResponse = messages.map((msg: any) => ({
      ...msg,
      id: msg._id.toString(),
      templateId: msg.templateId?._id ? msg.templateId._id.toString() : null,
      templateTitle: msg.templateId?.title || null
    }));

    return NextResponse.json(messagesResponse);
  } catch (error) {
    console.error('Error fetching composed messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch composed messages' },
      { status: 500 }
    );
  }
}

// POST /api/composed-messages - Create a new composed message
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, templateId, variableValues } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const message = await ComposedMessage.create({
      userId: new mongoose.Types.ObjectId(session.user.id),
      templateId: templateId ? new mongoose.Types.ObjectId(templateId) : null,
      title,
      content,
      variableValues: variableValues || {}
    });

    return NextResponse.json({
      ...message.toObject(),
      id: message._id.toString()
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating composed message:', error);
    return NextResponse.json(
      { error: 'Failed to create composed message' },
      { status: 500 }
    );
  }
}
