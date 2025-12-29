import mongoose, { Schema, Document, Model } from 'mongoose';

type IUsageHistory = Document & {
  _id: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // Denormalized for faster queries
  resumeId?: mongoose.Types.ObjectId;
  variableValues: Record<string, string>;
  recipientName?: string;
  companyName?: string;
  success?: boolean;
  notes?: string;
  createdAt: Date;
};

export type { IUsageHistory };

interface IUsageHistoryModel extends Model<IUsageHistory> {
  getUserStats(userId: mongoose.Types.ObjectId, days?: number): Promise<{
    totalMessages: number;
    thisWeek: number;
    thisMonth: number;
    topTemplates: any[];
    successRate: number | null;
  }>;
}

const UsageHistorySchema = new Schema<IUsageHistory, IUsageHistoryModel>({
  templateId: {
    type: Schema.Types.ObjectId,
    ref: 'Template',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  resumeId: {
    type: Schema.Types.ObjectId,
    ref: 'Resume',
    index: true
  },
  variableValues: {
    type: Schema.Types.Mixed,
    required: true,
    default: {}
  },
  recipientName: { type: String, index: true },
  companyName: { type: String, index: true },
  success: { type: Boolean, index: true },
  notes: String,
  createdAt: { type: Date, default: Date.now, index: true }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'usageHistory'
});

// Compound indexes for analytics queries
UsageHistorySchema.index({ userId: 1, createdAt: -1 });
UsageHistorySchema.index({ templateId: 1, createdAt: -1 });
UsageHistorySchema.index({ userId: 1, templateId: 1, createdAt: -1 });
UsageHistorySchema.index({ userId: 1, success: 1, createdAt: -1 });

// TTL index: Auto-delete records older than 2 years (optional)
// UsageHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 });

// Static method: Get usage stats
UsageHistorySchema.statics.getUserStats = async function(
  userId: mongoose.Types.ObjectId,
  days: number = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [totalStats, weekStats, monthStats, topTemplates, successStats] = await Promise.all([
    // Total in period
    this.countDocuments({
      userId,
      createdAt: { $gte: startDate }
    }),

    // This week
    this.countDocuments({
      userId,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }),

    // This month
    this.countDocuments({
      userId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }),

    // Top templates
    this.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$templateId',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'templates',
          localField: '_id',
          foreignField: '_id',
          as: 'template'
        }
      },
      {
        $unwind: '$template'
      },
      {
        $project: {
          template: {
            id: '$template._id',
            title: '$template.title'
          },
          count: 1
        }
      }
    ]),

    // Success rate
    this.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate },
          success: { $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          successful: {
            $sum: { $cond: ['$success', 1, 0] }
          }
        }
      }
    ])
  ]);

  const successRate = successStats[0]
    ? (successStats[0].successful / successStats[0].total) * 100
    : null;

  return {
    totalMessages: totalStats,
    thisWeek: weekStats,
    thisMonth: monthStats,
    topTemplates,
    successRate
  };
};

// Post-save: Increment template usage count
UsageHistorySchema.post('save', async function(doc) {
  await mongoose.model('Template').findByIdAndUpdate(
    doc.templateId,
    {
      $inc: { usageCount: 1 },
      $set: { lastUsedAt: new Date() }
    }
  );
});

export const UsageHistory: IUsageHistoryModel = (mongoose.models?.UsageHistory as IUsageHistoryModel) || mongoose.model<IUsageHistory, IUsageHistoryModel>('UsageHistory', UsageHistorySchema);
