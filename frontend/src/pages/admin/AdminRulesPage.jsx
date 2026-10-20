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
  CreditCard,
  FolderCheck,
  Users,
  GraduationCap,
  MapPin,
  Briefcase,
  Calendar,
  IndianRupee,
  ShieldAlert,
  Settings2,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

// 15 Profile & Criteria Fields
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

// Bank Options for Condition #13
const BANK_OPTIONS = [
  'Any Scheduled Commercial Bank (Aadhaar Seeded & DBT Active)',
  'State Bank of India (SBI)',
  'Punjab National Bank (PNB)',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'Bank of India',
  'Central Bank of India',
  'Indian Bank',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Regional Rural Bank (Gramin Bank / RRB)',
  'Post Office Savings Bank (India Post Payments Bank - IPPB)',
  'District Central Cooperative Bank (DCCB)',
  'PM Jan Dhan Yojana (PMJDY) Zero Balance Savings Account',
];

// Document Options for Condition #14
const DOCUMENT_OPTIONS = [
  'Aadhaar Card (UIDAI Verified)',
  'Income Certificate from Tehsildar / Competent Authority',
  'Caste / Community Certificate (SC/ST/OBC/EWS)',
  'Land Revenue Records (RoR / 7-12 / Khasra-Khatauni / Patta)',
  'Active Bank Passbook (with IFSC and Account No.)',
  'Ration Card (BPL / AAY / Antyodaya / PHH)',
  'Domicile / Permanent Residence Certificate',
  'Disability Certificate / Unique Disability ID (UDID)',
  'Age / Date of Birth Certificate',
  'Educational Marksheet / Degree Certificate',
  'Self-Declaration Affidavit of Unemployment',
  'Farmer Registration / PM-KISAN ID Card',
  'MGNREGA Job Card',
];

