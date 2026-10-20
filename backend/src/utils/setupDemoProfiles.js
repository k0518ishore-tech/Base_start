import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/government_scheme_db';

const setupProfiles = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const users = await mongoose.connection.db.collection('users').find({ role: 'USER' }).toArray();
  console.log('Found', users.length, 'citizens');

  const demoProfiles = [
    { email: 'citizen@schemegov.in', state: 'Maharashtra', gender: 'Male', occupation: 'Small / Marginal Farmer', income: 240000, dob: new Date('1988-05-15') },
    { email: 'ramesh.farmer@demo.gov.in', state: 'Punjab', gender: 'Male', occupation: 'Small / Marginal Farmer', income: 280000, dob: new Date('1982-08-20') },
    { email: 'sita.devi@demo.gov.in', state: 'Uttar Pradesh', gender: 'Female', occupation: 'Homemaker / Domestic Caregiver', income: 120000, dob: new Date('1990-03-10'), familyStatus: 'Below Poverty Line (BPL Card Holder)' },
    { email: 'anil.sharma@demo.gov.in', state: 'Rajasthan', gender: 'Male', occupation: 'Unemployed Youth / Jobseeker', income: 180000, dob: new Date('2000-01-25') },
    { email: 'priya.patel@demo.gov.in', state: 'Gujarat', gender: 'Female', occupation: 'Student', income: 150000, dob: new Date('2004-11-12') },
    { email: 'manoj.verma@demo.gov.in', state: 'Madhya Pradesh', gender: 'Male', occupation: 'Construction / Daily Wage Laborer', income: 90000, dob: new Date('1956-07-04'), familyStatus: 'Below Poverty Line (BPL Card Holder)' },
  ];

  for (const dp of demoProfiles) {
    const user = users.find((u) => u.email === dp.email);
    if (user) {
      await mongoose.connection.db.collection('userprofiles').updateOne(
        { userId: user._id },
        {
          $set: {
            userId: user._id,
            fullName: user.fullName,
            state: dp.state,
            gender: dp.gender,
            occupation: dp.occupation,
            annualFamilyIncome: dp.income,
            dateOfBirth: dp.dob,
            community: 'OBC',
            bankAccountDetails: { isAadhaarLinked: true, bankName: 'State Bank of India (SBI)' },
            otherDetails: {
              familyStatus: dp.familyStatus || 'General Household',
              landOwnership: dp.occupation.includes('Farmer') ? 'Cultivable Agricultural Landholder (PM-KISAN Standard)' : 'Landless',
            },
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
      console.log('Configured profile for:', user.fullName, `(${dp.gender}, ${dp.occupation}, ${dp.state})`);
    }
  }

  console.log('Profiles setup completed.');
  process.exit(0);
};

setupProfiles();
