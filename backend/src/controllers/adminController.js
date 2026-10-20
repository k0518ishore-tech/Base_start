import User from '../models/User.js';
import Scheme from '../models/Scheme.js';
import Department from '../models/Department.js';
import Feedback from '../models/Feedback.js';
import SystemNotification from '../models/SystemNotification.js';
import AuditLog from '../models/AuditLog.js';
import EligibilityRule from '../models/EligibilityRule.js';
import AdminRecommendation from '../models/AdminRecommendation.js';
import { recordAuditLog, createSystemNotification } from '../services/notifications/notificationService.js';
import { scanAndSyncRecommendations } from '../services/recommendation/feedbackClusterService.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalSchemes,
      activeSchemes,
      inactiveSchemes,
      totalDepartments,
      verifiedSchemes,
      needsVerificationSchemes,
      recentUsers,
      recentSchemes,
      recentFeedback,
      systemNotifications,
      totalRules,
    ] = await Promise.all([
      User.countDocuments({ role: 'USER' }),
      Scheme.countDocuments(),
      Scheme.countDocuments({ isActive: true }),
      Scheme.countDocuments({ isActive: false }),
      Department.countDocuments({ isActive: true }),
      Scheme.countDocuments({ verificationStatus: 'VERIFIED' }),
      Scheme.countDocuments({ verificationStatus: { $in: ['NEEDS_VERIFICATION', 'PARTIALLY_VERIFIED'] } }),
      User.find({ role: 'USER' }).select('fullName email phone createdAt isActive').sort({ createdAt: -1 }).limit(5),
      Scheme.find().select('schemeName category verificationStatus isActive createdAt').sort({ updatedAt: -1 }).limit(5),
      Feedback.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'fullName email'),
      SystemNotification.find().sort({ createdAt: -1 }).limit(8),
      EligibilityRule.countDocuments({ isActive: true }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalSchemes,
          activeSchemes,
          inactiveSchemes,
          totalDepartments,
          verifiedSchemes,
          needsVerificationSchemes,
          totalRules,
        },
        recentUsers,
        recentSchemes,
        recentFeedback,
        systemNotifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSystemNotifications = async (req, res, next) => {
  try {
    const notifications = await SystemNotification.find().sort({ createdAt: -1 }).limit(50);
    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const markSystemNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await SystemNotification.findByIdAndUpdate(id, { isRead: true });
    return res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

export const markAllSystemNotificationsRead = async (req, res, next) => {
  try {
    await SystemNotification.updateMany({ isRead: false }, { isRead: true });
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// Admin Recommendations
export const getAdminRecommendations = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'All') {
      filter.status = status;
    }

    const recommendations = await AdminRecommendation.find(filter)
      .sort({ citizenCount: -1, updatedAt: -1 })
      .populate('schemeId', 'schemeName slug category verificationStatus')
      .populate('distinctUsers', 'fullName email phone')
      .populate({
        path: 'feedbackIds',
        select: 'subject message feedbackType status createdAt',
        populate: { path: 'userId', select: 'fullName email' },
      });

    return res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRecommendationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const recommendation = await AdminRecommendation.findById(id);
    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }

    if (status) {
      recommendation.status = status;
      if (status === 'IMPLEMENTED' || status === 'DISMISSED') {
        recommendation.resolvedAt = new Date();
      }
    }
    if (adminNotes !== undefined) {
      recommendation.adminNotes = adminNotes;
    }

    await recommendation.save();

    await recordAuditLog({
      userId: req.user._id,
      action: 'UPDATE_RECOMMENDATION_STATUS',
      entityType: 'AdminRecommendation',
      entityId: recommendation._id,
      details: { status: recommendation.status, adminNotes },
    });

    return res.status(200).json({
      success: true,
      message: 'Recommendation status updated successfully',
      data: recommendation,
    });
  } catch (error) {
    next(error);
  }
};

// Seed demo 5-citizen repeated feedback to showcase the threshold in action
export const seedDemoRecommendation = async (req, res, next) => {
  try {
    const scheme = await Scheme.findOne({ isActive: true });
    if (!scheme) {
      return res.status(400).json({ success: false, message: 'No active scheme available' });
    }

    // Find or create 5 distinct citizen users
    const demoCitizenNames = [
      { fullName: 'Ramesh Kumar', email: 'ramesh.farmer@example.com' },
      { fullName: 'Sita Devi', email: 'sita.devi@example.com' },
      { fullName: 'Anil Sharma', email: 'anil.sharma@example.com' },
      { fullName: 'Priya Patel', email: 'priya.patel@example.com' },
      { fullName: 'Manoj Verma', email: 'manoj.verma@example.com' },
    ];

    const userIds = [];
    for (const d of demoCitizenNames) {
      let u = await User.findOne({ email: d.email });
      if (!u) {
        u = await User.create({
          fullName: d.fullName,
          email: d.email,
          passwordHash: 'seededpasswordhash123',
          role: 'USER',
          isActive: true,
        });
      }
      userIds.push(u._id);
    }

    // Create 5 repeated feedbacks on this scheme regarding income limit
    const createdFeedbackIds = [];
    for (let i = 0; i < userIds.length; i++) {
      const fb = await Feedback.create({
        userId: userIds[i],
        schemeId: scheme._id,
        feedbackType: 'INCORRECT_ELIGIBILITY',
        subject: `Income limit threshold too low for ${scheme.schemeName}`,
        message: `The strict income evaluation ceiling prevents genuine marginal beneficiaries from qualifying for ${scheme.schemeName}. Please review the threshold limit.`,
        status: 'PENDING',
      });
      createdFeedbackIds.push(fb._id);
    }

    // Now create the recommendation with threshold 5
    const topicKey = `${scheme._id}_INCORRECT_ELIGIBILITY_income_limit`;
    let recommendation = await AdminRecommendation.findOne({ topicKey });
    if (!recommendation) {
      recommendation = await AdminRecommendation.create({
        schemeId: scheme._id,
        feedbackType: 'INCORRECT_ELIGIBILITY',
        topicKey,
        title: `Repeated Eligibility Discrepancy on "${scheme.schemeName}"`,
        description: `5 distinct citizens have reported repeated feedback regarding the annual income ceiling rule on ${scheme.schemeName}. The threshold of 5 has been reached; automatically moved to Recommendations.`,
        feedbackIds: createdFeedbackIds,
        distinctUsers: userIds,
        citizenCount: userIds.length,
        threshold: 5,
        status: 'PENDING',
        suggestedAction: `Review eligibility rules and adjust the income ceiling rule for "${scheme.schemeName}" in Rule Builder.`,
        actionUrl: `/admin/rules?schemeId=${scheme._id}`,
      });

      await createSystemNotification({
        eventType: 'FEEDBACK_TO_RECOMMENDATION',
        title: `Feedback Moved to Recommendation (Threshold 5 Reached)`,
        description: `5 distinct citizens reported repeated feedback on "${scheme.schemeName}". Moved to Recommendations for admin action.`,
        relatedEntityType: 'AdminRecommendation',
        relatedEntityId: recommendation._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Demo feedback and recommendation seeded with 5 distinct citizens!',
      data: recommendation,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 25 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('userId', 'fullName email role'),
      AuditLog.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data: logs,
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
