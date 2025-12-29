import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Tag, Template } from '@/lib/mongoose';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import mongoose from 'mongoose';

// Validation schema for tag creation
const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').default('#8B5CF6'),
});

// GET /api/tags - List all tags
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tags = await Tag.find({
      userId: new mongoose.Types.ObjectId(session.user.id)
    })
      .sort({ name: 1 })
      .lean();

    // Add template counts
    const tagsWithCounts = await Promise.all(
      tags.map(async (tag: any) => {
        const templateCount = await Template.countDocuments({
          tagIds: tag._id
        });

        return {
          ...tag,
          id: tag._id.toString(),
          _count: {
            templates: templateCount
          }
        };
      })
    );

    return NextResponse.json(tagsWithCounts);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

// POST /api/tags - Create a new tag
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTagSchema.parse(body);

    // Check if tag with this name already exists
    const existingTag = await Tag.findOne({
      userId: new mongoose.Types.ObjectId(session.user.id),
      name: validatedData.name
    });

    if (existingTag) {
      return NextResponse.json(
        { error: 'A tag with this name already exists' },
        { status: 409 }
      );
    }

    const tag = await Tag.create({
      name: validatedData.name,
      color: validatedData.color,
      userId: new mongoose.Types.ObjectId(session.user.id)
    });

    const tagResponse = {
      ...tag.toObject(),
      id: tag._id.toString(),
      _count: {
        templates: 0
      }
    };

    return NextResponse.json(tagResponse, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}
