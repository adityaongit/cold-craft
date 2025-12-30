import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Template, UsageHistory } from '@/lib/mongoose';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import mongoose from 'mongoose';

// Disable caching for templates - always fetch fresh
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Validation schema for template update
const updateTemplateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  description: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

// GET /api/templates/[id] - Get a single template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const template = await Template.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(session.user.id)
    })
      .populate('categoryIds', 'name slug icon')
      .populate('tagIds', 'name color')
      .lean();

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Get recent usage history
    const usageHistory = await UsageHistory.find({
      templateId: template._id
    })
      .populate('resumeId', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get total usage count
    const usageHistoryCount = await UsageHistory.countDocuments({
      templateId: template._id
    });

    const templateResponse = {
      ...template,
      id: template._id.toString(),
      categories: template.categoryIds || [],
      tags: template.tagIds || [],
      usageHistory: usageHistory.map((usage: any) => ({
        ...usage,
        id: usage._id.toString(),
        resume: usage.resumeId
      })),
      usageHistoryCount,
      _count: {
        usageHistory: usageHistoryCount
      }
    };

    return NextResponse.json(templateResponse);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// PUT /api/templates/[id] - Update a template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateTemplateSchema.parse(body);

    // Check if template exists and belongs to user
    const existingTemplate = await Template.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(session.user.id)
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Update template fields
    if (validatedData.title) existingTemplate.title = validatedData.title;
    if (validatedData.content) existingTemplate.content = validatedData.content;
    if (validatedData.description !== undefined) existingTemplate.description = validatedData.description;
    if (validatedData.isFavorite !== undefined) existingTemplate.isFavorite = validatedData.isFavorite;
    if (validatedData.isArchived !== undefined) existingTemplate.isArchived = validatedData.isArchived;

    if (validatedData.categoryIds) {
      existingTemplate.categoryIds = validatedData.categoryIds.map(id => new mongoose.Types.ObjectId(id));
    }

    if (validatedData.tagIds) {
      existingTemplate.tagIds = validatedData.tagIds.map(id => new mongoose.Types.ObjectId(id));
    }

    // Note: Variables will be re-extracted automatically by the pre-save hook if content changed
    await existingTemplate.save();

    // Populate relations
    await existingTemplate.populate([
      { path: 'categoryIds', select: 'name slug icon' },
      { path: 'tagIds', select: 'name color' }
    ]);

    const templateResponse = {
      ...existingTemplate.toObject(),
      id: existingTemplate._id.toString(),
      categories: existingTemplate.categoryIds,
      tags: existingTemplate.tagIds
    };

    return NextResponse.json(templateResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/[id] - Delete a template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify template belongs to user before deleting
    const template = await Template.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(session.user.id)
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    await Template.deleteOne({ _id: template._id });

    // Note: UsageHistory records are kept for analytics
    // If you want to delete them too, uncomment:
    // await UsageHistory.deleteMany({ templateId: template._id });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
