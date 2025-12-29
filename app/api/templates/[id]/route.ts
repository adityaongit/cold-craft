import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractVariables } from '@/lib/utils';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// Validation schema for template update
const updateTemplateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  description: z.string().optional(),
  platform: z.enum(['LINKEDIN', 'GMAIL', 'TWITTER', 'COLD_EMAIL', 'OTHER']).optional(),
  tone: z.enum(['PROFESSIONAL', 'CASUAL', 'FRIENDLY', 'FORMAL', 'ENTHUSIASTIC']).optional(),
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
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const template = await prisma.template.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        categories: true,
        tags: true,
        variables: {
          orderBy: { order: 'asc' },
        },
        usageHistory: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            resume: true,
          },
        },
        _count: {
          select: { usageHistory: true },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
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
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateTemplateSchema.parse(body);

    // Check if template exists and belongs to user
    const existingTemplate = await prisma.template.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: { variables: true },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // If content is updated, re-extract variables
    let variableUpdates = undefined;
    let length = existingTemplate.length;

    if (validatedData.content) {
      const newVariables = extractVariables(validatedData.content);

      // Calculate new length
      const wordCount = validatedData.content.trim().split(/\s+/).length;
      if (wordCount < 100) length = 'SHORT';
      else if (wordCount > 250) length = 'LONG';
      else length = 'MEDIUM';

      // Delete old variables and create new ones
      variableUpdates = {
        deleteMany: {},
        create: newVariables,
      };
    }

    // Update template
    const template = await prisma.template.update({
      where: { id },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.content && { content: validatedData.content, length }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.platform && { platform: validatedData.platform }),
        ...(validatedData.tone && { tone: validatedData.tone }),
        ...(validatedData.isFavorite !== undefined && { isFavorite: validatedData.isFavorite }),
        ...(validatedData.isArchived !== undefined && { isArchived: validatedData.isArchived }),
        ...(validatedData.categoryIds && {
          categories: {
            set: [],
            connect: validatedData.categoryIds.map((id) => ({ id })),
          },
        }),
        ...(validatedData.tagIds && {
          tags: {
            set: [],
            connect: validatedData.tagIds.map((id) => ({ id })),
          },
        }),
        ...(variableUpdates && { variables: variableUpdates }),
      },
      include: {
        categories: true,
        tags: true,
        variables: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return NextResponse.json(template);
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
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify template belongs to user before deleting
    const template = await prisma.template.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    await prisma.template.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
