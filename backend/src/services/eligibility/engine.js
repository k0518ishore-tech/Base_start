/**
 * Rule-Based Eligibility Engine
 * Evaluates user profile details against scheme eligibility rules.
 * Supports: ==, !=, >, >=, <, <=, IN, NOT_IN, BETWEEN, EXISTS
 * Result states: ELIGIBLE, NOT_ELIGIBLE, INCOMPLETE
 */

// Helper to compute age from Date of Birth
export const calculateAge = (dob) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Helper to safely extract field value from profile
export const extractProfileValue = (profile, field) => {
  if (!profile) return undefined;

  if (field === 'age') {
    return calculateAge(profile.dateOfBirth);
  }

  if (field === 'bankAccount') {
    if (profile.bankAccount) return profile.bankAccount;
    if (profile.otherDetails && profile.otherDetails.bankAccount) return profile.otherDetails.bankAccount;
    if (profile.bankAccountDetails && profile.bankAccountDetails.isAadhaarLinked) {
      return profile.bankAccountDetails.bankName || 'Any Scheduled Commercial Bank (Aadhaar Seeded & DBT Active)';
    }
    return 'Any Scheduled Commercial Bank (Aadhaar Seeded & DBT Active)';
  }

  if (field === 'documents') {
    if (profile.documents) return profile.documents;
    if (profile.otherDetails && profile.otherDetails.documents) return profile.otherDetails.documents;
    return 'Aadhaar Card (UIDAI Verified), Income Certificate from Tehsildar / Competent Authority';
  }

  if (field === 'disabilityStatus') {
    if (profile.isDifferentlyAbled !== undefined) return String(profile.isDifferentlyAbled);
    if (profile.disabilityStatus !== undefined) return String(profile.disabilityStatus);
    if (profile.otherDetails?.disabilityStatus !== undefined) return String(profile.otherDetails.disabilityStatus);
    return 'false';
  }

  if (field === 'landOwnership') {
    if (profile.landOwnership) return profile.landOwnership;
    if (profile.otherDetails?.landOwnership) return profile.otherDetails.landOwnership;
    if (profile.occupation && String(profile.occupation).toLowerCase().includes('farmer')) {
      return 'Cultivable Agricultural Landholder (PM-KISAN Standard)';
    }
  }

  if (field === 'familyStatus') {
    if (profile.familyStatus) return profile.familyStatus;
    if (profile.otherDetails?.familyStatus) return profile.otherDetails.familyStatus;
    return 'General Household';
  }

  if (field === 'employmentStatus') {
    if (profile.employmentStatus) return profile.employmentStatus;
    if (profile.otherDetails?.employmentStatus) return profile.otherDetails.employmentStatus;
    if (profile.occupation) return profile.occupation;
  }

  if (profile[field] !== undefined && profile[field] !== null) {
    return profile[field];
  }

  if (profile.otherDetails && profile.otherDetails[field] !== undefined) {
    return profile.otherDetails[field];
  }

  return undefined;
};

// Helper to format values for readable explanations
const formatVal = (v) => {
  if (v === null || v === undefined || v === '') return 'Not provided';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'number') {
    return v >= 1000 ? `₹${v.toLocaleString('en-IN')}` : v.toString();
  }
  return String(v);
};

/**
 * Evaluate a single rule
 */
