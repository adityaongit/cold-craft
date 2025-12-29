import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// Validation schema for category creation
const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').default('#6366F1'),
  icon: z.string().default('folder'),
  parentId: z.string().optional(),
});

// GET /api/categories - List all categories with template counts
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get('includeArchived') === 'true';
    const parentId = searchParams.get('parentId');

    // Build where clause with userId filter
    const where: any = {
      userId: session.user.id,
      ...(parentId === 'null' ? { parentId: null } : parentId ? { parentId } : {}),
    };

    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: {
            templates: {
              where: includeArchived ? {} : { isArchived: false },
            },
            children: true,
          },
        },
        children: {
          include: {
            _count: {
              select: {
                templates: {
                  where: includeArchived ? {} : { isArchived: false },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    const response = NextResponse.json(categories);

    // Cache for 2 minutes in browser, revalidate in background
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');

    return response;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCategorySchema.parse(body);

    // Generate slug from name
    const slug = slugify(validatedData.name);

    // Check if slug already exists for this user
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId: session.user.id,
        slug,
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 409 }
      );
    }

    // Get the highest order value for this user
    const highestOrder = await prisma.category.findFirst({
      where: {
        userId: session.user.id,
        parentId: validatedData.parentId || null,
      },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description,
        color: validatedData.color,
        icon: validatedData.icon,
        parentId: validatedData.parentId,
        userId: session.user.id,
        order: (highestOrder?.order || 0) + 1,
      },
      include: {
        _count: {
          select: { templates: true, children: true },
        },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
