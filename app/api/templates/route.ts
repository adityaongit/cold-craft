import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Template } from '@/lib/mongoose';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import mongoose from 'mongoose';

// Disable caching for templates - always fetch fresh
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Validation schema for template creation
const createTemplateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  description: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
});

// GET /api/templates - List templates with filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');
    const tagId = searchParams.get('tagId');
    const isFavorite = searchParams.get('isFavorite') === 'true';
    const isArchived = searchParams.get('isArchived') === 'true';

    const skip = (page - 1) * limit;

    // Build MongoDB query
    const query: any = {
      userId: new mongoose.Types.ObjectId(session.user.id),
      isArchived,
      ...(isFavorite && { isFavorite: true }),
      ...(categoryId && { categoryIds: new mongoose.Types.ObjectId(categoryId) }),
      ...(tagId && { tagIds: new mongoose.Types.ObjectId(tagId) })
    };

    // Add text search if provided
    if (search) {
      query.$text = { $search: search };
    }

    // Get templates with relations
    const [templates, total] = await Promise.all([
      Template.find(query)
        .populate('categoryIds', 'name slug icon')
        .populate('tagIds', 'name color')
        .skip(skip)
        .limit(limit)
        .sort({ updatedAt: -1 })
        .lean(),
      Template.countDocuments(query)
    ]);

    // Map the populated fields to match frontend expectations
    const templatesWithRelations = templates.map((template: any) => ({
      ...template,
      id: template._id.toString(),
      categories: (template.categoryIds || []).map((cat: any) => ({
        ...cat,
        id: cat._id.toString()
      })),
      tags: (template.tagIds || []).map((tag: any) => ({
        ...tag,
        id: tag._id.toString()
      })),
      // Variables are already embedded
      usageHistoryCount: 0 // Will be calculated if needed
    }));

    const response = NextResponse.json({
      data: templatesWithRelations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

    // Cache for 1 minute in browser, revalidate in background
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=180');

    return response;
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create a new template
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTemplateSchema.parse(body);

    // Create template with Mongoose
    // Note: Variables will be auto-extracted by the pre-save hook
    // Length will be auto-calculated by the pre-save hook
    const template = await Template.create({
      title: validatedData.title,
      content: validatedData.content,
      description: validatedData.description,
      userId: new mongoose.Types.ObjectId(session.user.id),
      categoryIds: validatedData.categoryIds
        ? validatedData.categoryIds.map(id => new mongoose.Types.ObjectId(id))
        : [],
      tagIds: validatedData.tagIds
        ? validatedData.tagIds.map(id => new mongoose.Types.ObjectId(id))
        : []
    });

    // Populate relations before returning
    await template.populate([
      { path: 'categoryIds', select: 'name slug icon' },
      { path: 'tagIds', select: 'name color' }
    ]);

    const templateResponse = {
      ...template.toObject(),
      id: template._id.toString(),
      categories: (template.categoryIds || []).map((cat: any) => ({
        ...cat,
        id: cat._id.toString()
      })),
      tags: (template.tagIds || []).map((tag: any) => ({
        ...tag,
        id: tag._id.toString()
      }))
    };

    return NextResponse.json(templateResponse, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