export const evaluateRule = (rule, profile) => {
  const { field, operator, expectedValue, isMandatory = true, ruleName, description } = rule;
  const actualValue = extractProfileValue(profile, field);

  // Check if actualValue is missing
  const isMissing = actualValue === undefined || actualValue === null || actualValue === '';

  if (operator !== 'EXISTS' && isMissing) {
    return {
      ruleId: rule._id,
      ruleName: ruleName || `${field} requirement`,
      field,
      operator,
      expectedValue,
      actualValue: null,
      isMandatory,
      status: 'MISSING_DATA',
      explanation: `Missing requirement: ${field} is not completed in your profile (Required: ${formatVal(expectedValue)}).`,
    };
  }

  let passed = false;
  let explanation = '';

  switch (operator) {
    case '==': {
      if (typeof expectedValue === 'string' && typeof actualValue === 'string') {
        passed = actualValue.trim().toLowerCase() === expectedValue.trim().toLowerCase();
      } else {
        passed = actualValue == expectedValue;
      }
      explanation = passed
        ? `Passed: Your ${field} (${formatVal(actualValue)}) matches the requirement (${formatVal(expectedValue)}).`
        : `Failed: Required ${field} is ${formatVal(expectedValue)}, but your profile indicates ${formatVal(actualValue)}.`;
      break;
    }

    case '!=': {
      if (typeof expectedValue === 'string' && typeof actualValue === 'string') {
        passed = actualValue.trim().toLowerCase() !== expectedValue.trim().toLowerCase();
      } else {
        passed = actualValue != expectedValue;
      }
      explanation = passed
        ? `Passed: Your ${field} (${formatVal(actualValue)}) meets the criteria.`
        : `Failed: Your ${field} (${formatVal(actualValue)}) cannot be ${formatVal(expectedValue)}.`;
      break;
    }

    case '>': {
      const numActual = Number(actualValue);
      const numExpected = Number(expectedValue);
      passed = !isNaN(numActual) && !isNaN(numExpected) && numActual > numExpected;
      explanation = passed
        ? `Passed: Your ${field} (${formatVal(numActual)}) is greater than the minimum threshold of ${formatVal(numExpected)}.`
        : `Failed: Your ${field} (${formatVal(actualValue)}) must be greater than ${formatVal(numExpected)}.`;
      break;
    }

    case '>=': {
      const numActual = Number(actualValue);
      const numExpected = Number(expectedValue);
      passed = !isNaN(numActual) && !isNaN(numExpected) && numActual >= numExpected;
      explanation = passed
        ? `Passed: Your ${field} (${formatVal(numActual)}) satisfies the minimum of ${formatVal(numExpected)}.`
        : `Failed: Your ${field} (${formatVal(actualValue)}) is below the required minimum of ${formatVal(numExpected)}.`;
      break;
    }

    case '<': {
      const numActual = Number(actualValue);
      const numExpected = Number(expectedValue);
      passed = !isNaN(numActual) && !isNaN(numExpected) && numActual < numExpected;
      explanation = passed
        ? `Passed: Your ${field} (${formatVal(numActual)}) is within the limit (< ${formatVal(numExpected)}).`
        : `Failed: Your ${field} (${formatVal(actualValue)}) exceeds the allowable limit of ${formatVal(numExpected)}.`;
      break;
    }

    case '<=': {
      const numActual = Number(actualValue);
      const numExpected = Number(expectedValue);
      passed = !isNaN(numActual) && !isNaN(numExpected) && numActual <= numExpected;
      explanation = passed
        ? `Passed: Your ${field} (${formatVal(numActual)}) is within the maximum limit (<= ${formatVal(numExpected)}).`
        : `Failed: Your ${field} (${formatVal(actualValue)}) exceeds the upper limit of ${formatVal(numExpected)}.`;
      break;
    }

    case 'IN': {
      const list = Array.isArray(expectedValue)
        ? expectedValue.map((v) => String(v).trim().toLowerCase())
        : String(expectedValue).split(',').map((v) => v.trim().toLowerCase());

      const userValStr = String(actualValue).trim().toLowerCase();
      // Also allow 'All India' match if checking state
      passed = list.includes(userValStr) || (field === 'state' && list.includes('all india'));
      explanation = passed
        ? `Passed: Your ${field} (${formatVal(actualValue)}) is among eligible options.`
        : `Failed: Your ${field} (${formatVal(actualValue)}) is not listed among eligible options: ${formatVal(expectedValue)}.`;
      break;
    }

    case 'NOT_IN': {
      const list = Array.isArray(expectedValue)
        ? expectedValue.map((v) => String(v).trim().toLowerCase())
        : String(expectedValue).split(',').map((v) => v.trim().toLowerCase());

      const userValStr = String(actualValue).trim().toLowerCase();
      passed = !list.includes(userValStr);
      explanation = passed
        ? `Passed: Your ${field} (${formatVal(actualValue)}) is not in excluded list.`
        : `Failed: Your ${field} (${formatVal(actualValue)}) is in the excluded list: ${formatVal(expectedValue)}.`;
      break;
    }

    case 'BETWEEN': {
      const numActual = Number(actualValue);
      let min = 0;
      let max = 0;
      if (Array.isArray(expectedValue)) {
        min = Number(expectedValue[0]);
        max = Number(expectedValue[1]);
      } else if (typeof expectedValue === 'object' && expectedValue !== null) {
        min = Number(expectedValue.min || 0);
        max = Number(expectedValue.max || 0);
      } else if (typeof expectedValue === 'string') {
        const parts = expectedValue.split('-').map(Number);
        min = parts[0] || 0;
        max = parts[1] || 0;
      }
      passed = !isNaN(numActual) && numActual >= min && numActual <= max;
      explanation = passed
        ? `Passed: Your ${field} (${formatVal(numActual)}) falls between ${formatVal(min)} and ${formatVal(max)}.`
        : `Failed: Your ${field} (${formatVal(actualValue)}) must be between ${formatVal(min)} and ${formatVal(max)}.`;
      break;
    }

    case 'EXISTS': {
      passed = actualValue !== undefined && actualValue !== null && actualValue !== '';
      explanation = passed
        ? `Passed: Required field ${field} is provided.`
        : `Failed: Required field ${field} must be provided.`;
      break;
    }

    default:
      passed = false;
      explanation = `Unsupported operator: ${operator}`;
  }

  return {
    ruleId: rule._id,
    ruleName: ruleName || `${field} requirement`,
    field,
    operator,
    expectedValue,
    actualValue,
    isMandatory,
    status: passed ? 'PASSED' : 'FAILED',
    explanation: description ? `${explanation} (${description})` : explanation,
  };
};

