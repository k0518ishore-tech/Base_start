import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Scheme from '../models/Scheme.js';
import User from '../models/User.js';
import Feedback from '../models/Feedback.js';
import AdminRecommendation from '../models/AdminRecommendation.js';
import { createSystemNotification } from '../services/notifications/notificationService.js';

dotenv.config();
dotenv.config({ path: './backend/.env' });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/government_scheme_db';

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const scheme = await Scheme.findOne({ isActive: true });
  if (!scheme) {
    console.log('No active scheme found');
    process.exit(1);
  }

  console.log('Target scheme:', scheme.schemeName);

  const demoUsers = [
    { fullName: 'Ramesh Kumar', email: 'ramesh.farmer@demo.gov.in' },
    { fullName: 'Sita Devi', email: 'sita.devi@demo.gov.in' },
    { fullName: 'Anil Sharma', email: 'anil.sharma@demo.gov.in' },
    { fullName: 'Priya Patel', email: 'priya.patel@demo.gov.in' },
    { fullName: 'Manoj Verma', email: 'manoj.verma@demo.gov.in' },
  ];

  const userIds = [];
  for (const d of demoUsers) {
    let u = await User.findOne({ email: d.email });
    if (!u) {
      u = await User.create({
        fullName: d.fullName,
        email: d.email,
        passwordHash: 'seededpassword123',
        role: 'USER',
        isActive: true,
      });

      await createSystemNotification({
        eventType: 'USER_REGISTRATION',
        title: 'New Citizen Registered',
        description: `${d.fullName} (${d.email}) registered on the portal.`,
        relatedEntityType: 'User',
        relatedEntityId: u._id,
      });
    }
    userIds.push(u._id);
  }

  const topicKey = `${scheme._id}_INCORRECT_ELIGIBILITY_income_limit`;
  let rec = await AdminRecommendation.findOne({ topicKey });

  if (!rec) {
    const fbIds = [];
    for (let i = 0; i < userIds.length; i++) {
      const fb = await Feedback.create({
        userId: userIds[i],
        schemeId: scheme._id,
        feedbackType: 'INCORRECT_ELIGIBILITY',
        subject: `Annual family income limit is too low for ${scheme.schemeName}`,
        message: `Citizens earning marginally above the income ceiling are disqualified. Please review and adjust the eligibility income ceiling.`,
        status: 'PENDING',
      });
      fbIds.push(fb._id);

      await createSystemNotification({
        eventType: 'FEEDBACK_RECEIVED',
        title: 'New Feedback Submitted',
        description: `${demoUsers[i].fullName} submitted eligibility feedback: Income limit too low.`,
        relatedEntityType: 'Feedback',
        relatedEntityId: fb._id,
      });
    }

    rec = await AdminRecommendation.create({
      schemeId: scheme._id,
      feedbackType: 'INCORRECT_ELIGIBILITY',
      topicKey,
      title: `Eligibility Rule Discrepancy on "${scheme.schemeName}"`,
      description: `5 distinct citizens have reported that the income ceiling rule is too strict. Threshold of 5 reached; automatically moved to Recommendations.`,
      feedbackIds: fbIds,
      distinctUsers: userIds,
      citizenCount: 5,
      threshold: 5,
      status: 'PENDING',
      suggestedAction: `Review annualFamilyIncome condition in Rule Builder for ${scheme.schemeName}.`,
      actionUrl: `/admin/rules?schemeId=${scheme._id}`,
    });

    await createSystemNotification({
      eventType: 'FEEDBACK_TO_RECOMMENDATION',
      title: `Feedback Moved to Recommendation (Threshold 5 Reached)`,
      description: `5 distinct citizens reported repeated eligibility issues on "${scheme.schemeName}". Moved to Recommendations.`,
      relatedEntityType: 'AdminRecommendation',
      relatedEntityId: rec._id,
    });

    console.log('Seeded demo recommendation successfully with 5 citizens!');
  } else {
    console.log('Recommendation already exists with citizenCount:', rec.citizenCount);
  }

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
