import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for resume update
const updateResumeSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// GET /api/resumes/[id] - Get a single resume
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resume = await prisma.resume.findUnique({
      where: { id },
      include: {
        currentVersion: true,
        versions: {
          orderBy: { version: 'desc' },
        },
        _count: {
          select: {
            versions: true,
            usageHistory: true,
          },
        },
      },
    });

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(resume);
  } catch (error) {
    console.error('Error fetching resume:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resume' },
      { status: 500 }
    );
  }
}

// PUT /api/resumes/[id] - Update a resume
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateResumeSchema.parse(body);

    // If setting as default, unset other defaults
    if (validatedData.isDefault) {
      await prisma.resume.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const resume = await prisma.resume.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.isDefault !== undefined && { isDefault: validatedData.isDefault }),
      },
      include: {
        currentVersion: true,
        _count: {
          select: { versions: true },
        },
      },
    });

    return NextResponse.json(resume);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating resume:', error);
    return NextResponse.json(
      { error: 'Failed to update resume' },
      { status: 500 }
    );
  }
}

// DELETE /api/resumes/[id] - Delete a resume
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.resume.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }
    console.error('Error deleting resume:', error);
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    );
  }
}