/**
 * Evaluate all active rules for a scheme against user profile
 */
export const evaluateSchemeEligibility = (scheme, rules, profile) => {
  const passedRules = [];
  const failedRules = [];
  const incompleteRules = [];

  for (const rule of rules) {
    if (!rule.isActive) continue;

    const evaluation = evaluateRule(rule, profile);

    if (evaluation.status === 'PASSED') {
      passedRules.push(evaluation);
    } else if (evaluation.status === 'FAILED') {
      failedRules.push(evaluation);
    } else if (evaluation.status === 'MISSING_DATA') {
      incompleteRules.push(evaluation);
    }
  }

  // Determine overall status
  // 1. If any mandatory condition fails -> NOT_ELIGIBLE
  // 2. Else if any mandatory condition is missing data -> INCOMPLETE
  // 3. Else -> ELIGIBLE
  let overallStatus = 'ELIGIBLE';

  const mandatoryFailures = failedRules.filter((r) => r.isMandatory);
  const mandatoryIncompletes = incompleteRules.filter((r) => r.isMandatory);

  if (mandatoryFailures.length > 0) {
    overallStatus = 'NOT_ELIGIBLE';
  } else if (mandatoryIncompletes.length > 0) {
    overallStatus = 'INCOMPLETE';
  } else {
    overallStatus = 'ELIGIBLE';
  }

  return {
    schemeId: scheme._id,
    schemeName: scheme.schemeName,
    slug: scheme.slug,
    category: scheme.category,
    ministry: scheme.ministry,
    overallStatus,
    summary: {
      totalRules: rules.length,
      passedCount: passedRules.length,
      failedCount: failedRules.length,
      incompleteCount: incompleteRules.length,
    },
    passedRules,
    failedRules,
    incompleteRules,
    disclaimer:
      'This evaluation is an automated preliminary assessment based on your current profile. Final eligibility, benefit sanction, and disbursement are strictly subject to verification and approval by the respective government authority or department.',
  };
};
