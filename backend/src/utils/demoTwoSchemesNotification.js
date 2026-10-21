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

const runDemo = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/government_scheme_db');
  console.log('Connected to MongoDB');

  // Verify Kishore's account exists
  const kishoreUser = await User.findOne({ email: 'k0518kishore@gmail.com' });
  const kishoreProfile = await UserProfile.findOne({ userId: kishoreUser._id });

  console.log('\n======================================================');
  console.log('CITIZEN AUDIT FOR USER KISHORE:');
  console.log(`  Name: ${kishoreUser.fullName}`);
  console.log(`  Email: ${kishoreUser.email}`);
  console.log(`  State: ${kishoreProfile.state}`);
  console.log(`  Occupation: ${kishoreProfile.occupation}`);
  console.log(`  Education: ${kishoreProfile.education}`);
  console.log(`  Annual Income: ₹${kishoreProfile.annualFamilyIncome}`);
  console.log('======================================================\n');

  const dept = await Department.findOne() || await Department.create({
    departmentName: 'Department of Higher Education',
    slug: 'higher-education',
    ministryName: 'Ministry of Education',
    category: 'Education',
  });

  // Clear past demo notifications for a clean test
  await Notification.deleteMany({
    'title': { $regex: 'Tamil Nadu Youth College Scholarship|Punjab Small & Marginal Farmers', $options: 'i' }
  });

  // -------------------------------------------------------------
  // SCHEME 1: ELIGIBLE FOR USER KISHORE (Tamil Nadu Student Scheme)
  // -------------------------------------------------------------
  console.log('>>> [DEMO 1]: Creating Scheme 1 - "Tamil Nadu Youth College Scholarship & Digital Grant"');
  console.log('Target: College students in Tamil Nadu with family income under ₹2.5 Lakhs');
  
  // Clean up if already exists
  await Scheme.deleteMany({ schemeName: 'Tamil Nadu Youth College Scholarship & Digital Grant' });

  const scheme1 = await Scheme.create({
    schemeName: 'Tamil Nadu Youth College Scholarship & Digital Grant',
    slug: `tn-youth-college-scholarship-${Date.now()}`,
    shortDescription: 'Annual ₹25,000 grant and digital learning support for collegiate students in Tamil Nadu.',
    fullDescription: 'Comprehensive higher education welfare assistance for undergraduate and postgraduate students residing in Tamil Nadu.',
    category: 'Education',
    schemeLevel: 'State',
    applicableStates: ['Tamil Nadu'],
    ministry: dept.ministryName,
    departmentId: dept._id,
    isActive: true, // Published
  });

  // Add Eligibility Rules for Scheme 1
  await EligibilityRule.create([
    {
      schemeId: scheme1._id,
      ruleName: 'Tamil Nadu Domicile Requirement',
      field: 'state',
      operator: '==',
      expectedValue: 'Tamil Nadu',
      isMandatory: true,
      isActive: true,
    },
    {
      schemeId: scheme1._id,
      ruleName: 'Student Status Requirement',
      field: 'occupation',
      operator: 'IN',
      expectedValue: 'Student',
      isMandatory: true,
      isActive: true,
    },
    {
      schemeId: scheme1._id,
      ruleName: 'Age Window (17 to 25 Years)',
      field: 'age',
      operator: 'BETWEEN',
      expectedValue: '17, 25',
      isMandatory: true,
      isActive: true,
    },
    {
      schemeId: scheme1._id,
      ruleName: 'Income Ceiling (Up to ₹2.5 Lakhs)',
      field: 'annualFamilyIncome',
      operator: '<=',
      expectedValue: 250000,
      isMandatory: true,
      isActive: true,
    },
  ]);

  console.log('Rules configured for Scheme 1. Dispatching targeted notification...');
  const dispatch1 = await notifyEligibleCitizensForScheme(scheme1._id);
  console.log(`Notification Dispatch Result: ${dispatch1.notifiedCount} citizen(s) notified.`);

  // Check if Kishore received notification
  const kishoreNotif1 = await Notification.findOne({
    userId: kishoreUser._id,
    relatedSchemeId: scheme1._id,
  });

  if (kishoreNotif1) {
    console.log(`✅ SUCCESS: Kishore RECEIVED notification for Scheme 1!`);
    console.log(`   Notification Title: "${kishoreNotif1.title}"`);
    console.log(`   Message: "${kishoreNotif1.message}"`);
  } else {
    console.error(`❌ FAILED: Kishore did not receive notification for Scheme 1.`);
  }

  // -------------------------------------------------------------
  // SCHEME 2: NOT ELIGIBLE FOR KISHORE (Punjab Farmer Subsidy)
  // -------------------------------------------------------------
  console.log('\n>>> [DEMO 2]: Creating Scheme 2 - "Punjab Small & Marginal Farmers Crop Subsidy"');
  console.log('Target: Cultivable landholding farmers resident in Punjab with income under ₹3 Lakhs');

  await Scheme.deleteMany({ schemeName: 'Punjab Small & Marginal Farmers Crop Subsidy' });

  const scheme2 = await Scheme.create({
    schemeName: 'Punjab Small & Marginal Farmers Crop Subsidy',
    slug: `punjab-farmers-crop-subsidy-${Date.now()}`,
    shortDescription: 'Input cost subsidy for small and marginal cultivators in Punjab.',
    fullDescription: 'Seasonal agricultural assistance for registered cultivators with verifiable land revenue records in Punjab.',
    category: 'Agriculture',
    schemeLevel: 'State',
    applicableStates: ['Punjab'],
    ministry: 'Ministry of Agriculture',
    departmentId: dept._id,
    isActive: true, // Published
  });

  // Add Eligibility Rules for Scheme 2
  await EligibilityRule.create([
    {
      schemeId: scheme2._id,
      ruleName: 'Punjab State Domicile Requirement',
      field: 'state',
      operator: '==',
      expectedValue: 'Punjab',
      isMandatory: true,
      isActive: true,
    },
    {
      schemeId: scheme2._id,
      ruleName: 'Farmer Occupation Requirement',
      field: 'occupation',
      operator: 'IN',
      expectedValue: 'Small / Marginal Farmer, Farmer',
      isMandatory: true,
      isActive: true,
    },
    {
      schemeId: scheme2._id,
      ruleName: 'Landholder Criterion',
      field: 'landOwnership',
      operator: '==',
      expectedValue: 'Cultivable Agricultural Landholder (PM-KISAN Standard)',
      isMandatory: true,
      isActive: true,
    },
  ]);

  console.log('Rules configured for Scheme 2. Dispatching targeted notification...');
  const dispatch2 = await notifyEligibleCitizensForScheme(scheme2._id);
  console.log(`Notification Dispatch Result: ${dispatch2.notifiedCount} citizen(s) notified.`);

  // Check all users who received notification for Scheme 2
  const scheme2Notifications = await Notification.find({ relatedSchemeId: scheme2._id }).populate('userId');
  console.log(`Recipients of Scheme 2 notifications:`);
  scheme2Notifications.forEach(n => {
    console.log(`  -> ${n.userId?.fullName} (${n.userId?.email})`);
  });

  // Specifically verify Kishore did NOT receive Scheme 2
  const kishoreNotif2 = await Notification.findOne({
    userId: kishoreUser._id,
    relatedSchemeId: scheme2._id,
  });

  if (!kishoreNotif2) {
    console.log(`✅ SUCCESS: Kishore received ZERO notifications for Scheme 2 (Not Eligible as required)!`);
  } else {
    console.error(`❌ FAILED: Kishore incorrectly received notification for Scheme 2.`);
  }

  console.log('\n======================================================');
  console.log('DEMO SUMMARY:');
  console.log(`- Scheme 1 (Eligible for Kishore): Kishore Notified = ${!!kishoreNotif1}`);
  console.log(`- Scheme 2 (Ineligible for Kishore): Kishore Notified = ${!!kishoreNotif2} (Should be false)`);
  console.log('======================================================');

  await mongoose.disconnect();
};

runDemo().catch(console.error);
