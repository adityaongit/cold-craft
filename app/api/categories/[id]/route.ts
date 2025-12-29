import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Category, Template } from '@/lib/mongoose';
import { auth } from '@/lib/auth';
import mongoose from 'mongoose';

// GET /api/categories/[id] - Get category with templates
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const category = await Category.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(session.user.id)
    }).lean();

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Get templates in this category
    const templates = await Template.find({
      categoryIds: category._id,
      userId: new mongoose.Types.ObjectId(session.user.id),
      isArchived: false
    })
      .populate('tagIds', 'name color')
      .sort({ updatedAt: -1 })
      .lean();

    const categoryResponse = {
      ...category,
      id: category._id.toString(),
      templates: templates.map((t: any) => ({
        ...t,
        id: t._id.toString(),
        tags: t.tagIds || []
      }))
    };

    return NextResponse.json(categoryResponse);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const category = await Category.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        userId: new mongoose.Types.ObjectId(session.user.id)
      },
      { $set: body },
      { new: true }
    );

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Add template count
    const templateCount = await Template.countDocuments({ categoryIds: category._id });

    return NextResponse.json({
      ...category.toObject(),
      id: category._id.toString(),
      templateCount
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const category = await Category.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(session.user.id)
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
