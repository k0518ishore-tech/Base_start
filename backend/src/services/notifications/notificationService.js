import Notification from '../../models/Notification.js';
import SystemNotification from '../../models/SystemNotification.js';
import AuditLog from '../../models/AuditLog.js';

export const createUserNotification = async ({ userId, title, message, notificationType = 'SYSTEM', relatedSchemeId = null }) => {
  try {
    return await Notification.create({
      userId,
      title,
      message,
      notificationType,
      relatedSchemeId,
      isRead: false,
    });
  } catch (error) {
    console.error('[NotificationService] Error creating user notification:', error);
  }
};

export const createSystemNotification = async ({ eventType, title, description, relatedEntityType = '', relatedEntityId = null }) => {
  try {
    return await SystemNotification.create({
      eventType,
      title,
      description,
      relatedEntityType,
      relatedEntityId,
      isRead: false,
    });
  } catch (error) {
    console.error('[NotificationService] Error creating system notification:', error);
  }
};

export const recordAuditLog = async ({ userId, action, entityType, entityId = null, details = {}, ipAddress = '' }) => {
  try {
    return await AuditLog.create({
      userId,
      action,
      entityType,
      entityId,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error('[AuditLog] Error logging audit action:', error);
  }
};
