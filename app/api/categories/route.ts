import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Category, Template } from '@/lib/mongoose';
import { slugify } from '@/lib/utils';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import mongoose from 'mongoose';

// Validation schema for category creation
const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  icon: z.string().default('LinkedIn'),
  parentId: z.string().optional(),
});

// GET /api/categories - List all categories with template counts
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get('includeArchived') === 'true';
    const parentId = searchParams.get('parentId');

    // If parentId is specified, get specific level
    if (parentId && parentId !== 'null') {
      const categories = await Category.find({
        userId: new mongoose.Types.ObjectId(session.user.id),
        parentId: new mongoose.Types.ObjectId(parentId)
      })
        .sort({ order: 1 })
        .lean();

      // Add template counts
      const categoriesWithCounts = await Promise.all(
        categories.map(async (cat: any) => {
          const templateCount = await Template.countDocuments({
            categoryIds: cat._id,
            ...(includeArchived ? {} : { isArchived: false })
          });

          const childrenCount = await Category.countDocuments({
            parentId: cat._id
          });

          return {
            ...cat,
            id: cat._id.toString(),
            _count: {
              templates: templateCount,
              children: childrenCount
            }
          };
        })
      );

      const response = NextResponse.json(categoriesWithCounts);
      response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
      return response;
    }

    // Get full category tree using optimized aggregation
    const categoryTree = await Category.getCategoryTree(
      new mongoose.Types.ObjectId(session.user.id),
      includeArchived
    );

    // Transform the response to use 'id' instead of '_id'
    const transformCategory = (cat: any) => ({
      ...cat,
      id: cat._id.toString(),
      children: cat.children?.map(transformCategory) || []
    });

    const transformedCategories = categoryTree.map(transformCategory);

    const response = NextResponse.json(transformedCategories);

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
    await connectDB();

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
    const existingCategory = await Category.findOne({
      userId: new mongoose.Types.ObjectId(session.user.id),
      slug
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 409 }
      );
    }

    // Get the highest order value for this user
    const highestOrderCat = await Category.findOne({
      userId: new mongoose.Types.ObjectId(session.user.id),
      parentId: validatedData.parentId ? new mongoose.Types.ObjectId(validatedData.parentId) : null
    })
      .sort({ order: -1 })
      .select('order')
      .lean();

    const category = await Category.create({
      name: validatedData.name,
      slug,
      description: validatedData.description,
      icon: validatedData.icon,
      parentId: validatedData.parentId ? new mongoose.Types.ObjectId(validatedData.parentId) : null,
      userId: new mongoose.Types.ObjectId(session.user.id),
      order: (highestOrderCat?.order || 0) + 1
    });

    // Add counts
    const templateCount = await Template.countDocuments({ categoryIds: category._id });
    const childrenCount = await Category.countDocuments({ parentId: category._id });

    const categoryResponse = {
      ...category.toObject(),
      id: category._id.toString(),
      _count: {
        templates: templateCount,
        children: childrenCount
      }
    };

    return NextResponse.json(categoryResponse, { status: 201 });
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
