import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme',
      default: null,
    },
    feedbackType: {
      type: String,
      enum: ['GENERAL', 'INCORRECT_SCHEME_INFO', 'INCORRECT_ELIGIBILITY', 'TECHNICAL_ISSUE', 'SUGGESTION'],
      default: 'GENERAL',
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_REVIEW', 'RESOLVED', 'REJECTED'],
      default: 'PENDING',
      index: true,
    },
    adminResponse: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
