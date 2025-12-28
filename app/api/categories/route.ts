import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
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
    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get('includeArchived') === 'true';
    const parentId = searchParams.get('parentId');

    // Build where clause
    const where: any = {
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

    return NextResponse.json(categories);
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
    const body = await request.json();
    const validatedData = createCategorySchema.parse(body);

    // Generate slug from name
    const slug = slugify(validatedData.name);

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 409 }
      );
    }

    // Get the highest order value
    const highestOrder = await prisma.category.findFirst({
      where: { parentId: validatedData.parentId || null },
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
