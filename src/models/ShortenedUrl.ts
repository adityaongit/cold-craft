import mongoose, { Schema, Document, Model } from 'mongoose';

type IShortenedUrl = Document & {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  originalUrl: string;
  shortenedUrl: string;
  templateId?: mongoose.Types.ObjectId;
  variableName?: string;
  usageCount: number;
  metadata?: {
    detectedAt: Date;
    ipAddress?: string;
    userAgent?: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type { IShortenedUrl };

const ShortenedUrlSchema = new Schema<IShortenedUrl>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  originalUrl: {
    type: String,
    required: true,
    index: true
  },
  shortenedUrl: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  templateId: {
    type: Schema.Types.ObjectId,
    ref: 'Template'
  },
  variableName: {
    type: String
  },
  usageCount: {
    type: Number,
    default: 0
  },
  metadata: {
    detectedAt: {
      type: Date,
      default: () => new Date()
    },
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true,
  collection: 'shortenedUrls',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for common queries
ShortenedUrlSchema.index({ userId: 1, createdAt: -1 }); // User's recent shortened URLs
ShortenedUrlSchema.index({ originalUrl: 1, userId: 1 }); // Prevent duplicate shortening (cache lookup)

export const ShortenedUrl: Model<IShortenedUrl> = (mongoose.models?.ShortenedUrl as Model<IShortenedUrl>) || mongoose.model<IShortenedUrl>('ShortenedUrl', ShortenedUrlSchema);
