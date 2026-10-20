import EligibilityRule from '../models/EligibilityRule.js';
import Scheme from '../models/Scheme.js';
import {
  recordAuditLog,
  createSystemNotification,
  notifyEligibleCitizensForScheme,
} from '../services/notifications/notificationService.js';

const ALLOWED_OPERATORS = ['==', '!=', '>', '>=', '<', '<=', 'IN', 'NOT_IN', 'BETWEEN', 'EXISTS'];

export const getRulesByScheme = async (req, res, next) => {
  try {
    const { schemeId } = req.params;
    const rules = await EligibilityRule.find({ schemeId }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: rules.length,
      data: rules,
    });
  } catch (error) {
    next(error);
  }
};

export const createRule = async (req, res, next) => {
  try {
    const { schemeId, ruleName, field, operator, expectedValue, description, isMandatory, isActive } = req.body;

    if (!schemeId || !ruleName || !field || !operator || expectedValue === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide schemeId, ruleName, field, operator, and expectedValue.',
      });
    }

    if (!ALLOWED_OPERATORS.includes(operator)) {
      return res.status(400).json({
        success: false,
        message: `Invalid operator. Allowed: ${ALLOWED_OPERATORS.join(', ')}`,
      });
    }

    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Referenced scheme does not exist.' });
    }

    const newRule = await EligibilityRule.create({
      schemeId,
      ruleName: ruleName.trim(),
      field: field.trim(),
      operator,
      expectedValue,
      description: description || '',
      isMandatory: isMandatory !== undefined ? Boolean(isMandatory) : true,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    await recordAuditLog({
      userId: req.user._id,
      action: 'CREATE_RULE',
      entityType: 'EligibilityRule',
      entityId: newRule._id,
      details: { schemeName: scheme.schemeName, ruleName: newRule.ruleName },
    });

    await createSystemNotification({
      eventType: 'RULE_UPDATED',
      title: 'Eligibility Rule Added',
      description: `New eligibility rule "${newRule.ruleName}" created for "${scheme.schemeName}".`,
      relatedEntityType: 'EligibilityRule',
      relatedEntityId: newRule._id,
    });

    // Re-evaluate and notify only citizens who are ELIGIBLE under the updated rules
    notifyEligibleCitizensForScheme(scheme._id).catch((e) =>
      console.error('[createRule] Targeted notification dispatch error:', e)
    );

    return res.status(201).json({
      success: true,
      message: 'Eligibility rule created successfully.',
      data: newRule,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ruleName, field, operator, expectedValue, description, isMandatory, isActive } = req.body;

    if (operator && !ALLOWED_OPERATORS.includes(operator)) {
      return res.status(400).json({
        success: false,
        message: `Invalid operator. Allowed: ${ALLOWED_OPERATORS.join(', ')}`,
      });
    }

    const rule = await EligibilityRule.findById(id);
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    if (ruleName) rule.ruleName = ruleName.trim();
    if (field) rule.field = field.trim();
    if (operator) rule.operator = operator;
    if (expectedValue !== undefined) rule.expectedValue = expectedValue;
    if (description !== undefined) rule.description = description;
    if (isMandatory !== undefined) rule.isMandatory = Boolean(isMandatory);
    if (isActive !== undefined) rule.isActive = Boolean(isActive);

    await rule.save();

    await recordAuditLog({
      userId: req.user._id,
      action: 'UPDATE_RULE',
      entityType: 'EligibilityRule',
      entityId: rule._id,
      details: { ruleName: rule.ruleName, isActive: rule.isActive },
    });

    // Re-evaluate and notify only citizens who are ELIGIBLE under the updated rules
    notifyEligibleCitizensForScheme(rule.schemeId).catch((e) =>
      console.error('[updateRule] Targeted notification dispatch error:', e)
    );

    return res.status(200).json({
      success: true,
      message: 'Rule updated successfully.',
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rule = await EligibilityRule.findById(id);
    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    await EligibilityRule.findByIdAndDelete(id);

    await recordAuditLog({
      userId: req.user._id,
      action: 'DELETE_RULE',
      entityType: 'EligibilityRule',
      entityId: id,
      details: { ruleName: rule.ruleName },
    });

    return res.status(200).json({
      success: true,
      message: 'Eligibility rule deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
