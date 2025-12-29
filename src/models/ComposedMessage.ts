import mongoose, { Schema, Document, Model } from 'mongoose';

type IComposedMessage = Document & {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  templateId?: mongoose.Types.ObjectId;
  title: string;
  content: string;
  variableValues: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
};

export type { IComposedMessage };

const ComposedMessageSchema = new Schema<IComposedMessage>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  templateId: {
    type: Schema.Types.ObjectId,
    ref: 'Template',
    default: null
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  variableValues: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'composedMessages'
});

// Indexes
ComposedMessageSchema.index({ userId: 1, createdAt: -1 });
ComposedMessageSchema.index({ userId: 1, templateId: 1 });

export const ComposedMessage: Model<IComposedMessage> =
  (mongoose.models?.ComposedMessage as Model<IComposedMessage>) ||
  mongoose.model<IComposedMessage>('ComposedMessage', ComposedMessageSchema);