// States List for Condition #3
const INDIAN_STATES = [
  'All India (Central / Nationwide Scheme)',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi (NCT)',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

// Education Levels for Condition #5
const EDUCATION_OPTIONS = [
  'No Formal Education Barrier',
  'Primary School (Class 5 Passed)',
  'Middle School (Class 8 Passed)',
  'Class 10 (Secondary School Passed)',
  'Class 12 (Higher Secondary / Intermediate)',
  'ITI / Polytechnic Diploma',
  'Graduate (Bachelor Degree - BA, BSc, BCom, BTech)',
  'Post Graduate (Master Degree / PhD)',
];

// Occupations for Condition #6
const OCCUPATION_OPTIONS = [
  'Farmer / Agricultural Cultivator',
  'Agricultural Wage Laborer',
  'Street Vendor / Hawker',
  'Artisan / Handloom Weaver',
  'Construction / Unorganized Worker',
  'Student / Scholar',
  'Self-Employed Micro-Entrepreneur',
  'Fisherman / Marine Worker',
  'Healthcare / ASHA / Anganwadi Worker',
  'Sanitation / Municipal Worker',
  'Unemployed Citizen',
];

// Social Categories for Condition #7
const COMMUNITY_OPTIONS = ['SC', 'ST', 'OBC', 'EWS', 'General', 'Notified Minority'];

// Family Household Status for Condition #11
const FAMILY_STATUS_OPTIONS = [
  'Antyodaya Anna Yojana (AAY - Poorest of Poor)',
  'Below Poverty Line (BPL Ration Card)',
  'Priority Household (PHH Ration Card)',
  'Female-Headed Single Parent Household',
  'Destitute / Homeless Household',
];

// Existing Benefits Exclusions for Condition #12
const BENEFIT_EXCLUSION_OPTIONS = [
  'Must not receive Central / State Old Age or Widow Pension',
  'Must not be an active Income Tax Payee',
  'Must not be a Regular Government or PSU Employee',
  'Must not receive PM-KISAN or duplicate DBT benefits',
  'Must not own motorized commercial agricultural equipment',
];

// The 15 Standard Common Eligibility Conditions
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
    expectedValue: 'All India (Central / Nationwide Scheme)',
    description: 'Applicant must be a resident of the specified State / Territory.',
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
    expectedValue: 'Class 10 (Secondary School Passed)',
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
    expectedValue: 'Farmer / Agricultural Cultivator',
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
    expectedValue: 'Cultivable Agricultural Landholder',
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
    expectedValue: 'Below Poverty Line (BPL Ration Card)',
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
    expectedValue: 'Must not receive Central / State Old Age or Widow Pension',
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
    expectedValue: 'Any Scheduled Commercial Bank (Aadhaar Seeded & DBT Active)',
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
    expectedValue: 'Aadhaar Card (UIDAI Verified), Income Certificate from Tehsildar / Competent Authority',
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
    expectedValue: 'Rural Gram Panchayat Areas Only',
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
  const [showRawValueInput, setShowRawValueInput] = useState(false);

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
          // Default to Annual Income condition
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

  // Handle Selection from Dropdown 2
  const handleSelectOption = (optionId, currentRules = rules) => {
    setSelectedRuleId(optionId);

    // Case 1: Selected an existing saved rule
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

  // Helper for multi-select checklist toggles
  const handleToggleMultiItem = (item) => {
    const currentItems = formData.expectedValue
      ? formData.expectedValue.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    let updatedItems;
    if (currentItems.includes(item)) {
      updatedItems = currentItems.filter((i) => i !== item);
    } else {
      updatedItems = [...currentItems, item];
    }
    setFormData({ ...formData, expectedValue: updatedItems.join(', ') });
  };

  // Helper to parse age range (min, max)
  const getAgeValues = () => {
    if (formData.field !== 'age') return { min: 18, max: 60 };
    const parts = String(formData.expectedValue).split(',').map((s) => parseInt(s.trim(), 10));
    return {
      min: !isNaN(parts[0]) ? parts[0] : 18,
      max: parts.length > 1 && !isNaN(parts[1]) ? parts[1] : 60,
    };
  };

  const handleUpdateAge = (type, val) => {
    const current = getAgeValues();
    const updated = {
      ...current,
      [type]: Math.max(0, parseInt(val, 10) || 0),
    };
    setFormData({
      ...formData,
      operator: 'BETWEEN',
      expectedValue: `${updated.min}, ${updated.max}`,
      description: `Applicant must be between ${updated.min} and ${updated.max} years of age.`,
    });
  };

  // Save Rule
  const handleSaveRule = async (e) => {
    e.preventDefault();
    if (!formData.ruleName || !formData.field || !formData.operator || formData.expectedValue === '') {
      showToast('Please fill all mandatory rule details', 'warning');
      return;
    }

    setIsSaving(true);
    try {
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

  // Live preview string
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
            Select a scheme, pick from the <strong>15 common eligibility condition templates</strong>, and customize condition parameters using tailored form controls (bank dropdowns, certificate checklists, age ranges, etc.).
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
            <span className="text-xs text-slate-500">Click any condition to immediately configure it in Dropdown 2</span>
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
                {/* 1. Saved Rules currently configured in MongoDB */}
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
            <span className="font-semibold text-slate-500">Active Condition Field:</span>
            {isExistingDbRule ? (
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Saved in Database: {formData.ruleName}
              </span>
            ) : activeTemplateInfo ? (
              <span className="font-bold text-gov-secondary bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Condition #{activeTemplateInfo.number}: {activeTemplateInfo.name} ({activeTemplateInfo.example})
              </span>
            ) : (
              <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Custom Condition Form
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowRawValueInput(!showRawValueInput)}
            className="text-[11px] font-semibold text-gov-secondary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Settings2 className="w-3 h-3" />
            <span>{showRawValueInput ? 'Use Tailored UI Controls' : 'Use Raw Text Value Input'}</span>
          </button>
        </div>
      </div>

      {/* DYNAMIC CONDITION EDITOR PANEL */}
      <div className="bg-white rounded-2xl border border-gov-border shadow-subtle overflow-hidden">
        {/* Editor Header */}
        <div className="bg-slate-50/80 px-6 py-4 border-b border-gov-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`p-1.5 rounded-lg ${
                isExistingDbRule ? 'bg-emerald-100 text-emerald-900' : 'bg-blue-100 text-gov-secondary'
              }`}
            >
              <Sliders className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isExistingDbRule ? 'Active Rule Editor' : 'Condition Configuration Desk'}
              </div>
              <h2 className="text-base font-extrabold text-slate-900">
                {isExistingDbRule
                  ? `Editing Saved Rule: "${formData.ruleName}"`
                  : `Configuring Rule for: "${selectedScheme?.schemeName || 'Scheme'}"`}
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
        <form onSubmit={handleSaveRule} className="p-6 space-y-6">
          {/* Top metadata row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <Input
                label="Rule Name / Public Condition Title"
                value={formData.ruleName}
                onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
                placeholder="e.g. Age Limit (Applicant must be 18–60 years old)"
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
                Raw Value Output <span className="text-gov-error">*</span>
              </label>
              <input
                type="text"
                value={formData.expectedValue}
                onChange={(e) => setFormData({ ...formData, expectedValue: e.target.value })}
                placeholder="e.g. 18, 60 or 250000 or Female"
                className="w-full text-xs rounded-lg border border-gov-border p-2 focus:outline-none focus:ring-2 focus:ring-gov-secondary font-mono bg-slate-50 font-bold"
                required
              />
            </div>
          </div>

          {/* DYNAMIC FIELD CONTROL WIDGET (Changes specifically based on selected rule) */}
          {!showRawValueInput && (
            <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-3">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                <span className="text-xs font-bold text-gov-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-gov-secondary" />
                  <span>Tailored Input Controls for "{formData.field}":</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Interacting below automatically updates rule value</span>
              </div>

              {/* 1. BANK ACCOUNT WIDGET (Condition #13 requested by user) */}
              {formData.field === 'bankAccount' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-gov-secondary" />
                    <span>Select Eligible Bank / Account Requirement:</span>
                  </label>
                  <select
                    value={formData.expectedValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expectedValue: e.target.value,
                        operator: '==',
                        description: `Applicant must have an eligible account: ${e.target.value}.`,
                      })
                    }
                    className="w-full text-xs rounded-xl border border-blue-300 p-3 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-gov-secondary shadow-xs cursor-pointer"
                  >
                    {BANK_OPTIONS.map((bank, idx) => (
                      <option key={idx} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Choose one bank or DBT account requirement from the dropdown above.
                  </p>
                </div>
              )}

              {/* 2. DOCUMENTS & CERTIFICATES WIDGET (Condition #14 requested by user) */}
              {formData.field === 'documents' && (
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FolderCheck className="w-4 h-4 text-gov-secondary" />
                      <span>Select Required Documents & Certificates (Multiple Checklist):</span>
                    </span>
                    <span className="text-[11px] text-gov-secondary font-bold">
                      {formData.expectedValue.split(',').filter(Boolean).length} Selected
                    </span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-3 bg-white rounded-xl border border-blue-200">
                    {DOCUMENT_OPTIONS.map((doc, idx) => {
                      const isChecked = formData.expectedValue.includes(doc);
                      return (
                        <label
                          key={idx}
                          className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-blue-50/70 border-gov-secondary text-gov-primary font-bold'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleMultiItem(doc)}
                            className="mt-0.5 rounded text-gov-secondary"
                          />
                          <span className="leading-tight">{doc}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Check one, two, or multiple documents that the citizen must provide.
                  </p>
                </div>
              )}

              {/* 3. AGE RANGE WIDGET (Condition #1) */}
              {formData.field === 'age' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gov-secondary" />
                    <span>Set Eligible Age Range (Years):</span>
                  </label>

                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">Minimum Age:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="120"
                          value={getAgeValues().min}
                          onChange={(e) => handleUpdateAge('min', e.target.value)}
                          className="w-full text-xs font-bold p-2.5 rounded-lg border border-blue-300 bg-white"
                        />
                        <span className="text-xs text-slate-500 font-semibold">Years</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">Maximum Age:</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="120"
                          value={getAgeValues().max}
                          onChange={(e) => handleUpdateAge('max', e.target.value)}
                          className="w-full text-xs font-bold p-2.5 rounded-lg border border-blue-300 bg-white"
                        />
                        <span className="text-xs text-slate-500 font-semibold">Years</span>
                      </div>
                    </div>
                  </div>

                  {/* Age Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-500">Quick Age Presets:</span>
                    {[
                      { label: '18 – 60 (Working Age)', min: 18, max: 60 },
                      { label: '18 – 35 (Youth / Skill)', min: 18, max: 35 },
                      { label: '60+ (Senior Citizen)', min: 60, max: 100 },
                      { label: '0 – 18 (Children)', min: 0, max: 18 },
                    ].map((ap, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            operator: 'BETWEEN',
                            expectedValue: `${ap.min}, ${ap.max}`,
                            description: `Applicant must be between ${ap.min} and ${ap.max} years of age.`,
                          });
                        }}
                        className="px-2 py-0.5 rounded bg-white border border-blue-200 hover:border-gov-secondary text-[11px] font-semibold text-slate-700 cursor-pointer"
                      >
                        {ap.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. ANNUAL FAMILY INCOME WIDGET (Condition #2) */}
              {formData.field === 'annualFamilyIncome' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4 text-gov-secondary" />
                    <span>Set Annual Family Income Ceiling:</span>
                  </label>

                  <div className="flex items-center gap-3 max-w-sm">
                    <div className="relative w-full">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">₹</span>
                      <input
                        type="number"
                        step="10000"
                        value={formData.expectedValue}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            operator: '<=',
                            expectedValue: e.target.value,
                            description: `Annual family income must not exceed ₹${Number(e.target.value || 0).toLocaleString('en-IN')}.`,
                          })
                        }
                        className="w-full pl-7 pr-3 py-2 text-xs font-bold rounded-lg border border-blue-300 bg-white"
                        placeholder="250000"
                      />
                    </div>
                  </div>

                  {/* Quick Income Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-500">Quick Ceilings:</span>
                    {[
                      { label: '₹1.0 Lakh', val: '100000' },
                      { label: '₹2.0 Lakh', val: '200000' },
                      { label: '₹2.5 Lakh (Standard)', val: '250000' },
                      { label: '₹3.0 Lakh', val: '300000' },
                      { label: '₹5.0 Lakh', val: '500000' },
                      { label: '₹8.0 Lakh (EWS Central)', val: '800000' },
                    ].map((inc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            operator: '<=',
                            expectedValue: inc.val,
                            description: `Family income below ₹${(Number(inc.val) / 100000).toFixed(1)} lakh.`,
                          });
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                          formData.expectedValue === inc.val
                            ? 'bg-gov-secondary text-white'
                            : 'bg-white border border-blue-200 text-slate-700 hover:border-gov-secondary'
                        }`}
                      >
                        {inc.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. GENDER WIDGET (Condition #4) */}
              {formData.field === 'gender' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-gov-secondary" />
                    <span>Select Target Gender:</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Female / Women Only', val: 'Female', desc: 'Designated exclusively for female beneficiaries' },
                      { label: 'Male / Men Only', val: 'Male', desc: 'Designated for male applicants' },
                      { label: 'Transgender Persons', val: 'Transgender', desc: 'Designated for transgender beneficiaries' },
                      { label: 'All Genders (Open)', val: 'All Genders', desc: 'Open to all genders' },
                    ].map((g, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            expectedValue: g.val,
                            operator: g.val === 'All Genders' ? 'IN' : '==',
                            description: g.desc,
                          })
                        }
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          formData.expectedValue === g.val
                            ? 'bg-gov-secondary text-white shadow-xs'
                            : 'bg-white border border-blue-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. SOCIAL CATEGORY WIDGET (Condition #7) */}
              {formData.field === 'community' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-gov-secondary" />
                    <span>Select Eligible Social Categories (Multi-Select Checklist):</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMUNITY_OPTIONS.map((comm, idx) => {
                      const isSelected = formData.expectedValue.includes(comm);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleToggleMultiItem(comm)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-gov-secondary text-white border-gov-secondary shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <input type="checkbox" checked={isSelected} readOnly className="rounded pointer-events-none" />
                          <span>{comm}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Applicant must belong to one of the selected categories.
                  </p>
                </div>
              )}

              {/* 7. RESIDENCE / STATE WIDGET (Condition #3) */}
              {formData.field === 'state' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gov-secondary" />
                    <span>Select Eligible State / Territory Residence:</span>
                  </label>
                  <select
                    value={formData.expectedValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expectedValue: e.target.value,
                        operator: e.target.value.includes('All India') ? 'EXISTS' : '==',
                        description: `Applicant must be a permanent resident of ${e.target.value}.`,
                      })
                    }
                    className="w-full text-xs rounded-xl border border-blue-300 p-3 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-gov-secondary shadow-xs cursor-pointer"
                  >
                    {INDIAN_STATES.map((st, idx) => (
                      <option key={idx} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 8. EDUCATION LEVEL WIDGET (Condition #5) */}
              {formData.field === 'education' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-gov-secondary" />
                    <span>Select Minimum / Accepted Education Qualifications:</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {EDUCATION_OPTIONS.map((edu, idx) => {
                      const isSelected = formData.expectedValue.includes(edu);
                      return (
                        <label
                          key={idx}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50/70 border-gov-secondary text-gov-primary font-bold'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleMultiItem(edu)}
                            className="rounded text-gov-secondary"
                          />
                          <span>{edu}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 9. OCCUPATION WIDGET (Condition #6) */}
              {formData.field === 'occupation' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-gov-secondary" />
                    <span>Select Target Occupations:</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {OCCUPATION_OPTIONS.map((occ, idx) => {
                      const isSelected = formData.expectedValue.includes(occ);
                      return (
                        <label
                          key={idx}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50/70 border-gov-secondary text-gov-primary font-bold'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleMultiItem(occ)}
                            className="rounded text-gov-secondary"
                          />
                          <span className="truncate">{occ}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 10. EMPLOYMENT STATUS WIDGET (Condition #8) */}
              {formData.field === 'employmentStatus' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-gov-secondary" />
                    <span>Select Required Employment Status:</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Unemployed', 'Self-Employed', 'Daily Wage Worker', 'Employed (Salaried)', 'Student'].map(
                      (emp, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              expectedValue: emp,
                              operator: '==',
                              description: `Applicant must be currently ${emp.toLowerCase()}.`,
                            })
                          }
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            formData.expectedValue === emp
                              ? 'bg-gov-secondary text-white border-gov-secondary shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {emp}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* 11. DISABILITY STATUS WIDGET (Condition #9) */}
              {formData.field === 'disabilityStatus' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-gov-secondary" />
                    <span>Set Disability Condition:</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Must have Certified Benchmark Disability (>= 40% PwD)', val: 'true' },
                      { label: 'Not Mandatory / Open to All Citizens', val: 'false' },
                    ].map((d, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            expectedValue: d.val,
                            operator: '==',
                            description: d.label,
                          })
                        }
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          formData.expectedValue === d.val
                            ? 'bg-gov-secondary text-white border-gov-secondary shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 12. LAND OWNERSHIP WIDGET (Condition #10) */}
              {formData.field === 'landOwnership' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-gov-secondary" />
                    <span>Select Agricultural Land Holding Category:</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      'Cultivable Agricultural Landholder (PM-KISAN Standard)',
                      'Marginal Farmer (Holding up to 1 Hectare / 2.5 Acres)',
                      'Small Farmer (Holding 1 to 2 Hectares / 5 Acres)',
                      'Landless Agricultural Tenant / Cultivator',
                    ].map((land, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            expectedValue: land,
                            operator: '==',
                            description: `Applicant must be: ${land}.`,
                          })
                        }
                        className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer ${
                          formData.expectedValue === land
                            ? 'bg-gov-secondary text-white border-gov-secondary shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {land}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 13. FAMILY STATUS WIDGET (Condition #11) */}
              {formData.field === 'familyStatus' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-gov-secondary" />
                    <span>Select Recognized Household Status Categories:</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {FAMILY_STATUS_OPTIONS.map((fam, idx) => {
                      const isSelected = formData.expectedValue.includes(fam);
                      return (
                        <label
                          key={idx}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50/70 border-gov-secondary text-gov-primary font-bold'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleMultiItem(fam)}
                            className="rounded text-gov-secondary"
                          />
                          <span>{fam}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 14. EXISTING BENEFITS WIDGET (Condition #12) */}
              {formData.field === 'existingBenefits' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-gov-secondary" />
                    <span>Select Ineligibility / Benefit Exclusions (Must NOT have):</span>
                  </label>
                  <div className="space-y-2">
                    {BENEFIT_EXCLUSION_OPTIONS.map((excl, idx) => {
                      const isSelected = formData.expectedValue.includes(excl);
                      return (
                        <label
                          key={idx}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-rose-50/70 border-rose-400 text-rose-900 font-bold'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleMultiItem(excl)}
                            className="rounded text-rose-600"
                          />
                          <span>{excl}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 15. LOCATION / REGIONAL DISTRICT WIDGET (Condition #15) */}
              {formData.field === 'district' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gov-secondary" />
                    <span>Select Eligible Regional Demarcation:</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      'Rural Gram Panchayat Areas Only',
                      'Urban Municipalities / Slum Clusters Only',
                      'Notified NITI Aayog Aspirational Districts',
                      'All Regional Districts (No Geographic Barrier)',
                    ].map((loc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            expectedValue: loc,
                            operator: 'EXISTS',
                            description: `Scheme applies to: ${loc}.`,
                          })
                        }
                        className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer ${
                          formData.expectedValue === loc
                            ? 'bg-gov-secondary text-white border-gov-secondary shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Beneficiary Explanation Note
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Beneficiary must satisfy the condition parameters configured above."
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
                      <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200 font-bold max-w-xs truncate">
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
