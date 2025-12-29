import mongoose, { Schema, Document, Model } from 'mongoose';

// Global Variable subdocument
const GlobalVariableSchema = new Schema({
  name: { type: String, required: true },
  displayName: { type: String, required: true },
  value: { type: String, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: true });

type IUserSettings = Document & {
  _id: mongoose.Types.ObjectId;
  userId: string; // Better Auth user ID (string)
  globalVariables: Array<{
    _id: mongoose.Types.ObjectId;
    name: string;
    displayName: string;
    value: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
  // Methods
  getGlobalVariable(name: string): any;
  setGlobalVariable(name: string, value: string, displayName?: string, description?: string): Promise<IUserSettings>;
};

export type { IUserSettings };

const UserSettingsSchema = new Schema<IUserSettings>({
  userId: {
    type: String,
    required: true
  },
  globalVariables: [GlobalVariableSchema]
}, {
  timestamps: true,
  collection: 'userSettings'
});

// Indexes
UserSettingsSchema.index({ userId: 1 }, { unique: true });
UserSettingsSchema.index({ 'globalVariables.name': 1 });

// Methods
UserSettingsSchema.methods.getGlobalVariable = function(name: string) {
  return this.globalVariables.find((v: any) => v.name === name);
};

UserSettingsSchema.methods.setGlobalVariable = function(name: string, value: string, displayName?: string, description?: string) {
  const existingVar = this.globalVariables.find((v: any) => v.name === name);
  if (existingVar) {
    existingVar.value = value;
    if (displayName) existingVar.displayName = displayName;
    if (description) existingVar.description = description;
    existingVar.updatedAt = new Date();
  } else {
    this.globalVariables.push({
      name,
      displayName: displayName || name,
      value,
      description,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any);
  }
  return this.save();
};

export const UserSettings: Model<IUserSettings> = (mongoose.models?.UserSettings as Model<IUserSettings>) || mongoose.model<IUserSettings>('UserSettings', UserSettingsSchema);
