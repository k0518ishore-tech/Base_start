import Scheme from '../models/Scheme.js';
import Department from '../models/Department.js';
import EligibilityRule from '../models/EligibilityRule.js';
import Bookmark from '../models/Bookmark.js';
import SearchHistory from '../models/SearchHistory.js';
import UserProfile from '../models/UserProfile.js';
import { evaluateSchemeEligibility } from '../services/eligibility/engine.js';
import { getRagRecommendationsForUser } from '../services/recommendation/ragRecommenderService.js';
import {
  createSystemNotification,
  recordAuditLog,
  notifyEligibleCitizensForScheme,
} from '../services/notifications/notificationService.js';

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-');
};

export const getAllSchemes = async (req, res, next) => {
  try {
    const {
      search,
      departmentId,
      category,
      state,
      schemeLevel,
      beneficiary,
      verificationStatus,
      sortBy = 'newest',
      page = 1,
      limit = 12,
      includeInactive,
    } = req.query;

    const filter = {};

    // Inactive filter
    if (includeInactive === 'true' && req.user?.role === 'ADMIN') {
      // allow viewing inactive schemes for admin
    } else {
      filter.isActive = true;
    }

    if (departmentId && departmentId !== 'All') {
      filter.departmentId = departmentId;
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (schemeLevel && schemeLevel !== 'All') {
      filter.schemeLevel = schemeLevel;
    }

    if (verificationStatus && verificationStatus !== 'All') {
      filter.verificationStatus = verificationStatus;
    }

    if (state && state !== 'All India' && state !== 'All') {
      filter.$or = [
        { applicableStates: 'All India' },
        { applicableStates: { $regex: state, $options: 'i' } },
      ];
    }

    if (beneficiary && beneficiary !== 'All') {
      filter.targetBeneficiaries = { $regex: beneficiary, $options: 'i' };
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      const searchConditions = [
        { schemeName: { $regex: q, $options: 'i' } },
        { shortDescription: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { ministry: { $regex: q, $options: 'i' } },
        { targetBeneficiaries: { $regex: q, $options: 'i' } },
      ];

      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }

      // Log search history asynchronously if user is logged in
      if (req.user) {
        SearchHistory.create({
          userId: req.user._id,
          searchQuery: q,
          filters: { departmentId, category, state, schemeLevel },
          interactionType: 'SEARCH',
        }).catch((e) => console.error('Search log error:', e.message));
      }
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'name_asc') sortOptions = { schemeName: 1 };
    else if (sortBy === 'name_desc') sortOptions = { schemeName: -1 };
    else if (sortBy === 'oldest') sortOptions = { createdAt: 1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [schemes, total] = await Promise.all([
      Scheme.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .populate('departmentId', 'departmentName slug ministryName officialWebsite')
        .lean(),
      Scheme.countDocuments(filter),
    ]);

    // If user is authenticated, check which schemes they have bookmarked
    let bookmarkedIds = new Set();
    if (req.user) {
      const bookmarks = await Bookmark.find({ userId: req.user._id }).select('schemeId').lean();
      bookmarkedIds = new Set(bookmarks.map((b) => b.schemeId.toString()));
    }

    const schemesWithBookmarkStatus = schemes.map((s) => ({
      ...s,
      isBookmarked: bookmarkedIds.has(s._id.toString()),
    }));

    return res.status(200).json({
      success: true,
      count: schemesWithBookmarkStatus.length,
      data: schemesWithBookmarkStatus,
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

export const getSchemeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);

    const query = isObjectId ? { _id: id } : { slug: id };
    const scheme = await Scheme.findOne(query).populate('departmentId', 'departmentName slug ministryName officialWebsite contactInformation');

    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    // Inactive schemes are restricted to administrators until published
    if (!scheme.isActive && req.user?.role !== 'ADMIN') {
      return res.status(404).json({
        success: false,
        message: 'This scheme is currently in draft mode and pending eligibility rule configuration.',
      });
    }

    // Retrieve active eligibility rules for this scheme
    const rules = await EligibilityRule.find({ schemeId: scheme._id, isActive: true });

    // Check if user has bookmarked this scheme
    let bookmarkInfo = null;
    if (req.user) {
      bookmarkInfo = await Bookmark.findOne({ userId: req.user._id, schemeId: scheme._id });

      // Log view in search history
      SearchHistory.create({
        userId: req.user._id,
        schemeId: scheme._id,
        interactionType: 'VIEW',
      }).catch((e) => console.error('View log error:', e.message));
    }

    return res.status(200).json({
      success: true,
      data: {
        ...scheme.toObject(),
        rulesCount: rules.length,
        rules,
        isBookmarked: !!bookmarkInfo,
        bookmark: bookmarkInfo,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Deterministic & Profile-Matched Recommended Schemes (Only recommended schemes are returned)
export const getRecommendedSchemes = async (req, res, next) => {
  try {
    const { category, state } = req.query;
    const filter = { isActive: true };

    if (category && category !== 'All') {
      filter.category = category;
    }

    // 1. Fetch all active schemes matching category
    let allSchemes = await Scheme.find(filter)
      .populate('departmentId', 'departmentName slug ministryName')
      .lean();

    // 2. If user is authenticated, fetch their profile
    let userProfile = null;
    if (req.user) {
      userProfile = await UserProfile.findOne({ userId: req.user._id }).lean();
    }

    // Helper for safe array/string substring search
    const matchesTarget = (target, term) => {
      if (!target || !term) return false;
      const q = String(term).toLowerCase().trim();
      if (Array.isArray(target)) {
        return target.some((item) => String(item).toLowerCase().includes(q));
      }
      return String(target).toLowerCase().includes(q);
    };

    // 3. If user has a profile, evaluate recommendations based on rules & demographics
    if (userProfile) {
      const userState = userProfile.state || state;

      // Filter by state eligibility: All India or user's state
      if (userState && userState !== 'All India') {
        allSchemes = allSchemes.filter(
          (s) =>
            !s.applicableStates ||
            s.applicableStates.length === 0 ||
            s.applicableStates.includes('All India') ||
            s.applicableStates.includes(userState)
        );
      }

      // Fetch rules for these schemes
      const schemeIds = allSchemes.map((s) => s._id);
      const allRules = await EligibilityRule.find({ schemeId: { $in: schemeIds }, isActive: true }).lean();

      // Group rules by schemeId
      const rulesByScheme = {};
      for (const rule of allRules) {
        const sId = rule.schemeId.toString();
        if (!rulesByScheme[sId]) rulesByScheme[sId] = [];
        rulesByScheme[sId].push(rule);
      }

      const recommendedList = [];

      for (const scheme of allSchemes) {
        const sId = scheme._id.toString();
        const rules = rulesByScheme[sId] || [];

        // Check demographic conflicts
        const targetString = Array.isArray(scheme.targetBeneficiaries)
          ? scheme.targetBeneficiaries.join(' ').toLowerCase()
          : String(scheme.targetBeneficiaries || '').toLowerCase();
        const schemeNameLower = scheme.schemeName.toLowerCase();

        // 1. Gender / Child conflict (e.g. Sukanya Samriddhi for girl child)
        if (
          (targetString.includes('girl child') || schemeNameLower.includes('sukanya')) &&
          userProfile.gender === 'Male' &&
          !userProfile.otherDetails?.hasGirlChild
        ) {
          continue; // Not recommended
        }

        // 2. Student conflict (e.g. Scholarships)
        if (
          (targetString.includes('student') || schemeNameLower.includes('scholarship')) &&
          userProfile.occupation !== 'Student' &&
          userProfile.employmentStatus !== 'Student'
        ) {
          continue; // Not recommended for non-students
        }

        // 3. Street vendor conflict
        if (
          (targetString.includes('street vendor') || targetString.includes('hawker')) &&
          userProfile.occupation !== 'Street Vendor' &&
          userProfile.occupation !== 'Vendor'
        ) {
          continue; // Not recommended for farmers / non-vendors
        }

        // If rules exist, run deterministic eligibility engine
        if (rules.length > 0) {
          const evalResult = evaluateSchemeEligibility(scheme, rules, userProfile);

          // Must be ELIGIBLE and not fail any explicit status checks
          if (evalResult.overallStatus === 'ELIGIBLE') {
            const hasConflictingFailure = evalResult.failedRules.some(
              (r) => r.field === 'employmentStatus' || r.field === 'occupation'
            );

            if (!hasConflictingFailure) {
              recommendedList.push({
                ...scheme,
                recommendationReason: `Eligible: Meets all eligibility criteria based on your ${
                  userProfile.occupation ? userProfile.occupation : 'citizen'
                } profile`,
                recommendationBadge: 'Eligible for You',
                matchScore: 100,
                eligibilityStatus: 'ELIGIBLE',
              });
            }
          } else if (evalResult.overallStatus === 'INCOMPLETE') {
            // Only recommend if occupation directly matches
            if (userProfile.occupation && matchesTarget(scheme.targetBeneficiaries, userProfile.occupation)) {
              recommendedList.push({
                ...scheme,
                recommendationReason: `Recommended: Directly targeted for ${userProfile.occupation}s`,
                recommendationBadge: 'Profile Match',
                matchScore: 85,
                eligibilityStatus: 'INCOMPLETE',
              });
            }
          }
        } else {
          // If no specific rules are configured, ONLY recommend if occupation or community explicitly matches
          let matched = false;
          let reason = '';

          if (userProfile.occupation && matchesTarget(scheme.targetBeneficiaries, userProfile.occupation)) {
            matched = true;
            reason = `Matched for your occupation (${userProfile.occupation})`;
          } else if (
            userProfile.community &&
            userProfile.community !== 'General' &&
            matchesTarget(scheme.targetBeneficiaries, userProfile.community)
          ) {
            matched = true;
            reason = `Matched for ${userProfile.community} community`;
          }

          if (matched) {
            recommendedList.push({
              ...scheme,
              recommendationReason: reason,
              recommendationBadge: 'Profile Match',
              matchScore: 75,
              eligibilityStatus: 'VERIFY_DETAILS',
            });
          }
        }
      }

      // Sort by match score descending
      recommendedList.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

      return res.status(200).json({
        success: true,
        message: 'Recommended schemes matching your profile and eligibility criteria',
        data: recommendedList,
        profileSummary: {
          state: userProfile.state,
          occupation: userProfile.occupation,
          annualFamilyIncome: userProfile.annualFamilyIncome,
          community: userProfile.community,
        },
      });
    }

    // Fallback if user profile is not set: return central/state verified schemes (NO limit)
    if (state && state !== 'All India') {
      allSchemes = allSchemes.filter(
        (s) =>
          !s.applicableStates ||
          s.applicableStates.length === 0 ||
          s.applicableStates.includes('All India') ||
          s.applicableStates.includes(state)
      );
    }

    const recommendedList = allSchemes.map((s) => ({
      ...s,
      recommendationReason: 'Priority Public Welfare Initiative',
      recommendationBadge: 'Recommended',
    }));

    return res.status(200).json({
      success: true,
      message: 'Recommended government schemes',
      data: recommendedList,
      profileSummary: null,
    });
  } catch (error) {
    next(error);
  }
};

// Personalized RAG Recommendations based on user's past search & browsing history
export const getRagRecommendations = async (req, res, next) => {
  try {
    const userId = req.user?._id || null;
    const { query, limit } = req.query;

    // Asynchronously log search interaction if user supplied query
    if (userId && query && query.trim().length >= 3) {
      SearchHistory.create({
        userId,
        searchQuery: query.trim(),
        interactionType: 'SEARCH',
      }).catch((e) => console.error('RAG search log error:', e.message));
    }

    const result = await getRagRecommendationsForUser(userId, query, Number(limit) || 12);

    // If authenticated, attach isBookmarked status
    if (userId && result.data && result.data.length > 0) {
      const bookmarks = await Bookmark.find({ userId }).select('schemeId').lean();
      const bookmarkedIds = new Set(bookmarks.map((b) => b.schemeId.toString()));
      result.data = result.data.map((s) => ({
        ...s,
        isBookmarked: bookmarkedIds.has(s._id.toString()),
      }));
    }

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Admin: Create Scheme
export const createScheme = async (req, res, next) => {
  try {
    const {
      schemeName,
      slug,
      shortDescription,
      fullDescription,
      objectives,
      benefits,
      category,
      schemeLevel,
      applicableStates,
      ministry,
      departmentId,
      targetBeneficiaries,
      eligibilitySummary,
      requiredDocuments,
      applicationProcedure,
      officialWebsite,
      officialApplicationUrl,
      officialStatusUrl,
      sourceUrls,
      verificationStatus,
      isActive,
    } = req.body;

    if (!schemeName || !shortDescription || !fullDescription || !category || !ministry || !departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory fields: Scheme name, short description, full description, category, ministry, and department.',
      });
    }

    // Verify department exists
    const dept = await Department.findById(departmentId);
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Referenced department does not exist.' });
    }

    const generatedSlug = (slug || slugify(schemeName)).toLowerCase();
    const existing = await Scheme.findOne({
      $or: [{ schemeName: schemeName.trim() }, { slug: generatedSlug }],
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'A scheme with this name or slug already exists.' });
    }

    const newScheme = await Scheme.create({
      schemeName: schemeName.trim(),
      slug: generatedSlug,
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim(),
      objectives: Array.isArray(objectives) ? objectives : [],
      benefits: Array.isArray(benefits) ? benefits : [],
      category: category.trim(),
      schemeLevel: schemeLevel || 'Central',
      applicableStates: Array.isArray(applicableStates) && applicableStates.length > 0 ? applicableStates : ['All India'],
      ministry: ministry.trim(),
      departmentId,
      targetBeneficiaries: Array.isArray(targetBeneficiaries) ? targetBeneficiaries : [],
      eligibilitySummary: eligibilitySummary || '',
      requiredDocuments: Array.isArray(requiredDocuments) ? requiredDocuments : [],
      applicationProcedure: Array.isArray(applicationProcedure) ? applicationProcedure : [],
      officialWebsite: officialWebsite || '',
      officialApplicationUrl: officialApplicationUrl || '',
      officialStatusUrl: officialStatusUrl || '',
      sourceUrls: Array.isArray(sourceUrls) ? sourceUrls : [],
      verificationStatus: verificationStatus || 'NEEDS_VERIFICATION',
      lastVerifiedAt: verificationStatus === 'VERIFIED' ? new Date() : null,
      isActive: isActive !== undefined ? Boolean(isActive) : false,
    });

    await recordAuditLog({
      userId: req.user._id,
      action: 'CREATE_SCHEME',
      entityType: 'Scheme',
      entityId: newScheme._id,
      details: { name: newScheme.schemeName, isActive: newScheme.isActive },
    });

    // Dispatch targeted notifications strictly to ELIGIBLE citizens IF scheme is active
    let notifiedCount = 0;
    if (newScheme.isActive) {
      try {
        const dispatchResult = await notifyEligibleCitizensForScheme(newScheme._id);
        notifiedCount = dispatchResult.notifiedCount || 0;
      } catch (e) {
        console.error('[createScheme] Targeted notification dispatch error:', e);
      }
    }

    await createSystemNotification({
      eventType: 'SCHEME_CREATED',
      title: newScheme.isActive ? 'New Scheme Published' : 'New Scheme Created (Draft)',
      description: newScheme.isActive
        ? `Scheme "${newScheme.schemeName}" was added under ${dept.departmentName}. Targeted alerts delivered to ${notifiedCount} eligible citizen(s).`
        : `Scheme "${newScheme.schemeName}" was saved in draft mode under ${dept.departmentName}. Ready for eligibility rule definition.`,
      relatedEntityType: 'Scheme',
      relatedEntityId: newScheme._id,
    });

    return res.status(201).json({
      success: true,
      message: newScheme.isActive
        ? `Scheme created successfully. ${notifiedCount} eligible citizen(s) were notified.`
        : 'Scheme essential details saved. Please configure eligibility rules before publishing to users.',
      data: newScheme,
      notifiedCitizensCount: notifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Scheme
export const updateScheme = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const scheme = await Scheme.findById(id);
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    if (updateData.departmentId) {
      const dept = await Department.findById(updateData.departmentId);
      if (!dept) {
        return res.status(404).json({ success: false, message: 'Referenced department does not exist.' });
      }
    }

    if (updateData.verificationStatus === 'VERIFIED' && scheme.verificationStatus !== 'VERIFIED') {
      updateData.lastVerifiedAt = new Date();
    }

    const updatedScheme = await Scheme.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });

    await recordAuditLog({
      userId: req.user._id,
      action: 'UPDATE_SCHEME',
      entityType: 'Scheme',
      entityId: updatedScheme._id,
      details: { name: updatedScheme.schemeName, isActive: updatedScheme.isActive },
    });

    await createSystemNotification({
      eventType: 'SCHEME_UPDATED',
      title: 'Scheme Updated',
      description: `Scheme "${updatedScheme.schemeName}" details were updated.`,
      relatedEntityType: 'Scheme',
      relatedEntityId: updatedScheme._id,
    });

    // Check if updated scheme has eligible citizens waiting for notifications
    if (updatedScheme.isActive) {
      notifyEligibleCitizensForScheme(updatedScheme._id).catch((e) =>
        console.error('[updateScheme] Notification dispatch error:', e)
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Scheme updated successfully.',
      data: updatedScheme,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete Scheme
export const deleteScheme = async (req, res, next) => {
  try {
    const { id } = req.params;
    const scheme = await Scheme.findById(id);

    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    // Clean up associated eligibility rules and bookmarks
    await EligibilityRule.deleteMany({ schemeId: id });
    await Bookmark.deleteMany({ schemeId: id });

    await Scheme.findByIdAndDelete(id);

    await recordAuditLog({
      userId: req.user._id,
      action: 'DELETE_SCHEME',
      entityType: 'Scheme',
      entityId: id,
      details: { name: scheme.schemeName },
    });

    await createSystemNotification({
      eventType: 'SCHEME_DEACTIVATED',
      title: 'Scheme Deleted',
      description: `Scheme "${scheme.schemeName}" was deleted from the portal.`,
      relatedEntityType: 'Scheme',
      relatedEntityId: id,
    });

    return res.status(200).json({
      success: true,
      message: 'Scheme and associated rules/bookmarks deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Verification Status
export const updateVerificationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { verificationStatus, lastVerifiedAt } = req.body;

    if (!['VERIFIED', 'PARTIALLY_VERIFIED', 'NEEDS_VERIFICATION'].includes(verificationStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status value.' });
    }

    const scheme = await Scheme.findByIdAndUpdate(
      id,
      {
        $set: {
          verificationStatus,
          lastVerifiedAt: lastVerifiedAt ? new Date(lastVerifiedAt) : new Date(),
        },
      },
      { new: true }
    );

    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    await recordAuditLog({
      userId: req.user._id,
      action: 'UPDATE_VERIFICATION',
      entityType: 'Scheme',
      entityId: id,
      details: { status: verificationStatus },
    });

    return res.status(200).json({
      success: true,
      message: `Scheme verification status updated to ${verificationStatus}`,
      data: scheme,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Manually or programmatically trigger eligibility check and notifications for a scheme
export const triggerSchemeEligibilityNotifications = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await notifyEligibleCitizensForScheme(id);
    return res.status(200).json({
      success: true,
      message: `Eligibility evaluation completed. Dispatched targeted alerts to ${result.notifiedCount} eligible citizen(s).`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
