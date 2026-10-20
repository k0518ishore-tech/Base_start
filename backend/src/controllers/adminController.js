import User from '../models/User.js';
import Scheme from '../models/Scheme.js';
import Department from '../models/Department.js';
import Feedback from '../models/Feedback.js';
import SystemNotification from '../models/SystemNotification.js';
import AuditLog from '../models/AuditLog.js';
import EligibilityRule from '../models/EligibilityRule.js';

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
