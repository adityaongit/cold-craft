import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractVariables } from '@/lib/utils';
import { z } from 'zod';

// Validation schema for template creation
const createTemplateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  description: z.string().optional(),
  platform: z.enum(['LINKEDIN', 'GMAIL', 'TWITTER', 'COLD_EMAIL', 'OTHER']).default('OTHER'),
  tone: z.enum(['PROFESSIONAL', 'CASUAL', 'FRIENDLY', 'FORMAL', 'ENTHUSIASTIC']).default('PROFESSIONAL'),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
});

// GET /api/templates - List templates with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const platform = searchParams.get('platform');
    const tone = searchParams.get('tone');
    const categoryId = searchParams.get('categoryId');
    const tagId = searchParams.get('tagId');
    const isFavorite = searchParams.get('isFavorite') === 'true';
    const isArchived = searchParams.get('isArchived') === 'true';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isArchived,
      ...(isFavorite && { isFavorite: true }),
      ...(platform && { platform }),
      ...(tone && { tone }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && {
        categories: {
          some: {
            id: categoryId,
          },
        },
      }),
      ...(tagId && {
        tags: {
          some: {
            id: tagId,
          },
        },
      }),
    };

    // Get templates with relations
    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        skip,
        take: limit,
        include: {
          categories: true,
          tags: true,
          variables: {
            orderBy: { order: 'asc' },
          },
          _count: {
            select: { usageHistory: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.template.count({ where }),
    ]);

    return NextResponse.json({
      data: templates,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
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
    const body = await request.json();
    const validatedData = createTemplateSchema.parse(body);

    // Extract variables from content
    const variables = extractVariables(validatedData.content);

    // Calculate length
    const wordCount = validatedData.content.trim().split(/\s+/).length;
    let length: 'SHORT' | 'MEDIUM' | 'LONG' = 'MEDIUM';
    if (wordCount < 100) length = 'SHORT';
    else if (wordCount > 250) length = 'LONG';

    // Create template with relations
    const template = await prisma.template.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        description: validatedData.description,
        platform: validatedData.platform,
        tone: validatedData.tone,
        length,
        categories: validatedData.categoryIds
          ? {
              connect: validatedData.categoryIds.map((id) => ({ id })),
            }
          : undefined,
        tags: validatedData.tagIds
          ? {
              connect: validatedData.tagIds.map((id) => ({ id })),
            }
          : undefined,
        variables: {
          create: variables,
        },
      },
      include: {
        categories: true,
        tags: true,
        variables: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json(template, { status: 201 });
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
