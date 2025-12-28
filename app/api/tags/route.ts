import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for tag creation
const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').default('#8B5CF6'),
});

// GET /api/tags - List all tags
export async function GET(request: NextRequest) {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { templates: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(tags);
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
    const body = await request.json();
    const validatedData = createTagSchema.parse(body);

    const tag = await prisma.tag.create({
      data: {
        name: validatedData.name,
        color: validatedData.color,
      },
    });

    return NextResponse.json(tag, { status: 201 });
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
