import mongoose from 'mongoose';

const eligibilityCheckSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  schemeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scheme',
    required: true,
    index: true,
  },
  overallStatus: {
    type: String,
    enum: ['ELIGIBLE', 'NOT_ELIGIBLE', 'INCOMPLETE'],
    required: true,
  },
  passedRules: [mongoose.Schema.Types.Mixed],
  failedRules: [mongoose.Schema.Types.Mixed],
  incompleteRules: [mongoose.Schema.Types.Mixed],
  evaluatedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

const EligibilityCheck = mongoose.model('EligibilityCheck', eligibilityCheckSchema);
export default EligibilityCheck;
