import Bookmark from '../models/Bookmark.js';
import Scheme from '../models/Scheme.js';

export const setReminder = async (req, res, next) => {
  try {
    const { schemeId, reminderDate, timezone = 'Asia/Kolkata', message = '' } = req.body;

    if (!schemeId || !reminderDate) {
      return res.status(400).json({ success: false, message: 'Scheme ID and reminder date are required.' });
    }

    const targetDate = new Date(reminderDate);
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid reminder date format.' });
    }

    if (targetDate <= new Date()) {
      return res.status(400).json({ success: false, message: 'Reminder date and time must be set in the future.' });
    }

    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    // Find or create bookmark
    let bookmark = await Bookmark.findOne({ userId: req.user._id, schemeId });
    if (!bookmark) {
      bookmark = new Bookmark({
        userId: req.user._id,
        schemeId,
      });
    }

    bookmark.reminder = {
      enabled: true,
      reminderDate: targetDate,
      timezone,
      message: message.trim(),
      status: 'UPCOMING',
      triggeredAt: null,
      completedAt: null,
    };

    await bookmark.save();

    return res.status(200).json({
      success: true,
      message: 'Reminder scheduled successfully.',
      data: bookmark,
    });
  } catch (error) {
    next(error);
  }
};

export const updateReminder = async (req, res, next) => {
  try {
    const { id } = req.params; // bookmark id
    const { reminderDate, timezone, message, enabled } = req.body;

    const bookmark = await Bookmark.findOne({ _id: id, userId: req.user._id });
    if (!bookmark) {
      return res.status(404).json({ success: false, message: 'Reminder not found or unauthorized.' });
    }

    if (reminderDate) {
      const targetDate = new Date(reminderDate);
      if (isNaN(targetDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date format' });
      }
      bookmark.reminder.reminderDate = targetDate;
      bookmark.reminder.status = 'UPCOMING';
    }

    if (timezone) bookmark.reminder.timezone = timezone;
    if (message !== undefined) bookmark.reminder.message = message.trim();
    if (enabled !== undefined) bookmark.reminder.enabled = Boolean(enabled);

    await bookmark.save();

    return res.status(200).json({
      success: true,
      message: 'Reminder updated successfully.',
      data: bookmark,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelReminder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bookmark = await Bookmark.findOne({ _id: id, userId: req.user._id });

    if (!bookmark) {
      return res.status(404).json({ success: false, message: 'Reminder not found or unauthorized.' });
    }

    bookmark.reminder.enabled = false;
    bookmark.reminder.status = 'CANCELLED';
    await bookmark.save();

    return res.status(200).json({
      success: true,
      message: 'Reminder cancelled successfully.',
      data: bookmark,
    });
  } catch (error) {
    next(error);
  }
};

export const completeReminder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bookmark = await Bookmark.findOne({ _id: id, userId: req.user._id });

    if (!bookmark) {
      return res.status(404).json({ success: false, message: 'Reminder not found or unauthorized.' });
    }

    bookmark.reminder.enabled = false;
    bookmark.reminder.status = 'COMPLETED';
    bookmark.reminder.completedAt = new Date();
    await bookmark.save();

    return res.status(200).json({
      success: true,
      message: 'Reminder marked as completed.',
      data: bookmark,
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingReminders = async (req, res, next) => {
  try {
    const reminders = await Bookmark.find({
      userId: req.user._id,
      'reminder.enabled': true,
      'reminder.status': 'UPCOMING',
    })
      .sort({ 'reminder.reminderDate': 1 })
      .populate('schemeId', 'schemeName slug category ministry');

    return res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders,
    });
  } catch (error) {
    next(error);
  }
};

export const getReminderHistory = async (req, res, next) => {
  try {
    const reminders = await Bookmark.find({
      userId: req.user._id,
      'reminder.status': { $in: ['TRIGGERED', 'COMPLETED', 'CANCELLED'] },
    })
      .sort({ updatedAt: -1 })
      .populate('schemeId', 'schemeName slug category ministry');

    return res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders,
    });
  } catch (error) {
    next(error);
  }
};
