import Feedback from '../../models/Feedback.js';
import Scheme from '../../models/Scheme.js';
import AdminRecommendation from '../../models/AdminRecommendation.js';
import { createSystemNotification } from '../notifications/notificationService.js';

export const THRESHOLD_VALUE = 5;

// Normalize issue keywords to cluster similar feedback
const extractTopicKey = (subject = '', message = '', schemeId = null, feedbackType = 'GENERAL') => {
  const text = `${subject} ${message}`.toLowerCase();

  let coreKeyword = 'general_issue';
  if (text.includes('income') || text.includes('salary') || text.includes('earning') || text.includes('limit')) {
    coreKeyword = 'income_limit';
  } else if (text.includes('age') || text.includes('dob') || text.includes('birth') || text.includes('senior')) {
    coreKeyword = 'age_criteria';
  } else if (text.includes('land') || text.includes('khasra') || text.includes('patta') || text.includes('acre') || text.includes('hectare')) {
    coreKeyword = 'land_holding';
  } else if (text.includes('document') || text.includes('aadhaar') || text.includes('certificate') || text.includes('ration') || text.includes('proof')) {
    coreKeyword = 'documentation';
  } else if (text.includes('category') || text.includes('caste') || text.includes('obc') || text.includes('sc') || text.includes('st') || text.includes('ews')) {
    coreKeyword = 'community_category';
  } else if (text.includes('gender') || text.includes('female') || text.includes('women') || text.includes('widow')) {
    coreKeyword = 'gender_criteria';
  } else if (text.includes('portal') || text.includes('website') || text.includes('link') || text.includes('error') || text.includes('server')) {
    coreKeyword = 'portal_link';
  }

  const prefix = schemeId ? schemeId.toString() : 'general';
  return `${prefix}_${feedbackType}_${coreKeyword}`;
};

/**
 * Evaluates feedback after submission to check if repeated feedback threshold (5 distinct users) is met.
 */
export const processFeedbackForRecommendation = async (newFeedback) => {
  try {
    const topicKey = extractTopicKey(
      newFeedback.subject,
      newFeedback.message,
      newFeedback.schemeId,
      newFeedback.feedbackType
    );

    // Find all matching feedbacks on this scheme/type
    const query = {
      feedbackType: newFeedback.feedbackType,
    };
    if (newFeedback.schemeId) {
      query.schemeId = newFeedback.schemeId;
    }

    const matchingFeedbacks = await Feedback.find(query).populate('userId', 'fullName email');

    // Extract unique user IDs
    const userMap = new Map();
    matchingFeedbacks.forEach((f) => {
      if (f.userId && f.userId._id) {
        userMap.set(f.userId._id.toString(), f.userId);
      }
    });

    const distinctUserIds = Array.from(userMap.keys());
    const citizenCount = distinctUserIds.length;

    // Only escalate when threshold (5 distinct users) is met
    if (citizenCount >= THRESHOLD_VALUE) {
      let scheme = null;
      if (newFeedback.schemeId) {
        scheme = await Scheme.findById(newFeedback.schemeId);
      }

      let recommendation = await AdminRecommendation.findOne({ topicKey });
      const isNew = !recommendation;

      const title = scheme
        ? `Repeated ${newFeedback.feedbackType.replace(/_/g, ' ')} reported on "${scheme.schemeName}"`
        : `Repeated Citizen Feedback on "${newFeedback.subject}"`;

      const description = `${citizenCount} distinct citizens have submitted repeated feedback regarding ${
        scheme ? scheme.schemeName : 'this policy'
      }. The system has automatically escalated this issue to recommendations for administrative action.`;

      const suggestedAction = scheme
        ? `Review eligibility rules and scheme limits for "${scheme.schemeName}" in the Rule Builder or update scheme details.`
        : `Investigate portal parameters and user reports.`;

      const actionUrl = scheme ? `/admin/rules?schemeId=${scheme._id}` : `/admin/schemes`;

      if (!recommendation) {
        recommendation = await AdminRecommendation.create({
          schemeId: newFeedback.schemeId || null,
          feedbackType: newFeedback.feedbackType,
          topicKey,
          title,
          description,
          feedbackIds: matchingFeedbacks.map((f) => f._id),
          distinctUsers: distinctUserIds,
          citizenCount,
          threshold: THRESHOLD_VALUE,
          status: 'PENDING',
          suggestedAction,
          actionUrl,
        });

        // Trigger Notification for Admin
        await createSystemNotification({
          eventType: 'FEEDBACK_TO_RECOMMENDATION',
          title: `Feedback Moved to Recommendation (Threshold 5 Reached)`,
          description: `${citizenCount} citizens submitted repeated feedback on "${scheme ? scheme.schemeName : newFeedback.subject}". Moved to Recommendations.`,
          relatedEntityType: 'AdminRecommendation',
          relatedEntityId: recommendation._id,
        });
      } else {
        // Update existing recommendation counts
        const previousCount = recommendation.citizenCount;
        recommendation.feedbackIds = matchingFeedbacks.map((f) => f._id);
        recommendation.distinctUsers = distinctUserIds;
        recommendation.citizenCount = citizenCount;
        recommendation.description = description;
        await recommendation.save();

        if (previousCount < THRESHOLD_VALUE && citizenCount >= THRESHOLD_VALUE) {
          await createSystemNotification({
            eventType: 'FEEDBACK_TO_RECOMMENDATION',
            title: `Feedback Moved to Recommendation (Threshold 5 Reached)`,
            description: `${citizenCount} citizens submitted repeated feedback on "${scheme ? scheme.schemeName : newFeedback.subject}". Moved to Recommendations.`,
            relatedEntityType: 'AdminRecommendation',
            relatedEntityId: recommendation._id,
          });
        }
      }

      return recommendation;
    }

    return null;
  } catch (error) {
    console.error('[FeedbackClusterService] Error processing recommendation:', error);
    return null;
  }
};

/**
 * Scan all feedback in DB and backfill/cluster any that reach threshold 5
 */
export const scanAndSyncRecommendations = async () => {
  try {
    const allFeedbacks = await Feedback.find();
    for (const f of allFeedbacks) {
      await processFeedbackForRecommendation(f);
    }
  } catch (err) {
    console.error('[FeedbackClusterService] Error during sync:', err);
  }
};
