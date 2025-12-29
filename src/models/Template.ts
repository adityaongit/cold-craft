import mongoose, { Schema, Document, Model } from 'mongoose';

// Enums
export enum TemplateLength {
  SHORT = 'SHORT',
  MEDIUM = 'MEDIUM',
  LONG = 'LONG'
}

export enum VariableType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  SELECT = 'SELECT',
  DATE = 'DATE',
  URL = 'URL',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  RESUME_SELECT = 'RESUME_SELECT'
}

// Variable subdocument
const VariableSchema = new Schema({
  name: { type: String, required: true },
  displayName: { type: String, required: true },
  description: String,
  defaultValue: String,
  type: {
    type: String,
    enum: Object.values(VariableType),
    default: VariableType.TEXT
  },
  isRequired: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { _id: false });

type ITemplate = Document & {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  description?: string;
  length: TemplateLength;
  usageCount: number;
  lastUsedAt?: Date;
  isFavorite: boolean;
  isArchived: boolean;
  userId: mongoose.Types.ObjectId;
  categoryIds: mongoose.Types.ObjectId[];
  tagIds: mongoose.Types.ObjectId[];
  variables: Array<{
    name: string;
    displayName: string;
    description?: string;
    defaultValue?: string;
    type: VariableType;
    isRequired: boolean;
    order: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
  // Virtuals
  categories?: any[];
  tags?: any[];
  usageHistoryCount?: number;
  // Methods
  incrementUsage(): Promise<ITemplate>;
  extractAndSetVariables(content: string): void;
  inferVariableType(name: string): VariableType;
  nameToDisplayName(name: string): string;
};

export type { ITemplate };

const TemplateSchema = new Schema<ITemplate>({
  title: { type: String, required: true, index: 'text' },
  content: { type: String, required: true, index: 'text' },
  description: { type: String, index: 'text' },
  length: {
    type: String,
    enum: Object.values(TemplateLength),
    default: TemplateLength.MEDIUM
  },
  usageCount: { type: Number, default: 0, index: true },
  lastUsedAt: { type: Date, index: true },
  isFavorite: { type: Boolean, default: false, index: true },
  isArchived: { type: Boolean, default: false, index: true },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  categoryIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Category',
    index: true
  }],
  tagIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Tag',
    index: true
  }],
  variables: [VariableSchema]
}, {
  timestamps: true,
  collection: 'templates',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Text search index for title, description, content
TemplateSchema.index({
  title: 'text',
  description: 'text',
  content: 'text'
}, {
  weights: {
    title: 10,
    description: 5,
    content: 1
  }
});

// Compound indexes for common queries
TemplateSchema.index({ userId: 1, isArchived: 1, updatedAt: -1 });
TemplateSchema.index({ userId: 1, isFavorite: 1, isArchived: 1 });
TemplateSchema.index({ userId: 1, categoryIds: 1, isArchived: 1 });
TemplateSchema.index({ userId: 1, tagIds: 1, isArchived: 1 });
TemplateSchema.index({ userId: 1, usageCount: -1 });

// Virtuals
TemplateSchema.virtual('categories', {
  ref: 'Category',
  localField: 'categoryIds',
  foreignField: '_id'
});

TemplateSchema.virtual('tags', {
  ref: 'Tag',
  localField: 'tagIds',
  foreignField: '_id'
});

TemplateSchema.virtual('usageHistoryCount', {
  ref: 'UsageHistory',
  localField: '_id',
  foreignField: 'templateId',
  count: true
});

// Methods
TemplateSchema.methods.incrementUsage = async function() {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  return this.save();
};

TemplateSchema.methods.extractAndSetVariables = function(content: string) {
  // Use existing extractVariables utility
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const variables = new Map();
  let match;
  let order = 0;

  while ((match = variableRegex.exec(content)) !== null) {
    const fullMatch = match[1].trim();
    let name = fullMatch;
    let description: string | null = null;
    let defaultValue: string | null = null;

    // Parse syntax: {{name:description|default}}
    if (fullMatch.includes(':')) {
      const [namePart, descPart] = fullMatch.split(':');
      name = namePart.trim();
      description = descPart.trim();
    }

    if (name.includes('|')) {
      const [namePart, defaultPart] = name.split('|');
      name = namePart.trim();
      defaultValue = defaultPart.trim();
    }

    if (description && description.includes('|')) {
      const [descPart, defaultPart] = description.split('|');
      description = descPart.trim();
      defaultValue = defaultPart.trim();
    }

    if (!variables.has(name)) {
      variables.set(name, {
        name,
        displayName: this.nameToDisplayName(name),
        description,
        defaultValue,
        type: this.inferVariableType(name),
        isRequired: !defaultValue,
        order: order++
      });
    }
  }

  this.variables = Array.from(variables.values());
};

TemplateSchema.methods.inferVariableType = function(name: string): VariableType {
  const lower = name.toLowerCase();
  if (lower.includes('email')) return VariableType.EMAIL;
  if (lower.includes('phone')) return VariableType.PHONE;
  if (lower.includes('url') || lower.includes('link')) return VariableType.URL;
  if (lower.includes('date')) return VariableType.DATE;
  if (lower.includes('resume')) return VariableType.RESUME_SELECT;
  if (lower.includes('description') || lower.includes('bio')) return VariableType.TEXTAREA;
  return VariableType.TEXT;
};

TemplateSchema.methods.nameToDisplayName = function(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
};

// Pre-save: Auto-extract variables from content
TemplateSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.extractAndSetVariables(this.content);

    // Calculate length
    const wordCount = this.content.trim().split(/\s+/).length;
    if (wordCount < 100) this.length = TemplateLength.SHORT;
    else if (wordCount > 250) this.length = TemplateLength.LONG;
    else this.length = TemplateLength.MEDIUM;
  }
  next();
});

export const Template: Model<ITemplate> = (mongoose.models?.Template as Model<ITemplate>) || mongoose.model<ITemplate>('Template', TemplateSchema);
