import Scheme from '../models/Scheme.js';
import EligibilityRule from '../models/EligibilityRule.js';
import UserProfile from '../models/UserProfile.js';
import EligibilityCheck from '../models/EligibilityCheck.js';
import { evaluateSchemeEligibility } from '../services/eligibility/engine.js';

export const checkSingleScheme = async (req, res, next) => {
  try {
    const { schemeId } = req.params;
    const { customProfile } = req.body;

    const scheme = await Scheme.findById(schemeId).populate('departmentId', 'departmentName');
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    const rules = await EligibilityRule.find({ schemeId, isActive: true });

    // Determine profile data to use
    let profileData = {};
    if (customProfile) {
      // User provided quick-check parameters in form
      profileData = customProfile;
    } else if (req.user) {
      const userProfile = await UserProfile.findOne({ userId: req.user._id });
      profileData = userProfile ? userProfile.toObject() : {};
    }

    const evaluation = evaluateSchemeEligibility(scheme, rules, profileData);

    // If authenticated, record in eligibility_checks
    if (req.user) {
      await EligibilityCheck.create({
        userId: req.user._id,
        schemeId: scheme._id,
        overallStatus: evaluation.overallStatus,
        passedRules: evaluation.passedRules,
        failedRules: evaluation.failedRules,
        incompleteRules: evaluation.incompleteRules,
      });
    }

    return res.status(200).json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
};

export const checkAllSchemes = async (req, res, next) => {
  try {
    const { customProfile } = req.body;

    let profileData = {};
    if (customProfile) {
      profileData = customProfile;
    } else if (req.user) {
      const userProfile = await UserProfile.findOne({ userId: req.user._id });
      profileData = userProfile ? userProfile.toObject() : {};
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please log in or supply citizen profile details to check eligibility across schemes.',
      });
    }

    const schemes = await Scheme.find({ isActive: true }).populate('departmentId', 'departmentName slug ministryName');
    const allRules = await EligibilityRule.find({ isActive: true });

    // Group rules by schemeId
    const rulesByScheme = {};
    allRules.forEach((rule) => {
      const sId = rule.schemeId.toString();
      if (!rulesByScheme[sId]) rulesByScheme[sId] = [];
      rulesByScheme[sId].push(rule);
    });

    const eligibleSchemes = [];
    const ineligibleSchemes = [];
    const incompleteSchemes = [];

    for (const scheme of schemes) {
      const rules = rulesByScheme[scheme._id.toString()] || [];
      // If a scheme has no rules defined yet, treat as ELIGIBLE or general application
      const evalResult = evaluateSchemeEligibility(scheme, rules, profileData);

      const schemeCard = {
        ...scheme.toObject(),
        evaluation: evalResult,
      };

      if (evalResult.overallStatus === 'ELIGIBLE') {
        eligibleSchemes.push(schemeCard);
      } else if (evalResult.overallStatus === 'NOT_ELIGIBLE') {
        ineligibleSchemes.push(schemeCard);
      } else {
        incompleteSchemes.push(schemeCard);
      }
    }

    return res.status(200).json({
      success: true,
      summary: {
        totalEvaluated: schemes.length,
        eligibleCount: eligibleSchemes.length,
        ineligibleCount: ineligibleSchemes.length,
        incompleteCount: incompleteSchemes.length,
      },
      data: {
        eligible: eligibleSchemes,
        ineligible: ineligibleSchemes,
        incomplete: incompleteSchemes,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getEligibilityHistory = async (req, res, next) => {
  try {
    const history = await EligibilityCheck.find({ userId: req.user._id })
      .sort({ evaluatedAt: -1 })
      .limit(20)
      .populate('schemeId', 'schemeName slug category ministry');

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
