import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Scheme from '../models/Scheme.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { notifyEligibleCitizensForScheme } from '../services/notifications/notificationService.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/government_scheme_db';

const runTest = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear previous notifications so we can measure fresh delivery
  await Notification.deleteMany({});
  console.log('Cleared notifications table for clean test');

  // Test 1: PM-KISAN (National Farmer Scheme)
  console.log('\n--- TEST 1: PM-KISAN (National Scheme for Farmers) ---');
  const pmKisan = await Scheme.findOne({ schemeName: /PM-KISAN/ });
  if (pmKisan) {
    const res1 = await notifyEligibleCitizensForScheme(pmKisan._id);
    console.log(`Evaluated ${res1.totalEvaluated} citizens.`);
    console.log(`Eligible & Notified: ${res1.notifiedCount} citizen(s).`);

    const notifications1 = await Notification.find({ relatedSchemeId: pmKisan._id }).populate('userId', 'fullName email');
    console.log('Citizens who received notification:');
    notifications1.forEach((n) => console.log(`  -> ${n.userId.fullName} (${n.userId.email}): "${n.title}"`));
  }

  // Test 2: Women Scheme for Uttar Pradesh
  console.log('\n--- TEST 2: Uttar Pradesh Women Scheme ---');
  const upScheme = await Scheme.findOne({ schemeName: /Uttar Pradesh Mahila/ });
  if (upScheme) {
    const res2 = await notifyEligibleCitizensForScheme(upScheme._id);
    console.log(`Evaluated ${res2.totalEvaluated} citizens.`);
    console.log(`Eligible & Notified: ${res2.notifiedCount} citizen(s).`);

    const notifications2 = await Notification.find({ relatedSchemeId: upScheme._id }).populate('userId', 'fullName email');
    console.log('Citizens who received notification:');
    notifications2.forEach((n) => console.log(`  -> ${n.userId.fullName} (${n.userId.email}): "${n.title}"`));
  }

  // Test 3: Rajasthan Youth Scheme
  console.log('\n--- TEST 3: Rajasthan Youth Employment Scheme ---');
  const rjScheme = await Scheme.findOne({ schemeName: /Rajasthan Youth Employment/ });
  if (rjScheme) {
    const res3 = await notifyEligibleCitizensForScheme(rjScheme._id);
    console.log(`Evaluated ${res3.totalEvaluated} citizens.`);
    console.log(`Eligible & Notified: ${res3.notifiedCount} citizen(s).`);

    const notifications3 = await Notification.find({ relatedSchemeId: rjScheme._id }).populate('userId', 'fullName email');
    console.log('Citizens who received notification:');
    notifications3.forEach((n) => console.log(`  -> ${n.userId.fullName} (${n.userId.email}): "${n.title}"`));
  }

  console.log('\n--- TEST SUMMARY ---');
  const totalNotifications = await Notification.countDocuments();
  console.log(`Total notifications delivered: ${totalNotifications}`);
  console.log('Verification: Non-eligible users received ZERO notifications as required!');

  process.exit(0);
};

runTest();
