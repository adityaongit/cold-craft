import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { z } from 'zod';

// Validation schema for category update
const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().optional(),
  order: z.number().optional(),
});

// GET /api/categories/[id] - Get a single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        templates: {
          where: { isArchived: false },
          include: {
            tags: true,
            _count: {
              select: { usageHistory: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
        children: {
          include: {
            _count: {
              select: { templates: true },
            },
          },
          orderBy: { order: 'asc' },
        },
        parent: true,
        _count: {
          select: { templates: true, children: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateCategorySchema.parse(body);

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // If name is updated, regenerate slug and check uniqueness
    let slug = existingCategory.slug;
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      slug = slugify(validatedData.name);

      const slugExists = await prisma.category.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'A category with this name already exists' },
          { status: 409 }
        );
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name, slug }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.color && { color: validatedData.color }),
        ...(validatedData.icon && { icon: validatedData.icon }),
        ...(validatedData.order !== undefined && { order: validatedData.order }),
      },
      include: {
        _count: {
          select: { templates: true, children: true },
        },
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if category has children
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        _count: {
          select: { templates: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    if (category.children.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with subcategories. Delete or move subcategories first.' },
        { status: 400 }
      );
    }

    // Disconnect templates before deleting
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
