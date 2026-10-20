import mongoose from 'mongoose';

const schemeSchema = new mongoose.Schema(
  {
    schemeName: {
      type: String,
      required: [true, 'Scheme name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
    },
    fullDescription: {
      type: String,
      required: [true, 'Full description is required'],
      trim: true,
    },
    objectives: {
      type: [String],
      default: [],
    },
    benefits: [
      {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        amount: { type: String, default: '' },
      },
    ],
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    schemeLevel: {
      type: String,
      enum: ['Central', 'State'],
      default: 'Central',
    },
    applicableStates: {
      type: [String],
      default: ['All India'],
    },
    ministry: {
      type: String,
      required: [true, 'Ministry is required'],
      trim: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department reference is required'],
      index: true,
    },
    targetBeneficiaries: {
      type: [String],
      default: [],
    },
    eligibilitySummary: {
      type: String,
      default: '',
    },
    requiredDocuments: [
      {
        name: { type: String, required: true },
        mandatory: { type: Boolean, default: true },
        notes: { type: String, default: '' },
      },
    ],
    applicationProcedure: {
      type: [String],
      default: [],
    },
    officialWebsite: {
      type: String,
      trim: true,
      default: '',
    },
    officialApplicationUrl: {
      type: String,
      trim: true,
      default: '',
    },
    officialStatusUrl: {
      type: String,
      trim: true,
      default: '',
    },
    sourceUrls: [
      {
        title: { type: String, default: 'Official Portal' },
        url: { type: String, required: true },
        verified: { type: Boolean, default: false },
      },
    ],
    verificationStatus: {
      type: String,
      enum: ['VERIFIED', 'PARTIALLY_VERIFIED', 'NEEDS_VERIFICATION'],
      default: 'NEEDS_VERIFICATION',
    },
    lastVerifiedAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
schemeSchema.index({
  schemeName: 'text',
  shortDescription: 'text',
  fullDescription: 'text',
  category: 'text',
  ministry: 'text',
  targetBeneficiaries: 'text',
});

const Scheme = mongoose.model('Scheme', schemeSchema);
export default Scheme;
