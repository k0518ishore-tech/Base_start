import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Transgender', 'Other', ''],
      default: '',
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    district: {
      type: String,
      trim: true,
      default: '',
    },
    annualFamilyIncome: {
      type: Number,
      default: null,
    },
    education: {
      type: String,
      trim: true,
      default: '',
    },
    occupation: {
      type: String,
      trim: true,
      default: '',
    },
    employmentStatus: {
      type: String,
      enum: ['Employed', 'Self-Employed', 'Unemployed', 'Student', 'Retired', 'Farmer', 'Daily Wage Worker', ''],
      default: '',
    },
    community: {
      type: String,
      enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority', ''],
      default: '',
    },
    disabilityStatus: {
      type: Boolean,
      default: false,
    },
    otherDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const UserProfile = mongoose.model('UserProfile', userProfileSchema);
export default UserProfile;
