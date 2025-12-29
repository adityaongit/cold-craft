import mongoose, { Schema, Document, Model } from 'mongoose';

type ICategory = Document & {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  parentId?: mongoose.Types.ObjectId;
  order: number;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  // Virtuals
  children?: ICategory[];
  templateCount?: number;
};

export type { ICategory };

interface ICategoryModel extends Model<ICategory> {
  getCategoryTree(userId: mongoose.Types.ObjectId, includeArchived?: boolean): Promise<any[]>;
}

const CategorySchema = new Schema<ICategory, ICategoryModel>({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: String,
  icon: { type: String, default: 'LinkedIn' },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
    index: true
  },
  order: { type: Number, default: 0 },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  collection: 'categories',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound Indexes
CategorySchema.index({ userId: 1, name: 1 }, { unique: true });
CategorySchema.index({ userId: 1, slug: 1 }, { unique: true });
CategorySchema.index({ userId: 1, parentId: 1, order: 1 });
CategorySchema.index({ userId: 1, parentId: 1 }); // For hierarchical queries

// Virtual: Children (populated manually or via aggregation)
CategorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId'
});

// Virtual: Template count (populated via aggregation)
CategorySchema.virtual('templateCount', {
  ref: 'Template',
  localField: '_id',
  foreignField: 'categoryIds',
  count: true
});

// Static method: Get category tree
CategorySchema.statics.getCategoryTree = async function(userId: mongoose.Types.ObjectId, includeArchived = false) {
  const categories = await this.aggregate([
    {
      $match: { userId: new mongoose.Types.ObjectId(userId), parentId: null }
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: 'parentId',
        as: 'children'
      }
    },
    {
      $lookup: {
        from: 'templates',
        let: { categoryId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ['$$categoryId', '$categoryIds'] },
                  ...(includeArchived ? [] : [{ $eq: ['$isArchived', false] }])
                ]
              }
            }
          },
          { $count: 'count' }
        ],
        as: 'templateCount'
      }
    },
    {
      $addFields: {
        templateCount: { $ifNull: [{ $arrayElemAt: ['$templateCount.count', 0] }, 0] }
      }
    },
    { $sort: { order: 1 } }
  ]);

  // Recursively get children counts
  for (const category of categories) {
    if (category.children && category.children.length > 0) {
      for (const child of category.children) {
        const childTemplateCount = await mongoose.model('Template').countDocuments({
          categoryIds: child._id,
          ...(includeArchived ? {} : { isArchived: false })
        });
        child.templateCount = childTemplateCount;
      }
      category.children.sort((a: any, b: any) => a.order - b.order);
    }
  }

  return categories;
};

// Pre-save: Validate parent doesn't create circular reference
CategorySchema.pre('save', async function(next) {
  if (this.parentId && this.isModified('parentId')) {
    let currentParentId: mongoose.Types.ObjectId | undefined = this.parentId;
    const visitedIds = new Set([this._id.toString()]);

    while (currentParentId) {
      if (visitedIds.has(currentParentId.toString())) {
        throw new Error('Circular category reference detected');
      }
      visitedIds.add(currentParentId.toString());

      const parent: ICategory | null = await mongoose.model<ICategory>('Category').findById(currentParentId);
      if (!parent) break;
      currentParentId = parent.parentId;
    }
  }
  next();
});

export const Category: ICategoryModel = (mongoose.models?.Category as ICategoryModel) || mongoose.model<ICategory, ICategoryModel>('Category', CategorySchema);
