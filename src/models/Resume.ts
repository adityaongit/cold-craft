import mongoose, { Schema, Document, Model } from 'mongoose';

// Resume Version subdocument
const ResumeVersionSchema = new Schema({
  version: { type: Number, required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  notes: String,
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

type IResume = Document & {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  currentVersionId?: mongoose.Types.ObjectId;
  isDefault: boolean;
  userId: mongoose.Types.ObjectId;
  versions: Array<{
    _id: mongoose.Types.ObjectId;
    version: number;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    notes?: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
  // Virtuals
  currentVersion?: any;
  latestVersion?: number;
  // Methods
  addVersion(versionData: {
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    notes?: string;
  }): Promise<IResume>;
  setCurrentVersion(versionId: mongoose.Types.ObjectId): Promise<IResume>;
};

export type { IResume };

const ResumeSchema = new Schema<IResume>({
  name: { type: String, required: true },
  description: String,
  currentVersionId: {
    type: Schema.Types.ObjectId,
    validate: {
      validator: function(v: mongoose.Types.ObjectId) {
        // Validate that currentVersionId exists in versions array
        return !v || this.versions.some((ver: any) => ver._id.equals(v));
      },
      message: 'Current version must exist in versions array'
    }
  },
  isDefault: { type: Boolean, default: false },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  versions: [ResumeVersionSchema]
}, {
  timestamps: true,
  collection: 'resumes',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
ResumeSchema.index({ userId: 1, isDefault: 1 });
ResumeSchema.index({ userId: 1, createdAt: -1 });

// Virtual: Current version details
ResumeSchema.virtual('currentVersion').get(function() {
  if (!this.currentVersionId) return null;
  return this.versions.find(v => v._id.equals(this.currentVersionId!));
});

// Virtual: Latest version number
ResumeSchema.virtual('latestVersion').get(function() {
  if (this.versions.length === 0) return 0;
  return Math.max(...this.versions.map(v => v.version));
});

// Methods
ResumeSchema.methods.addVersion = function(versionData: {
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  notes?: string;
}) {
  const newVersion = {
    version: this.latestVersion + 1,
    ...versionData,
    createdAt: new Date()
  };

  this.versions.push(newVersion);

  // Auto-set as current version if first version or explicitly requested
  if (this.versions.length === 1) {
    this.currentVersionId = this.versions[0]._id;
  }

  return this.save();
};

ResumeSchema.methods.setCurrentVersion = function(versionId: mongoose.Types.ObjectId) {
  const version = this.versions.find((v: any) => v._id.equals(versionId));
  if (!version) {
    throw new Error('Version not found');
  }
  this.currentVersionId = versionId;
  return this.save();
};

// Pre-save: Ensure only one default resume per user
ResumeSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await this.model('Resume').updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

export const Resume: Model<IResume> = (mongoose.models?.Resume as Model<IResume>) || mongoose.model<IResume>('Resume', ResumeSchema);
