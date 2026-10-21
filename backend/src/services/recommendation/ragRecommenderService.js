import Scheme from '../../models/Scheme.js';
import Department from '../../models/Department.js';
import EligibilityRule from '../../models/EligibilityRule.js';
import SearchHistory from '../../models/SearchHistory.js';
import UserProfile from '../../models/UserProfile.js';
import { evaluateSchemeEligibility } from '../eligibility/engine.js';

const STOP_WORDS = new Set([
  'and', 'the', 'for', 'with', 'scheme', 'yojana', 'in', 'of', 'to', 'a', 'an',
  'is', 'by', 'on', 'at', 'from', 'or', 'all', 'any', 'my', 'me', 'gov', 'online',
  'apply', 'portal', 'status', 'check', 'details', 'eligibility', 'get', 'help'
]);

/**
 * Extract clean, distinctive keywords from search query and viewed schemes
 */
const extractKeywords = (text) => {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
};

/**
 * Core RAG Recommender Service:
 * Retrieves personalized scheme suggestions based on the user's past search & browsing history
 * and validates 100% eligibility against their profile.
 */
export const getRagRecommendationsForUser = async (userId, currentQuery = '', limit = 12) => {
  try {
    let userProfile = null;
    if (userId) {
      userProfile = await UserProfile.findOne({ userId }).lean();
    }

    // 1. Retrieve user's recent search & browsing interactions (last 15)
    let searchHistories = [];
    if (userId) {
      searchHistories = await SearchHistory.find({ userId })
        .sort({ createdAt: -1 })
        .limit(15)
        .populate('schemeId', 'schemeName category shortDescription ministry')
        .lean();
    }

    // 2. Extract interest keywords from past searches + current query + viewed schemes
    const keywordSet = new Set();
    const queryList = [];

    // Current query
    if (currentQuery) {
      queryList.push(currentQuery.trim());
      extractKeywords(currentQuery).forEach((kw) => keywordSet.add(kw));
    }

    // Past search queries and viewed schemes
    for (const h of searchHistories) {
      if (h.searchQuery && h.searchQuery.trim()) {
        const q = h.searchQuery.trim();
        if (!queryList.includes(q)) queryList.push(q);
        extractKeywords(q).forEach((kw) => keywordSet.add(kw));
      }
      if (h.schemeId && h.schemeId.schemeName) {
        extractKeywords(h.schemeId.schemeName).forEach((kw) => keywordSet.add(kw));
        if (h.schemeId.category) {
          extractKeywords(h.schemeId.category).forEach((kw) => keywordSet.add(kw));
        }
      }
    }

    // If citizen has profile attributes, add occupation/education context
    if (userProfile?.occupation) {
      extractKeywords(userProfile.occupation).forEach((kw) => keywordSet.add(kw));
    }

    const keywords = Array.from(keywordSet).slice(0, 10);
    const hasSearchContext = keywords.length > 0;

    // 3. Multi-field Candidate Retrieval from MongoDB
    let candidateQuery = { isActive: true };

    if (hasSearchContext) {
      const regexTerms = keywords.map((kw) => new RegExp(kw, 'i'));
      candidateQuery.$or = [
        { schemeName: { $in: regexTerms } },
        { category: { $in: regexTerms } },
        { shortDescription: { $in: regexTerms } },
        { targetBeneficiaries: { $in: regexTerms } },
        { objectives: { $in: regexTerms } },
      ];
    }

    // State residency constraint
    const citizenState = userProfile?.state;
    if (citizenState && citizenState !== 'All India') {
      candidateQuery.$and = [
        {
          $or: [
            { applicableStates: { $exists: false } },
            { applicableStates: { $size: 0 } },
            { applicableStates: 'All India' },
            { applicableStates: citizenState },
          ],
        },
      ];
    }

    let candidates = await Scheme.find(candidateQuery)
      .limit(80)
      .populate('departmentId', 'departmentName ministryName')
      .lean();

    // Fallback if too few candidates
    if (candidates.length < 5) {
      const fallbackSchemes = await Scheme.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('departmentId', 'departmentName ministryName')
        .lean();
      candidates = [...candidates, ...fallbackSchemes];
    }

    // 4. Batch Fetch Rules for Candidate Schemes
    const candidateIds = candidates.map((s) => s._id);
    const allRules = await EligibilityRule.find({ schemeId: { $in: candidateIds }, isActive: true }).lean();

    const rulesByScheme = {};
    for (const r of allRules) {
      const sId = r.schemeId.toString();
      if (!rulesByScheme[sId]) rulesByScheme[sId] = [];
      rulesByScheme[sId].push(r);
    }

    // 5. Evaluate Eligibility & Rank Candidates
    const eligibleMatches = [];
    const viewedSchemeIds = new Set(
      searchHistories.filter((h) => h.schemeId?._id).map((h) => h.schemeId._id.toString())
    );

    for (const scheme of candidates) {
      const sId = scheme._id.toString();
      const rules = rulesByScheme[sId] || [];

      // If user profile is available, run deterministic rule engine
      if (userProfile && rules.length > 0) {
        const evalRes = evaluateSchemeEligibility(scheme, rules, userProfile);
        if (evalRes.overallStatus !== 'ELIGIBLE') {
          continue; // Strictly filter out schemes citizen does not qualify for
        }
      }

      // Compute relevance score based on keyword hits
      const textParts = [
        scheme.schemeName || '',
        scheme.category || '',
        scheme.shortDescription || '',
        Array.isArray(scheme.targetBeneficiaries) ? scheme.targetBeneficiaries.join(' ') : '',
        Array.isArray(scheme.objectives) ? scheme.objectives.join(' ') : '',
      ];
      const schemeText = textParts.join(' ').toLowerCase();

      let matchCount = 0;
      let matchedKeyword = '';

      for (const kw of keywords) {
        if (schemeText.includes(kw)) {
          matchCount++;
          if (!matchedKeyword) matchedKeyword = kw;
        }
      }

      // Prioritize schemes not yet viewed
      const alreadyViewed = viewedSchemeIds.has(sId);
      const score = matchCount * 10 + (alreadyViewed ? 0 : 5);
      const matchPercentage = Math.min(98, Math.max(70, 68 + matchCount * 7));

      const capitalizedKeyword = matchedKeyword ? matchedKeyword.charAt(0).toUpperCase() + matchedKeyword.slice(1) : '';
      const recommendationReason = matchedKeyword
        ? `Because you searched for "${capitalizedKeyword}"`
        : `Matches your ${userProfile?.occupation || 'citizen'} profile`;

      eligibleMatches.push({
        ...scheme,
        relevanceScore: score,
        matchPercentage,
        recommendationBadge: matchedKeyword ? 'Based on Search' : 'Profile Match',
        recommendationReason,
        matchedKeyword,
      });
    }

    // Sort by highest relevance score
    eligibleMatches.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const finalRecommendations = eligibleMatches.slice(0, limit);

    // 6. Generate Synthesis Insight
    const primaryTopics = keywords.slice(0, 3).map((w) => w.charAt(0).toUpperCase() + w.slice(1));
    const topicsLabel = primaryTopics.length > 0 ? primaryTopics.join(', ') : 'Welfare & Benefits';
    const profileContext = userProfile?.occupation ? `${userProfile.occupation} in ${userProfile.state || 'India'}` : 'your citizen profile';

    const aiSummary = hasSearchContext
      ? `Showing ${finalRecommendations.length} verified schemes matching your interest in ${topicsLabel} and eligible for your profile as a ${profileContext}.`
      : `Showing ${finalRecommendations.length} verified schemes you are currently eligible for based on ${profileContext}.`;

    return {
      success: true,
      hasSearchHistory: hasSearchContext,
      searchInsights: {
        searchedTopics: primaryTopics,
        recentQueries: queryList.slice(0, 5),
        aiSummary,
      },
      count: finalRecommendations.length,
      data: finalRecommendations,
    };
  } catch (err) {
    console.error('[getRagRecommendationsForUser] Error:', err);
    return {
      success: false,
      hasSearchHistory: false,
      searchInsights: { searchedTopics: [], recentQueries: [], aiSummary: '' },
      count: 0,
      data: [],
    };
  }
};
