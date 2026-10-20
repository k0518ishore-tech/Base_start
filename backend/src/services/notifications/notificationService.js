import Notification from '../../models/Notification.js';
import SystemNotification from '../../models/SystemNotification.js';
import AuditLog from '../../models/AuditLog.js';
import Scheme from '../../models/Scheme.js';
import Department from '../../models/Department.js';
import EligibilityRule from '../../models/EligibilityRule.js';
import User from '../../models/User.js';
import UserProfile from '../../models/UserProfile.js';
import { evaluateSchemeEligibility } from '../eligibility/engine.js';

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

/**
 * Dispatch targeted scheme notification ONLY to citizens who are eligible for the scheme.
 * Non-eligible users receive NO notifications.
 */
export const notifyEligibleCitizensForScheme = async (schemeId) => {
  try {
    const scheme = await Scheme.findById(schemeId).populate('departmentId', 'departmentName');
    if (!scheme || !scheme.isActive) {
      return { notifiedCount: 0, eligibleUserIds: [] };
    }

    // 1. Fetch active eligibility rules for this scheme
    const rules = await EligibilityRule.find({ schemeId, isActive: true });

    // 2. Fetch all registered active citizens
    const citizens = await User.find({ role: 'USER', isActive: true }).select('_id fullName email');
    if (citizens.length === 0) {
      return { notifiedCount: 0, eligibleUserIds: [] };
    }

    // 3. Fetch citizen profiles
    const citizenIds = citizens.map((c) => c._id);
    const profiles = await UserProfile.find({ userId: { $in: citizenIds } });
    const profileMap = new Map();
    for (const p of profiles) {
      profileMap.set(p.userId.toString(), p);
    }

    const eligibleUserIds = [];
    const notificationsToCreate = [];

    const targets = Array.isArray(scheme.targetBeneficiaries)
      ? scheme.targetBeneficiaries.join(' ').toLowerCase()
      : String(scheme.targetBeneficiaries || '').toLowerCase();
    const schemeNameLower = scheme.schemeName.toLowerCase();

    for (const citizen of citizens) {
      const profile = profileMap.get(citizen._id.toString());
      // Skip citizens without a profile as their eligibility cannot be validated
      if (!profile) continue;

      // Check 1: State residency requirement
      if (
        scheme.applicableStates &&
        scheme.applicableStates.length > 0 &&
        !scheme.applicableStates.includes('All India')
      ) {
        if (!profile.state || !scheme.applicableStates.includes(profile.state)) {
          continue; // Citizen not in an applicable state
        }
      }

      // Check 2: Gender criteria
      if (
        (targets.includes('women only') ||
          targets.includes('female only') ||
          targets.includes('girl child') ||
          schemeNameLower.includes('mahila') ||
          schemeNameLower.includes('kanya') ||
          schemeNameLower.includes('sukanya') ||
          schemeNameLower.includes('ladli') ||
          schemeNameLower.includes('ladki')) &&
        profile.gender === 'Male' &&
        !profile.otherDetails?.hasGirlChild
      ) {
        continue; // Men ineligible for exclusive women/girl schemes
      }

      // Check 3: Deterministic Rule Engine evaluation
      if (rules.length > 0) {
        const evalResult = evaluateSchemeEligibility(scheme, rules, profile);
        // Only citizens whose overall status is ELIGIBLE get notified!
        if (evalResult.overallStatus !== 'ELIGIBLE') {
          continue;
        }
      }

      eligibleUserIds.push(citizen._id);

      // Check 4: Avoid duplicate notifications for the same scheme
      const alreadyNotified = await Notification.findOne({
        userId: citizen._id,
        relatedSchemeId: scheme._id,
      });

      if (!alreadyNotified) {
        notificationsToCreate.push({
          userId: citizen._id,
          title: `New Scheme Matching Your Profile: ${scheme.schemeName}`,
          message: `Great news, ${citizen.fullName || 'Citizen'}! Based on your profile (${profile.occupation || 'citizen'}, ${profile.state || 'India'}), you are eligible for the new scheme "${scheme.schemeName}". Open now to view benefits and apply.`,
          notificationType: 'SCHEME_UPDATE',
          relatedSchemeId: scheme._id,
          isRead: false,
        });
      }
    }

    if (notificationsToCreate.length > 0) {
      await Notification.insertMany(notificationsToCreate);
      console.log(`[NotificationService] Sent targeted notifications to ${notificationsToCreate.length} eligible citizen(s) for "${scheme.schemeName}".`);
    }

    return {
      notifiedCount: notificationsToCreate.length,
      eligibleUserIds,
      totalEvaluated: citizens.length,
    };
  } catch (error) {
    console.error('[NotificationService] Error notifying eligible citizens:', error);
    return { notifiedCount: 0, error: error.message };
  }
};
