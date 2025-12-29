import { NextRequest, NextResponse } from 'next/server';
import { connectDB, ComposedMessage } from '@/lib/mongoose';
import { auth } from '@/lib/auth';
import mongoose from 'mongoose';

// GET /api/composed-messages/[id] - Get a specific composed message
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

    const message = await ComposedMessage.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(session.user.id)
    })
      .populate('templateId', 'title content variables')
      .lean();

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...message,
      id: message._id.toString()
    });
  } catch (error) {
    console.error('Error fetching composed message:', error);
    return NextResponse.json(
      { error: 'Failed to fetch composed message' },
      { status: 500 }
    );
  }
}

// PUT /api/composed-messages/[id] - Update a composed message
export async function PUT(
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
    const body = await request.json();

    const message = await ComposedMessage.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(session.user.id)
      },
      { $set: body },
      { new: true }
    );

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...message.toObject(),
      id: message._id.toString()
    });
  } catch (error) {
    console.error('Error updating composed message:', error);
    return NextResponse.json(
      { error: 'Failed to update composed message' },
      { status: 500 }
    );
  }
}

// DELETE /api/composed-messages/[id] - Delete a composed message
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

    const message = await ComposedMessage.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(session.user.id)
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting composed message:', error);
    return NextResponse.json(
      { error: 'Failed to delete composed message' },
      { status: 500 }
    );
  }
}
