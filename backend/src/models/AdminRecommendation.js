import mongoose from 'mongoose';

const adminRecommendationSchema = new mongoose.Schema(
  {
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme',
      default: null,
      index: true,
    },
    feedbackType: {
      type: String,
      required: true,
      enum: ['GENERAL', 'INCORRECT_SCHEME_INFO', 'INCORRECT_ELIGIBILITY', 'TECHNICAL_ISSUE', 'SUGGESTION'],
      default: 'INCORRECT_ELIGIBILITY',
    },
    topicKey: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    feedbackIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feedback',
      },
    ],
    distinctUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    citizenCount: {
      type: Number,
      default: 0,
      index: true,
    },
    threshold: {
      type: Number,
      default: 5,
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_REVIEW', 'IMPLEMENTED', 'DISMISSED'],
      default: 'PENDING',
      index: true,
    },
    suggestedAction: {
      type: String,
      default: '',
    },
    actionUrl: {
      type: String,
      default: '',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const AdminRecommendation = mongoose.model('AdminRecommendation', adminRecommendationSchema);
export default AdminRecommendation;
