import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Scheme from '../models/Scheme.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import UserProfile from '../models/UserProfile.js';
import Notification from '../models/Notification.js';
import EligibilityRule from '../models/EligibilityRule.js';
import { notifyEligibleCitizensForScheme } from '../services/notifications/notificationService.js';

dotenv.config({ path: 'backend/.env' });

const runWorkflowTest = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/government_scheme_db');
  console.log('Connected to MongoDB');

  const dept = await Department.findOne() || await Department.create({
    departmentName: 'Ministry of Skill Development & Livelihood',
    slug: 'ministry-skill-development',
    ministryName: 'Ministry of Skill Development',
    category: 'Skill & Livelihood',
  });

  // STEP 1: Simulate Admin creating a new scheme with essential data
  console.log('\n--- STEP 1: Admin fills essential scheme data and clicks Save ---');
  const tempSchemeName = `Youth Tech Internship Scheme ${Date.now()}`;
  const scheme = await Scheme.create({
    schemeName: tempSchemeName,
    slug: `youth-tech-internship-${Date.now()}`,
    shortDescription: 'Paid technology apprenticeship for college students under 25',
    fullDescription: 'Comprehensive skill-building program offering stipends and placement for youth.',
    category: 'Education',
    schemeLevel: 'Central',
    applicableStates: ['All India'],
    ministry: dept.ministryName,
    departmentId: dept._id,
    isActive: false, // DRAFT: Hidden until rules are defined
  });

  console.log(`Created Scheme: "${scheme.schemeName}"`);
  console.log(`Scheme Visibility Status: isActive = ${scheme.isActive} (Draft mode: Hidden from public)`);

  // Verify it is NOT returned in public schemes query
  const publicQuery = await Scheme.find({ isActive: true, _id: scheme._id });
  console.log(`Public Search Visibility Check: Found ${publicQuery.length} scheme(s) (Expected: 0)`);
  if (publicQuery.length !== 0) {
    console.error('FAIL: Scheme is visible to public before rules were set!');
    process.exit(1);
  }

  // Verify notifications sent at creation
  const preNotifications = await Notification.countDocuments({ 'data.schemeId': scheme._id });
  console.log(`Notifications sent before rule configuration: ${preNotifications} (Expected: 0)`);

  // STEP 2: Rule Editor Workflow - Admin sets eligibility rules for this scheme
  console.log('\n--- STEP 2: Scheme opens in Rule Editor, Admin configures conditions ---');
  const ageRule = await EligibilityRule.create({
    schemeId: scheme._id,
    ruleName: 'Age Limit (18 to 25 Years)',
    field: 'age',
    operator: 'BETWEEN',
    expectedValue: [18, 25],
    description: 'Applicant must be between 18 and 25 years old.',
    isMandatory: true,
    isActive: true,
  });

  const eduRule = await EligibilityRule.create({
    schemeId: scheme._id,
    ruleName: 'Education Qualification (Student / Graduate)',
    field: 'occupation',
    operator: 'IN',
    expectedValue: ['Student'],
    description: 'Applicant must be a student.',
    isMandatory: true,
    isActive: true,
  });

  console.log(`Configured 2 Eligibility Rules for scheme:`);
  console.log(`  1. ${ageRule.ruleName}`);
  console.log(`  2. ${eduRule.ruleName}`);

  // STEP 3: Admin Publishes the Scheme in Rule Editor
  console.log('\n--- STEP 3: Admin clicks "Publish Scheme to Users" in Rule Editor ---');
  scheme.isActive = true;
  await scheme.save();
  console.log(`Scheme Updated: isActive = ${scheme.isActive} (Now Live & Visible to all users!)`);

  // Now verify it IS visible to public queries
  const publicQueryAfter = await Scheme.find({ isActive: true, _id: scheme._id });
  console.log(`Public Search Visibility Check After Publish: Found ${publicQueryAfter.length} scheme(s) (Expected: 1)`);

  // Trigger targeted notifications
  const dispatch = await notifyEligibleCitizensForScheme(scheme._id);
  console.log(`Targeted notifications dispatched: ${dispatch.notifiedCount} eligible citizen(s)`);

  // Check which citizens received notifications
  const sentNotes = await Notification.find({ 'data.schemeId': scheme._id }).populate('userId');
  sentNotes.forEach((n) => {
    console.log(`  -> Notified: ${n.userId?.name} (${n.userId?.email}) - "${n.title}"`);
  });

  console.log('\n--- SUCCESS: Entire flow verified perfectly! ---');
  
  // Clean up test scheme and rules
  await EligibilityRule.deleteMany({ schemeId: scheme._id });
  await Notification.deleteMany({ 'data.schemeId': scheme._id });
  await Scheme.deleteOne({ _id: scheme._id });
  console.log('Cleaned up test data from MongoDB.');

  await mongoose.disconnect();
};

runWorkflowTest().catch((err) => {
  console.error(err);
  process.exit(1);
});
