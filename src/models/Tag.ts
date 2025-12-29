import mongoose, { Schema, Document, Model } from 'mongoose';

type ITag = Document & {
  _id: mongoose.Types.ObjectId;
  name: string;
  color: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  templateCount?: number;
};

export type { ITag };

const TagSchema = new Schema<ITag>({
  name: { type: String, required: true },
  color: { type: String, default: '#8B5CF6' },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'tags',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
TagSchema.index({ userId: 1, name: 1 }, { unique: true });

// Virtual: Template count
TagSchema.virtual('templateCount', {
  ref: 'Template',
  localField: '_id',
  foreignField: 'tagIds',
  count: true
});

export const Tag: Model<ITag> = (mongoose.models?.Tag as Model<ITag>) || mongoose.model<ITag>('Tag', TagSchema);
