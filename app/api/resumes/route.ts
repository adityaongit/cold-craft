import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Validation schema for resume creation
const createResumeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
});

// GET /api/resumes - List all resumes
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resumes = await prisma.resume.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        currentVersion: true,
        _count: {
          select: {
            versions: true,
            usageHistory: true,
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    return NextResponse.json(resumes);
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resumes' },
      { status: 500 }
    );
  }
}

// POST /api/resumes - Create a new resume with file upload
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string | null;
    const isDefault = formData.get('isDefault') === 'true';
    const file = formData.get('file') as File | null;
    const notes = formData.get('notes') as string | null;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF and Word documents are allowed' },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.resume.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create upload directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', 'resumes');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${sanitizedFilename}`;
    const filepath = join(uploadsDir, filename);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Create resume with first version
    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        name,
        description,
        isDefault,
        versions: {
          create: {
            version: 1,
            fileName: file.name,
            filePath: `/uploads/resumes/${filename}`,
            fileSize: file.size,
            mimeType: file.type,
            notes,
          },
        },
      },
      include: {
        versions: true,
      },
    });

    // Set current version
    const firstVersion = resume.versions[0];
    await prisma.resume.update({
      where: { id: resume.id },
      data: { currentVersionId: firstVersion.id },
    });

    // Fetch updated resume
    const updatedResume = await prisma.resume.findUnique({
      where: { id: resume.id },
      include: {
        currentVersion: true,
        _count: {
          select: { versions: true },
        },
      },
    });

    return NextResponse.json(updatedResume, { status: 201 });
  } catch (error) {
    console.error('Error creating resume:', error);
    return NextResponse.json(
      { error: 'Failed to create resume' },
      { status: 500 }
    );
  }
}
