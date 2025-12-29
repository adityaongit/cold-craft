import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// Validation schema for usage tracking
const createUsageSchema = z.object({
  templateId: z.string(),
  resumeId: z.string().optional(),
  variableValues: z.record(z.string(), z.string()),
  platform: z.enum(['LINKEDIN', 'GMAIL', 'TWITTER', 'COLD_EMAIL', 'OTHER']),
  recipientName: z.string().optional(),
  companyName: z.string().optional(),
  notes: z.string().optional(),
});

// POST /api/usage - Track template usage
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createUsageSchema.parse(body);

    // Verify template belongs to user
    const template = await prisma.template.findFirst({
      where: {
        id: validatedData.templateId,
        userId: session.user.id,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found or access denied' },
        { status: 404 }
      );
    }

    // Create usage history entry
    const usage = await prisma.usageHistory.create({
      data: {
        templateId: validatedData.templateId,
        resumeId: validatedData.resumeId,
        variableValues: validatedData.variableValues,
        platform: validatedData.platform,
        recipientName: validatedData.recipientName,
        companyName: validatedData.companyName,
        notes: validatedData.notes,
      },
      include: {
        template: true,
        resume: {
          include: {
            currentVersion: true,
          },
        },
      },
    });

    // Update template usage count and last used date
    await prisma.template.update({
      where: { id: validatedData.templateId },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    return NextResponse.json(usage, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error tracking usage:', error);
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    );
  }
}
