import cron from 'node-cron';
import Bookmark from '../../models/Bookmark.js';
import { createUserNotification } from '../notifications/notificationService.js';

/**
 * Sweep and process due reminders
 */
export const processDueReminders = async () => {
  try {
    const now = new Date();
    // Find active upcoming reminders that are due
    const dueBookmarks = await Bookmark.find({
      'reminder.enabled': true,
      'reminder.status': 'UPCOMING',
      'reminder.reminderDate': { $lte: now },
    }).populate('schemeId', 'schemeName slug');

    if (dueBookmarks.length === 0) return;

    console.log(`[Reminder Job] Found ${dueBookmarks.length} due reminder(s) to process.`);

    for (const bookmark of dueBookmarks) {
      const schemeName = bookmark.schemeId ? bookmark.schemeId.schemeName : 'Bookmarked Scheme';
      const customMsg = bookmark.reminder.message ? ` Note: "${bookmark.reminder.message}"` : '';
      const notificationTitle = `Reminder: ${schemeName}`;
      const notificationBody = `Your scheduled reminder for "${schemeName}" is due.${customMsg} Open scheme details to check eligibility and deadlines.`;

      // 1. Create notification
      await createUserNotification({
        userId: bookmark.userId,
        title: notificationTitle,
        message: notificationBody,
        notificationType: 'REMINDER',
        relatedSchemeId: bookmark.schemeId ? bookmark.schemeId._id : null,
      });

      // 2. Mark reminder as TRIGGERED
      bookmark.reminder.status = 'TRIGGERED';
      bookmark.reminder.triggeredAt = new Date();
      await bookmark.save();

      console.log(`[Reminder Job] Successfully triggered reminder for user ${bookmark.userId} on scheme ${schemeName}`);
    }
  } catch (error) {
    console.error('[Reminder Job] Error processing reminders:', error);
  }
};

/**
 * Initialize reminder scheduler
 */
export const initReminderScheduler = () => {
  // 1. Process overdue reminders immediately on startup
  console.log('[Reminder Job] Running startup check for overdue reminders...');
  processDueReminders();

  // 2. Schedule recurring check every minute
  const cronSchedule = process.env.CRON_SCHEDULE || '* * * * *';
  cron.schedule(cronSchedule, () => {
    processDueReminders();
  });

  console.log(`[Reminder Job] Scheduler initialized with cron pattern: ${cronSchedule}`);
};
