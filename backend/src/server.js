import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { initReminderScheduler } from './services/reminders/scheduler.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect Database
    await connectDB();

    // 2. Initialize Reminder Job Scheduler
    initReminderScheduler();

    // 3. Start Express Server
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  Government Scheme Eligibility Engine Backend API  `);
      console.log(`  Status: Running on http://localhost:${PORT}        `);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'} `);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
