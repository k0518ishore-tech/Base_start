import Feedback from '../models/Feedback.js';
import Scheme from '../models/Scheme.js';
import { createUserNotification, createSystemNotification, recordAuditLog } from '../services/notifications/notificationService.js';
import { processFeedbackForRecommendation } from '../services/recommendation/feedbackClusterService.js';

export const submitFeedback = async (req, res, next) => {
  try {
    const { feedbackType, subject, message, schemeId } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required.' });
    }

    if (schemeId) {
      const scheme = await Scheme.findById(schemeId);
      if (!scheme) {
        return res.status(404).json({ success: false, message: 'Referenced scheme not found' });
      }
    }

    const feedback = await Feedback.create({
      userId: req.user._id,
      schemeId: schemeId || null,
      feedbackType: feedbackType || 'GENERAL',
      subject: subject.trim(),
      message: message.trim(),
      status: 'PENDING',
    });

    await createSystemNotification({
      eventType: 'FEEDBACK_RECEIVED',
      title: 'New Feedback Submitted',
      description: `Citizen submitted ${feedbackType || 'general'} feedback: "${subject.trim()}".`,
      relatedEntityType: 'Feedback',
      relatedEntityId: feedback._id,
    });

    // Check if repeated feedback from 5 distinct citizens escalates to recommendation
    const recommendation = await processFeedbackForRecommendation(feedback);

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully. Our administrative team will review it.',
      data: feedback,
      escalatedToRecommendation: Boolean(recommendation),
    });
  } catch (error) {
    next(error);
  }
};

export const getMyFeedback = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('schemeId', 'schemeName slug');

    return res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all feedback
export const getAllFeedback = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (type && type !== 'All') filter.feedbackType = type;

    const skip = (Number(page) - 1) * Number(limit);

    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('userId', 'fullName email phone')
        .populate('schemeId', 'schemeName slug'),
      Feedback.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: feedbacks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Reply to and update feedback
export const replyFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const feedback = await Feedback.findById(id).populate('userId', 'fullName email');
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    if (status) feedback.status = status;
    if (adminResponse !== undefined) feedback.adminResponse = adminResponse.trim();

    await feedback.save();

    // Notify user if admin response provided
    if (adminResponse && adminResponse.trim() !== '') {
      await createUserNotification({
        userId: feedback.userId._id,
        title: `Response to Feedback: ${feedback.subject}`,
        message: `Admin response: "${adminResponse.trim()}". Status is now ${feedback.status}.`,
        notificationType: 'FEEDBACK_REPLY',
        relatedSchemeId: feedback.schemeId,
      });
    }

    await recordAuditLog({
      userId: req.user._id,
      action: 'REPLY_FEEDBACK',
      entityType: 'Feedback',
      entityId: feedback._id,
      details: { status: feedback.status, reply: adminResponse },
    });

    return res.status(200).json({
      success: true,
      message: 'Feedback updated and citizen notified.',
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};
