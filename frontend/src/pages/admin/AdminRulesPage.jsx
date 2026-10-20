import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sliders,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
  Save,
  RotateCcw,
  Sparkles,
  Building2,
  Check,
  Layers,
  ArrowRight,
  BookOpen,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

// 15 Citizen Profile & Criteria Fields
const RULE_FIELDS = [
  { value: 'age', label: '1. Age (Years computed from DOB)' },
  { value: 'annualFamilyIncome', label: '2. Annual Family Income (₹ Number)' },
  { value: 'state', label: '3. Residence / State (Resident of state or India)' },
  { value: 'gender', label: '4. Gender (Female, Male, Other)' },
  { value: 'education', label: '5. Education Level (Class 10, Class 12, Graduate)' },
  { value: 'occupation', label: '6. Occupation (Farmer, Registered Worker, Artisan)' },
  { value: 'community', label: '7. Social Category (SC, ST, OBC, EWS, General)' },
  { value: 'employmentStatus', label: '8. Employment Status (Unemployed, Self-Employed)' },
  { value: 'disabilityStatus', label: '9. Disability Status (Boolean / Benchmark %)' },
  { value: 'landOwnership', label: '10. Land Ownership (Cultivable landholder status)' },
  { value: 'familyStatus', label: '11. Family Status (BPL / Antyodaya / Ration Card)' },
  { value: 'existingBenefits', label: '12. Existing Benefits (Non-receipt of overlap DBT)' },
  { value: 'bankAccount', label: '13. Bank Account (Aadhaar-seeded DBT active)' },
  { value: 'documents', label: '14. Documents (Identity, income & caste certificates)' },
  { value: 'district', label: '15. Location / District (Regional block or district)' },
];

const OPERATORS = [
  { value: '<=', label: '<= (Less than or equal to - Ceiling limit)' },
  { value: '>=', label: '>= (Greater than or equal to - Minimum threshold)' },
  { value: '==', label: '== (Equal to - Strict match)' },
  { value: '!=', label: '!= (Not equal to - Exclude value)' },
  { value: '<', label: '< (Strictly less than)' },
  { value: '>', label: '> (Strictly greater than)' },
  { value: 'IN', label: 'IN (Must be in allowed list e.g. SC, ST, OBC)' },
  { value: 'NOT_IN', label: 'NOT_IN (Must not be in list)' },
  { value: 'BETWEEN', label: 'BETWEEN (Range [min, max] e.g. 18, 60)' },
  { value: 'EXISTS', label: 'EXISTS (Attribute / certificate must be provided)' },
];

