import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme',
      required: [true, 'Scheme ID is required'],
      index: true,
    },
    reminder: {
      enabled: {
        type: Boolean,
        default: false,
      },
      reminderDate: {
        type: Date,
        default: null,
      },
      timezone: {
        type: String,
        default: 'Asia/Kolkata',
      },
      message: {
        type: String,
        trim: true,
        default: '',
      },
      status: {
        type: String,
        enum: ['UPCOMING', 'TRIGGERED', 'COMPLETED', 'CANCELLED'],
        default: 'UPCOMING',
      },
      triggeredAt: {
        type: Date,
        default: null,
      },
      completedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// One bookmark per user/scheme combination
bookmarkSchema.index({ userId: 1, schemeId: 1 }, { unique: true });
// Index for scheduled reminder lookups
bookmarkSchema.index({ 'reminder.enabled': 1, 'reminder.status': 1, 'reminder.reminderDate': 1 });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
export default Bookmark;
