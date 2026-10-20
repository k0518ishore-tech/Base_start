import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    departmentName: {
      type: String,
      required: [true, 'Department name is required'],
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
    description: {
      type: String,
      trim: true,
      default: '',
    },
    ministryName: {
      type: String,
      required: [true, 'Ministry name is required'],
      trim: true,
    },
    officialWebsite: {
      type: String,
      trim: true,
      default: '',
    },
    contactInformation: {
      email: { type: String, trim: true, default: '' },
      phone: { type: String, trim: true, default: '' },
      address: { type: String, trim: true, default: '' },
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

const Department = mongoose.model('Department', departmentSchema);
export default Department;