// The 15 Standard Common Eligibility Conditions requested by the user
export const COMMON_ELIGIBILITY_CONDITIONS = [
  {
    id: 'TEMPLATE_AGE',
    number: 1,
    name: 'Age',
    example: 'Applicant must be 18–60 years old',
    field: 'age',
    operator: 'BETWEEN',
    expectedValue: '18, 60',
    description: 'Applicant must be between 18 and 60 years of age.',
    isMandatory: true,
  },
  {
    id: 'TEMPLATE_INCOME',
    number: 2,
    name: 'Annual Income',
    example: 'Family income below ₹2.5 lakh',
    field: 'annualFamilyIncome',
    operator: '<=',
    expectedValue: '250000',
    description: 'Annual family income must be below ₹2,50,000.',
    isMandatory: true,
  },
  {
    id: 'TEMPLATE_RESIDENCE',
    number: 3,
    name: 'Residence',
    example: 'Must be an Indian citizen or resident of a particular state',
    field: 'state',
    operator: 'IN',
    expectedValue: 'All India',
    description: 'Applicant must be an Indian citizen and resident of the specified State / Territory.',
    isMandatory: true,
  },
  {
    id: 'TEMPLATE_GENDER',
    number: 4,
    name: 'Gender',
    example: 'Only women are eligible',
    field: 'gender',
    operator: '==',
    expectedValue: 'Female',
    description: 'Welfare initiative designated specifically for women beneficiaries.',
    isMandatory: true,
  },
  {
    id: 'TEMPLATE_EDUCATION',
    number: 5,
    name: 'Education',
    example: 'Must have completed Class 10',
    field: 'education',
    operator: 'IN',
    expectedValue: 'Class 10, Class 12, Graduate, Post Graduate',
    description: 'Applicant must have completed at least Class 10 secondary qualification.',
    isMandatory: true,
  },
  {
    id: 'TEMPLATE_OCCUPATION',
    number: 6,
    name: 'Occupation',
    example: 'Must be a farmer or registered worker',
    field: 'occupation',
    operator: 'IN',
    expectedValue: 'Farmer, Agricultural Worker, Artisan',
    description: 'Applicant primary occupation must be a farmer or registered wage worker.',
    isMandatory: true,
  },
  {
    id: 'TEMPLATE_COMMUNITY',
    number: 7,
    name: 'Social Category',
    example: 'SC/ST/OBC or other specified categories',
    field: 'community',
    operator: 'IN',
    expectedValue: 'SC, ST, OBC, EWS',
    description: 'Applicant must belong to an eligible affirmative category (SC/ST/OBC/EWS).',
    isMandatory: true,
  },
  {
    id: 'TEMPLATE_EMPLOYMENT',
    number: 8,
    name: 'Employment Status',
    example: 'Must be unemployed',
    field: 'employmentStatus',
    operator: '==',
    expectedValue: 'Unemployed',
    description: 'Applicant must be currently unemployed or an active jobseeker.',
    isMandatory: true,
  },
  {
    id: 'TEMPLATE_DISABILITY',
    number: 9,
    name: 'Disability Status',
    example: 'Must have a specified disability percentage',
    field: 'disabilityStatus',
    operator: '==',
    expectedValue: 'true',
    description: 'Applicant must possess a certified benchmark disability percentage (>= 40%).',
    isMandatory: false,
  },
  {
    id: 'TEMPLATE_LAND',
    number: 10,
    name: 'Land Ownership',
    example: 'Must own or cultivate agricultural land',
    field: 'landOwnership',
    operator: '==',
    expectedValue: 'Cultivable Landholder',
    description: 'Beneficiary must hold cultivable land ownership records or cultivate farm holdings.',
    isMandatory: true,
  },
  {
    id: 'TEMPLATE_FAMILY',
    number: 11,
    name: 'Family Status',
    example: 'Must belong to a specified household category',
    field: 'familyStatus',
    operator: 'IN',
    expectedValue: 'BPL, Antyodaya Anna Yojana (AAY), Priority Household (PHH)',
    description: 'Household must belong to a recognized BPL or Antyodaya ration card category.',
    isMandatory: true,
  },
  {
    id: 'TEMPLATE_EXISTING_BENEFITS',
    number: 12,
    name: 'Existing Benefits',
    example: 'Must not already receive certain overlapping benefits',
    field: 'existingBenefits',
    operator: '!=',
    expectedValue: 'Overlapping Pension / DBT Subsidy',
    description: 'Applicant must not already receive overlapping welfare pension or identical subsidy.',
    isMandatory: true,
  },
  {
    id: 'TEMPLATE_BANK',
    number: 13,
    name: 'Bank Account',
    example: 'Must have an eligible bank account',
    field: 'bankAccount',
    operator: '==',
    expectedValue: 'Aadhaar-Seeded DBT Account',
    description: 'Applicant must have an active savings bank account linked to Aadhaar for DBT transfer.',
    isMandatory: true,
  },
  {
    id: 'TEMPLATE_DOCUMENTS',
    number: 14,
    name: 'Documents',
    example: 'Must provide required certificates and identity proof',
    field: 'documents',
    operator: 'EXISTS',
    expectedValue: 'Aadhaar Card, Income Certificate, Caste Certificate',
    description: 'Applicant must submit required identity, income, and category certificates.',
    isMandatory: true,
  },
  {
    id: 'TEMPLATE_LOCATION',
    number: 15,
    name: 'Location',
    example: 'Must reside in a specified district or region',
    field: 'district',
    operator: 'EXISTS',
    expectedValue: 'Designated Aspirational District',
    description: 'Applicant must reside in a notified district or designated regional block.',
    isMandatory: true,
  },
];

const AdminRulesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const querySchemeId = searchParams.get('schemeId');
  const { showToast } = useToast();

  const [schemes, setSchemes] = useState([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState('');
  const [rules, setRules] = useState([]);
  const [selectedRuleId, setSelectedRuleId] = useState('TEMPLATE_INCOME');
  const [activeTemplateInfo, setActiveTemplateInfo] = useState(null);

  const [isLoadingSchemes, setIsLoadingSchemes] = useState(true);
  const [isLoadingRules, setIsLoadingRules] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConditionsGuide, setShowConditionsGuide] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    ruleName: '',
    field: 'annualFamilyIncome',
    operator: '<=',
    expectedValue: '250000',
    description: 'Family income below ₹2.5 lakh',
    isMandatory: true,
    isActive: true,
  });

  // 1. Load All Schemes
  useEffect(() => {
    setIsLoadingSchemes(true);
    api
      .get('/schemes?limit=100')
      .then((res) => {
        if (res.data.success && res.data.data.length > 0) {
          setSchemes(res.data.data);
          const matched = querySchemeId && res.data.data.find((s) => s._id === querySchemeId);
          setSelectedSchemeId(matched ? matched._id : res.data.data[0]._id);
        }
      })
      .catch((err) => {
        console.error(err);
        showToast('Failed to load schemes directory', 'error');
      })
      .finally(() => setIsLoadingSchemes(false));
  }, [querySchemeId]);

  // 2. Fetch Rules for selected scheme
  const fetchRulesForScheme = async (schemeId, preserveRuleId = null) => {
    if (!schemeId) return;
    setIsLoadingRules(true);
    try {
      const res = await api.get(`/eligibility-rules/scheme/${schemeId}`);
      if (res.data.success) {
        const fetchedRules = res.data.data;
        setRules(fetchedRules);

        // If specific rule was requested to remain selected
        if (preserveRuleId) {
          handleSelectOption(preserveRuleId, fetchedRules);
          return;
        }

        // If scheme already has configured rules, select the first configured rule
        if (fetchedRules.length > 0) {
          handleSelectOption(fetchedRules[0]._id, fetchedRules);
        } else {
          // Default to the first common condition (Age or Income)
          handleSelectOption('TEMPLATE_INCOME', []);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load rules for this scheme', 'error');
    } finally {
      setIsLoadingRules(false);
    }
  };

  useEffect(() => {
    if (selectedSchemeId) {
      fetchRulesForScheme(selectedSchemeId);
    }
  }, [selectedSchemeId]);

  // Handle Selection from Dropdown 2 (Configured rule, Common condition template, or Custom)
  const handleSelectOption = (optionId, currentRules = rules) => {
    setSelectedRuleId(optionId);

    // Case 1: Selected an existing saved rule for this scheme
    const existingRule = currentRules.find((r) => r._id === optionId);
    if (existingRule) {
      setActiveTemplateInfo(null);
      let valStr = existingRule.expectedValue;
      if (Array.isArray(valStr)) valStr = valStr.join(', ');
      else if (typeof valStr === 'object') valStr = JSON.stringify(valStr);
      else valStr = String(valStr);

      setFormData({
        ruleName: existingRule.ruleName,
        field: existingRule.field,
        operator: existingRule.operator,
        expectedValue: valStr,
        description: existingRule.description || '',
        isMandatory: Boolean(existingRule.isMandatory),
        isActive: Boolean(existingRule.isActive),
      });
      return;
    }

    // Case 2: Selected one of the 15 Common Eligibility Conditions
    const template = COMMON_ELIGIBILITY_CONDITIONS.find((c) => c.id === optionId);
    if (template) {
      setActiveTemplateInfo(template);
      const scheme = schemes.find((s) => s._id === selectedSchemeId);
      const ruleTitle = `${template.name} Requirement (${template.example})`;

      setFormData({
        ruleName: ruleTitle,
        field: template.field,
        operator: template.operator,
        expectedValue: template.expectedValue,
        description: template.description,
        isMandatory: template.isMandatory,
        isActive: true,
      });
      return;
    }

    // Case 3: Custom New Rule
    setActiveTemplateInfo(null);
    setFormData({
      ruleName: '',
      field: 'annualFamilyIncome',
      operator: '<=',
      expectedValue: '',
      description: '',
      isMandatory: true,
      isActive: true,
    });
  };

  // Save Rule (POST if template or custom, PUT if existing saved rule)
  const handleSaveRule = async (e) => {
    e.preventDefault();
    if (!formData.ruleName || !formData.field || !formData.operator || formData.expectedValue === '') {
      showToast('Please fill all mandatory rule details', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      // Parse expected value according to operator
      let parsedVal = formData.expectedValue;
      if (['<', '<=', '>', '>='].includes(formData.operator)) {
        parsedVal = Number(formData.expectedValue);
      } else if (['IN', 'NOT_IN'].includes(formData.operator)) {
        parsedVal = formData.expectedValue.split(',').map((s) => s.trim());
      } else if (formData.operator === 'BETWEEN') {
        parsedVal = formData.expectedValue.split(',').map(Number);
      } else if (formData.field === 'disabilityStatus') {
        parsedVal = formData.expectedValue === 'true' || formData.expectedValue === '1';
      }

      const payload = {
        schemeId: selectedSchemeId,
        ruleName: formData.ruleName.trim(),
        field: formData.field,
        operator: formData.operator,
        expectedValue: parsedVal,
        description: formData.description,
        isMandatory: formData.isMandatory,
        isActive: formData.isActive,
      };

      const isExistingDbRule = rules.some((r) => r._id === selectedRuleId);

      if (isExistingDbRule) {
        await api.put(`/eligibility-rules/${selectedRuleId}`, payload);
        showToast('Rule updated and applied successfully!', 'success');
        fetchRulesForScheme(selectedSchemeId, selectedRuleId);
      } else {
        const res = await api.post('/eligibility-rules', payload);
        showToast('Rule saved and applied to scheme!', 'success');
        fetchRulesForScheme(selectedSchemeId, res.data.data?._id);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save eligibility rule', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Rule
  const handleDeleteRule = async () => {
    const isExistingDbRule = rules.some((r) => r._id === selectedRuleId);
    if (!isExistingDbRule) return;

    if (!window.confirm(`Are you sure you want to delete rule "${formData.ruleName}"?`)) return;

    setIsDeleting(true);
    try {
      const res = await api.delete(`/eligibility-rules/${selectedRuleId}`);
      if (res.data.success) {
        showToast('Rule deleted from scheme', 'success');
        fetchRulesForScheme(selectedSchemeId);
      }
    } catch (err) {
      showToast('Failed to delete rule', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedScheme = schemes.find((s) => s._id === selectedSchemeId);
  const isExistingDbRule = rules.some((r) => r._id === selectedRuleId);

  // Preview generated text
  const previewText = `Condition: Citizen's ${formData.field} must satisfy [ ${formData.operator} ${formData.expectedValue} ]`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-blue-100 text-gov-secondary">
              <Sliders className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-gov-secondary uppercase tracking-wider">
              Rule-Based Eligibility Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Eligibility Rule Builder
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Select a scheme, pick from the <strong>15 common eligibility condition templates</strong> (or configured scheme rules) to immediately open the editor, adjust parameters, and save.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setShowConditionsGuide(!showConditionsGuide)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-gov-secondary text-xs font-bold transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{showConditionsGuide ? 'Hide' : 'View'} 15 Conditions Reference</span>
          </button>

          {selectedScheme && (
            <Link
              to={`/schemes/${selectedScheme._id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Show Scheme Page</span>
            </Link>
          )}
        </div>
      </div>

      {/* 15 COMMON CONDITIONS REFERENCE TABLE (Collapsible) */}
      {showConditionsGuide && (
        <div className="bg-white rounded-2xl border border-blue-200 p-5 shadow-sm space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-gov-secondary" />
              <h3 className="font-bold text-sm text-gov-primary">
                Common Eligibility Conditions Reference Guide
              </h3>
            </div>
            <span className="text-xs text-slate-500">Click any condition to immediately load it into Dropdown 2</span>
          </div>

          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 w-12">No.</th>
                  <th className="px-3 py-2 w-44">Eligibility Condition</th>
                  <th className="px-3 py-2">Standard Example</th>
                  <th className="px-3 py-2 w-28 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {COMMON_ELIGIBILITY_CONDITIONS.map((cond) => (
                  <tr key={cond.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-3 py-2 font-bold text-slate-500">{cond.number}</td>
                    <td className="px-3 py-2 font-bold text-slate-900">{cond.name}</td>
                    <td className="px-3 py-2 text-slate-600">{cond.example}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectOption(cond.id);
                          setShowConditionsGuide(false);
                          showToast(`Loaded ${cond.name} into Rule Editor`, 'info');
                        }}
                        className="px-2.5 py-1 rounded bg-blue-50 hover:bg-gov-secondary hover:text-white text-gov-secondary font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Apply Rule &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DUAL DROPDOWN SELECTOR BAR */}
      <div className="bg-white rounded-2xl border border-gov-border p-5 shadow-subtle space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Dropdown 1: Target Scheme */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gov-primary uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-gov-secondary" />
                <span>1. Select Scheme:</span>
              </span>
              <span className="text-[11px] text-slate-400 font-semibold normal-case">
                {schemes.length} schemes available
              </span>
            </label>

            {isLoadingSchemes ? (
              <div className="h-10 bg-slate-100 animate-pulse rounded-xl" />
            ) : (
              <select
                value={selectedSchemeId}
                onChange={(e) => {
                  setSelectedSchemeId(e.target.value);
                  setSearchParams({ schemeId: e.target.value });
                }}
                className="w-full text-xs rounded-xl border border-gov-border p-3 bg-slate-50 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary text-slate-900 shadow-xs cursor-pointer"
              >
                {schemes.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.schemeName} ({s.category})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Dropdown 2: Target Rule to Edit / Apply */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gov-primary uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-gov-secondary" />
                <span>2. Select Rule to Edit & Apply:</span>
              </span>
              <span className="text-[11px] text-gov-secondary font-bold normal-case">
                {rules.length} configured rule(s)
              </span>
            </label>

            {isLoadingRules ? (
              <div className="h-10 bg-slate-100 animate-pulse rounded-xl" />
            ) : (
              <select
                value={selectedRuleId}
                onChange={(e) => handleSelectOption(e.target.value)}
                className="w-full text-xs rounded-xl border border-blue-200 p-3 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-gov-secondary text-slate-900 shadow-xs cursor-pointer"
              >
                {/* 1. Saved Rules currently applied to this scheme */}
                {rules.length > 0 && (
                  <optgroup label={`✅ Currently Configured Scheme Rules (${rules.length})`}>
                    {rules.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.ruleName} — [{r.field} {r.operator} {JSON.stringify(r.expectedValue)}] {r.isMandatory ? '★ Mandatory' : '(Advisory)'}
                      </option>
                    ))}
                  </optgroup>
                )}

                {/* 2. The 15 Standard Common Eligibility Conditions */}
                <optgroup label="📋 Standard Common Eligibility Conditions (Select to Open & Configure)">
                  {COMMON_ELIGIBILITY_CONDITIONS.map((cond) => (
                    <option key={cond.id} value={cond.id}>
                      {cond.number}. {cond.name} — Example: {cond.example}
                    </option>
                  ))}
                </optgroup>

                {/* 3. Custom Blank Template */}
                <option value="CUSTOM_NEW">➕ + Custom Condition (Blank Form)</option>
              </select>
            )}
          </div>
        </div>

        {/* Selected condition context ribbon */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Selected Condition Source:</span>
            {isExistingDbRule ? (
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Saved in Database for "{selectedScheme?.schemeName}"
              </span>
            ) : activeTemplateInfo ? (
              <span className="font-bold text-gov-secondary bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Template #{activeTemplateInfo.number}: {activeTemplateInfo.name} ({activeTemplateInfo.example})
              </span>
            ) : (
              <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Custom Condition Template
              </span>
            )}
          </div>

          <span className="text-[11px] text-slate-400">
            Edit parameters below and click "Save & Apply Rule"
          </span>
        </div>
      </div>

      {/* CONDITION EDITOR (Opens immediately populated for the selected rule/template) */}
      <div className="bg-white rounded-2xl border border-gov-border shadow-subtle overflow-hidden">
        {/* Editor Header */}
        <div className="bg-slate-50/80 px-6 py-4 border-b border-gov-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`p-1.5 rounded-lg ${
                isExistingDbRule
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-blue-100 text-gov-secondary'
              }`}
            >
              <Sliders className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isExistingDbRule ? 'Editing Configured Scheme Rule' : 'Condition Template Formulation'}
              </div>
              <h2 className="text-base font-extrabold text-slate-900">
                {isExistingDbRule
                  ? `Editing Saved Rule: "${formData.ruleName}"`
                  : `Configuring Condition for: "${selectedScheme?.schemeName || 'Scheme'}"`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isExistingDbRule && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteRule}
                isLoading={isDeleting}
                className="text-rose-600 hover:bg-rose-50 border-rose-200 gap-1 text-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Rule</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectOption('CUSTOM_NEW')}
              className="gap-1 text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Blank Custom Rule</span>
            </Button>
          </div>
        </div>

        {/* Editor Form */}
        <form onSubmit={handleSaveRule} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <Input
                label="Rule Name / Public Condition Title"
                value={formData.ruleName}
                onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
                placeholder="e.g. Age Criteria (Applicant must be 18–60 years old)"
                required
              />
            </div>

            <Select
              label="Citizen Profile Field"
              value={formData.field}
              onChange={(e) => setFormData({ ...formData, field: e.target.value })}
              options={RULE_FIELDS}
              required
            />

            <Select
              label="Evaluation Operator"
              value={formData.operator}
              onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
              options={OPERATORS}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Target Threshold Value <span className="text-gov-error">*</span>
              </label>
              <input
                type="text"
                value={formData.expectedValue}
                onChange={(e) => setFormData({ ...formData, expectedValue: e.target.value })}
                placeholder="e.g. 18, 60 or 250000 or Farmer or Female"
                className="w-full text-xs rounded-lg border border-gov-border p-2 focus:outline-none focus:ring-2 focus:ring-gov-secondary font-mono bg-white"
                required
              />
              <span className="text-[10px] text-gov-muted mt-1 block">
                For BETWEEN or IN, separate values with commas (e.g. 18, 60 or SC, ST, OBC).
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Beneficiary Explanation Note
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Applicant must be between 18 and 60 years old to be considered eligible."
              className="w-full text-xs rounded-lg border border-gov-border p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
            />
          </div>

          {/* Live Preview Box */}
          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 text-blue-900 text-xs space-y-1">
            <span className="font-bold flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-gov-secondary" />
              Live Evaluation Logic Preview:
            </span>
            <code className="block bg-white p-2.5 rounded-lg border border-blue-200 text-slate-900 font-mono text-[12px] font-bold">
              {previewText}
            </code>
          </div>

          {/* Condition Toggles & Save Button Bar */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isMandatory}
                  onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })}
                  className="rounded text-gov-secondary w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-900">Mandatory Condition (Strict pass required)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-gov-secondary w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-900">Active (Apply during evaluation)</span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSaving}
                className="gap-2 shadow-sm font-bold text-sm px-6 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isExistingDbRule ? 'Save & Apply Rule' : 'Save Rule to Scheme'}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* CONFIGURED RULES FOR THIS SCHEME */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gov-primary flex items-center gap-2">
            <Layers className="w-4 h-4 text-gov-secondary" />
            <span>Configured Rules Suite for "{selectedScheme?.schemeName || 'Scheme'}" ({rules.length})</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">Click any rule to load and edit in Dropdown 2</span>
        </div>

        {rules.length === 0 ? (
          <EmptyState
            title="No rules configured for this scheme yet"
            description="Select any of the 15 Common Eligibility Conditions in Dropdown 2 above and click 'Save Rule to Scheme' to apply it."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rules.map((rule) => {
              const isSelected = selectedRuleId === rule._id;
              return (
                <div
                  key={rule._id}
                  onClick={() => handleSelectOption(rule._id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-gov-secondary bg-blue-50/40 shadow-sm ring-2 ring-gov-secondary/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900">{rule.ruleName}</span>
                      <div className="flex items-center gap-1.5">
                        {rule.isMandatory ? (
                          <Badge variant="danger" size="xs">Mandatory</Badge>
                        ) : (
                          <Badge variant="neutral" size="xs">Advisory</Badge>
                        )}
                        {!rule.isActive && (
                          <Badge variant="warning" size="xs">Inactive</Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-1">
                      {rule.description || 'No description note'}
                    </p>

                    <div className="flex items-center gap-1.5 pt-1 font-mono text-[11px]">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-bold">
                        {rule.field}
                      </span>
                      <span className="text-gov-secondary font-black">{rule.operator}</span>
                      <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200 font-bold">
                        {JSON.stringify(rule.expectedValue)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-gov-secondary">
                    <span>{isSelected ? 'Currently Editing' : 'Click to Edit'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRulesPage;
