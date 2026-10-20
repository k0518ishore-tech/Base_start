import mongoose from 'mongoose';

const eligibilityRuleSchema = new mongoose.Schema(
  {
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme',
      required: [true, 'Scheme ID is required'],
      index: true,
    },
    ruleName: {
      type: String,
      required: [true, 'Rule name is required'],
      trim: true,
    },
    field: {
      type: String,
      required: [true, 'Field name is required'],
      trim: true,
    },
    operator: {
      type: String,
      required: [true, 'Operator is required'],
      enum: ['==', '!=', '>', '>=', '<', '<=', 'IN', 'NOT_IN', 'BETWEEN', 'EXISTS'],
    },
    expectedValue: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isMandatory: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const EligibilityRule = mongoose.model('EligibilityRule', eligibilityRuleSchema);
export default EligibilityRule;
