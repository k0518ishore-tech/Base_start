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
  EyeOff,
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

// 15 Profile & Criteria Fields (For Custom Blank Rule creation)
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
  'Ration Card (BPL / Antyodaya / Priority Household)',
  'Active Bank Account Passbook / Cancelled Cheque',
  'Disability Certificate from Medical Board (>= 40% PwD)',
  'Domicile / Residence Certificate of State',
  'Class 10 / 12 Educational Marks Sheet',
  'Farmer Identity Card / PM-KISAN Registration Card',
  'E-Shram Card / Registered Unorganized Worker ID',
  'Street Vendor Identity Card / Vending Certificate',
  'Passport Size Photographs & Self Declaration',
];

// Indian States and UTs for Condition #3
const INDIAN_STATES = [
  'All India (Any Indian State / UT)',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
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
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

// Social Categories for Condition #7
const COMMUNITY_OPTIONS = ['SC', 'ST', 'OBC', 'EWS', 'General', 'Minority Community'];

// Education Options for Condition #5
const EDUCATION_OPTIONS = [
  'Class 5 Passed',
  'Class 8 Passed',
  'Class 10 (Secondary School Examination)',
  'Class 12 (Higher Secondary / Intermediate)',
  'Diploma / ITI Certification',
  "Graduate (Bachelor's Degree)",
  "Post Graduate / Master's Degree / Doctorate",
];

// Occupation Options for Condition #6
const OCCUPATION_OPTIONS = [
  'Small / Marginal Farmer',
  'Agricultural Laborer',
  'Artisan / Traditional Craftsman / Weaver',
  'Street Vendor / Small Urban Hawker',
  'Construction / Daily Wage Laborer',
  'Gig & Platform Worker',
  'Self-Employed Micro-Entrepreneur',
  'Unemployed Youth / Jobseeker',
  'Homemaker / Domestic Caregiver',
];

// Family Status Options for Condition #11
const FAMILY_STATUS_OPTIONS = [
  'Antyodaya Anna Yojana (AAY - Poorest of Poor)',
  'Below Poverty Line (BPL Card Holder)',
  'Priority Household (PHH)',
  'Female-Headed Household (Single Mother / Widow)',
  'Senior Citizen Headed Household (No Earning Adult)',
];

// Existing Benefits Exclusion Options for Condition #12
const BENEFIT_EXCLUSION_OPTIONS = [
  'Central / State Civil Pension Beneficiaries (Exclusion)',
  'Institutional Landholder / Income Tax Payee (Exclusion)',
  'Existing DBT Housing Subsidy Beneficiary (PMAY Excluded)',
  'Existing Higher Education DBT Scholarship Beneficiary',
];

// The 15 Standard Common Eligibility Conditions
const COMMON_ELIGIBILITY_CONDITIONS = [
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
    name: 'Annual income',
    example: 'Family income below ₹2.5 lakh',
    field: 'annualFamilyIncome',
    operator: '<=',
    expectedValue: '250000',
    description: 'Family income must not exceed ₹2.5 lakh per annum.',
    isMandatory: true,
  },
  {
    id: 'TEMPLATE_RESIDENCE',
    number: 3,
    name: 'Residence',
    example: 'Must be an Indian citizen or resident of a particular state',
    field: 'state',
    operator: '==',
    expectedValue: 'All India (Any Indian State / UT)',
    description: 'Must be an Indian citizen or resident of the specified state.',
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
    description: 'Only female / women applicants are eligible for this scheme.',
    isMandatory: true,
  },
  {
    id: 'TEMPLATE_EDUCATION',
    number: 5,
    name: 'Education',
    example: 'Must have completed Class 10',
    field: 'education',
    operator: 'IN',
    expectedValue: 'Class 10 (Secondary School Examination)',
    description: 'Must have completed Class 10 or higher specified education level.',
    isMandatory: true,
  },
  {
    id: 'TEMPLATE_OCCUPATION',
    number: 6,
    name: 'Occupation',
    example: 'Must be a farmer or registered worker',
    field: 'occupation',
    operator: 'IN',
    expectedValue: 'Small / Marginal Farmer',
    description: 'Must be a farmer, registered unorganized worker, or artisan.',
    isMandatory: true,
  },
  {
    id: 'TEMPLATE_COMMUNITY',
    number: 7,
    name: 'Social category',
    example: 'SC/ST/OBC or other specified categories',
    field: 'community',
    operator: 'IN',
    expectedValue: 'SC, ST, OBC',
    description: 'Applicant must belong to SC, ST, OBC, or specified category.',
    isMandatory: true,
  },
  {
    id: 'TEMPLATE_EMPLOYMENT',
    number: 8,
    name: 'Employment status',
    example: 'Must be unemployed',
    field: 'employmentStatus',
    operator: '==',
    expectedValue: 'Unemployed',
    description: 'Applicant must be currently unemployed or seeking self-employment.',
    isMandatory: true,
  },
  {
    id: 'TEMPLATE_DISABILITY',
    number: 9,
    name: 'Disability status',
    example: 'Must have a specified disability percentage',
    field: 'disabilityStatus',
    operator: '==',
    expectedValue: 'true',
    description: 'Must possess a valid disability certificate with benchmark disability (>= 40%).',
    isMandatory: true,
  },
  {
    id: 'TEMPLATE_LAND',
    number: 10,
    name: 'Land ownership',
    example: 'Must own or cultivate agricultural land',
    field: 'landOwnership',
    operator: '==',
    expectedValue: 'Cultivable Agricultural Landholder (PM-KISAN Standard)',
    description: 'Must own or cultivate agricultural land up to specified landholding limit.',
    isMandatory: true,
  },
  {
    id: 'TEMPLATE_FAMILY',
    number: 11,
    name: 'Family status',
    example: 'Must belong to a specified household category',
    field: 'familyStatus',
    operator: 'IN',
    expectedValue: 'Antyodaya Anna Yojana (AAY - Poorest of Poor)',
    description: 'Must belong to BPL, Antyodaya, or designated household category.',
    isMandatory: true,
  },
  {
    id: 'TEMPLATE_BENEFITS',
    number: 12,
    name: 'Existing benefits',
    example: 'Must not already receive certain overlapping benefits',
    field: 'existingBenefits',
    operator: 'NOT_IN',
    expectedValue: 'Central / State Civil Pension Beneficiaries',
    description: 'Must not currently receive conflicting overlapping government DBT pensions.',
    isMandatory: true,
  },
  {
    id: 'TEMPLATE_BANK',
    number: 13,
    name: 'Bank account',
    example: 'Must have an eligible bank account',
    field: 'bankAccount',
    operator: '==',
    expectedValue: 'Any Scheduled Commercial Bank (Aadhaar Seeded & DBT Active)',
    description: 'Must have an active, Aadhaar-seeded bank account enabled for DBT transfers.',
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

const KNOWN_CONDITION_FIELDS = [
  'bankAccount',
  'documents',
  'age',
  'annualFamilyIncome',
  'gender',
  'community',
  'state',
  'education',
  'occupation',
  'employmentStatus',
  'disabilityStatus',
  'landOwnership',
  'familyStatus',
  'existingBenefits',
  'district',
];

// Helper to generate clear, human-readable summary without code operators
const getHumanFriendlySummary = (data) => {
  if (!data.expectedValue && data.expectedValue !== 0) return 'No condition value specified yet.';

  switch (data.field) {
    case 'gender':
      if (data.expectedValue === 'All Genders') return 'Open to all genders (Female, Male, Transgender)';
      return `Restricted to ${data.expectedValue} applicants only`;
    case 'bankAccount':
      return `Must have an active account in ${data.expectedValue}`;
    case 'documents': {
      const docs = String(data.expectedValue).split(',').map((s) => s.trim()).filter(Boolean);
      return docs.length > 0
        ? `Citizen must provide ${docs.length} required document(s): ${docs.join(' + ')}`
        : 'Please select required certificates from the checklist';
    }
    case 'age': {
      const parts = String(data.expectedValue).split(',').map((s) => s.trim());
      return `Applicant age must be between ${parts[0] || '18'} and ${parts[1] || '60'} years old`;
    }
    case 'annualFamilyIncome':
      return `Family annual income ceiling: Up to ₹${Number(data.expectedValue || 0).toLocaleString('en-IN')} per year`;
    case 'community': {
      const comms = String(data.expectedValue).split(',').map((s) => s.trim()).filter(Boolean);
      return comms.length > 0
        ? `Applicant must belong to: ${comms.join(', ')}`
        : 'Please select eligible social categories';
    }
    case 'state':
      return String(data.expectedValue).includes('All India')
        ? 'Open to residents of all Indian States & Union Territories'
        : `Applicant must be a permanent resident of ${data.expectedValue}`;
    case 'education': {
      const edus = String(data.expectedValue).split(',').map((s) => s.trim()).filter(Boolean);
      return edus.length > 0
        ? `Accepted education qualifications: ${edus.join(', ')}`
        : 'Please select eligible education qualifications';
    }
    case 'occupation': {
      const occs = String(data.expectedValue).split(',').map((s) => s.trim()).filter(Boolean);
      return occs.length > 0
        ? `Target occupation: ${occs.join(', ')}`
        : 'Please select target occupations';
    }
    case 'employmentStatus':
      return `Applicant must be currently ${data.expectedValue}`;
    case 'disabilityStatus':
      return data.expectedValue === 'true' || data.expectedValue === true
        ? 'Applicant must have a certified benchmark disability (≥ 40% PwD)'
        : 'Disability certificate not required (open to all citizens)';
    case 'landOwnership':
      return `Landholding criterion: ${data.expectedValue}`;
    case 'familyStatus': {
      const fams = String(data.expectedValue).split(',').map((s) => s.trim()).filter(Boolean);
      return fams.length > 0
        ? `Household category: ${fams.join(', ')}`
        : 'Please select household categories';
    }
    case 'existingBenefits': {
      const excl = String(data.expectedValue).split(',').map((s) => s.trim()).filter(Boolean);
      return excl.length > 0
        ? `Disqualifying overlapping benefits: ${excl.join(', ')}`
        : 'No overlapping benefit disqualifications set';
    }
    case 'district':
      return `Geographic demarcation: ${data.expectedValue}`;
    default:
      return `${data.field}: ${data.expectedValue}`;
  }
};

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
  const [isPublishingScheme, setIsPublishingScheme] = useState(false);

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

  // 1. Load All Schemes (including draft/inactive schemes so admin can configure their rules)
  useEffect(() => {
    setIsLoadingSchemes(true);
    api
      .get('/schemes', { params: { includeInactive: 'true', limit: 2500 } })
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
      const matchedTemplate = COMMON_ELIGIBILITY_CONDITIONS.find(
        (c) => c.field === existingRule.field
      );
      setActiveTemplateInfo(matchedTemplate || null);
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

  // Publish Scheme to make it visible to all users and send targeted alerts
  const handlePublishScheme = async () => {
    if (!selectedSchemeId) return;
    setIsPublishingScheme(true);
    try {
      const res = await api.put(`/schemes/${selectedSchemeId}`, { isActive: true });
      if (res.data.success) {
        setSchemes((prev) =>
          prev.map((s) => (s._id === selectedSchemeId ? { ...s, isActive: true } : s))
        );
        showToast(
          '🎉 Scheme published successfully! It is now visible to all users and targeted alerts were sent to eligible citizens.',
          'success'
        );
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to publish scheme', 'error');
    } finally {
      setIsPublishingScheme(false);
    }
  };

  // Revert Scheme to draft mode (hidden from public users)
  const handleUnpublishScheme = async () => {
    if (!selectedSchemeId) return;
    try {
      await api.put(`/schemes/${selectedSchemeId}`, { isActive: false });
      setSchemes((prev) =>
        prev.map((s) => (s._id === selectedSchemeId ? { ...s, isActive: false } : s))
      );
      showToast('Scheme reverted to draft. It is now hidden from public users.', 'info');
    } catch (err) {
      showToast('Failed to unpublish scheme', 'error');
    }
  };

  // Save Rule
  const handleSaveRule = async (e, alsoPublish = false) => {
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
        parsedVal = formData.expectedValue === 'true' || formData.expectedValue === '1' || formData.expectedValue === true;
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

      if (alsoPublish) {
        await handlePublishScheme();
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
  const isCustomNew = selectedRuleId === 'CUSTOM_NEW';
  const isTailoredCondition = KNOWN_CONDITION_FIELDS.includes(formData.field) && !isCustomNew;

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
            Select a scheme, pick from the <strong>15 common eligibility conditions</strong>, and configure parameters using dedicated controls (e.g. gender selector, bank dropdown, certificate checklists). No equality operators or code needed.
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

          {selectedSchemeId && (
            <Link
              to={`/schemes/${selectedSchemeId}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Public Scheme Page</span>
            </Link>
          )}
        </div>
      </div>

      {/* 15 Conditions Reference Modal / Drawer */}
      {showConditionsGuide && (
        <div className="bg-white rounded-2xl border border-blue-200 shadow-md p-5 space-y-4 transition-all">
          <div className="flex items-center justify-between border-b border-blue-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-blue-100 text-gov-secondary">
                <BookOpen className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Common Eligibility Conditions Reference (Official Guidelines)
              </h3>
            </div>
            <button
              onClick={() => setShowConditionsGuide(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
            {COMMON_ELIGIBILITY_CONDITIONS.map((cond) => (
              <div
                key={cond.id}
                onClick={() => {
                  handleSelectOption(cond.id);
                  setShowConditionsGuide(false);
                }}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50 hover:border-gov-secondary transition-all cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-gov-primary">
                    #{cond.number}. {cond.name}
                  </span>
                  <span className="text-[10px] font-bold text-gov-secondary bg-white px-2 py-0.5 rounded-full border border-blue-200">
                    Apply
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  {cond.example}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheme Visibility & Publication Status Workflow Banner */}
      {selectedScheme && !selectedScheme.isActive && (
        <div className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-xl bg-amber-200/80 text-amber-900 mt-0.5">
              <EyeOff className="w-5 h-5 text-amber-800" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-amber-950">
                  Draft Scheme — Hidden from Public Users
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 uppercase">
                  Pending Rules
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-1 max-w-2xl leading-relaxed">
                Essential details for <strong>"{selectedScheme.schemeName}"</strong> are saved. Configure the required eligibility conditions below using the 15 Common Eligibility Conditions. When ready, click <strong>Publish Scheme to Users</strong> to make it live and automatically notify eligible citizens.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={handlePublishScheme}
              isLoading={isPublishingScheme}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-sm cursor-pointer text-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Scheme to Users</span>
            </Button>
          </div>
        </div>
      )}

      {selectedScheme && selectedScheme.isActive && (
        <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Scheme is Published & Live: Visible to all public users on portal.</span>
          </div>
          <button
            type="button"
            onClick={handleUnpublishScheme}
            className="text-xs text-amber-800 font-bold hover:underline cursor-pointer"
          >
            Unpublish / Revert to Draft
          </button>
        </div>
      )}

      {/* TOP SELECTION CONTROL DESK (Dual-Dropdown Architecture) */}
      <div className="bg-white rounded-2xl border border-gov-border shadow-subtle p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dropdown 1: Target Scheme */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gov-primary uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-gov-secondary" />
                <span>1. Select Scheme:</span>
              </span>
              <span className="text-[11px] text-slate-500 font-semibold normal-case">
                {schemes.length} total schemes
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
                className="w-full text-xs rounded-xl border border-gov-border p-3 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-gov-secondary text-slate-900 shadow-xs cursor-pointer"
              >
                {schemes.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.schemeName} ({s.departmentId?.departmentName || s.ministry || 'Dept'}) {!s.isActive ? '⚠️ [Draft - Hidden from Users]' : '✓ [Published]'}
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
                        {r.ruleName} — [{r.field}] {r.isMandatory ? '★ Mandatory' : '(Advisory)'}
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
          {/* Rule Title Input */}
          <div className="w-full">
            <Input
              label="Rule Name / Public Condition Title"
              value={formData.ruleName}
              onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
              placeholder="e.g. Gender Requirement (Only women are eligible)"
              required
            />
          </div>

          {/* TAILORED CONDITION WIDGET SECTION */}
          {isTailoredCondition ? (
            <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-4">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2.5">
                <span className="text-xs font-bold text-gov-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-gov-secondary" />
                  <span>Rule Criteria Settings for "{activeTemplateInfo ? activeTemplateInfo.name : formData.field}":</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Select criteria below. Operators and parameters apply automatically.
                </span>
              </div>

              {/* 1. BANK ACCOUNT WIDGET (Condition #13) */}
              {formData.field === 'bankAccount' && (
                <div className="space-y-2.5">
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

              {/* 2. DOCUMENTS & CERTIFICATES WIDGET (Condition #14) */}
              {formData.field === 'documents' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FolderCheck className="w-4 h-4 text-gov-secondary" />
                      <span>Select Required Documents & Certificates:</span>
                    </label>
                    <span className="text-[11px] font-bold text-gov-secondary bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {formData.expectedValue.split(',').filter(Boolean).length} Selected
                    </span>
                  </div>

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
                    Check one, two, or multiple certificates that the citizen must provide.
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
                        className="px-2.5 py-1 rounded-md bg-white border border-blue-200 hover:border-gov-secondary text-[11px] font-semibold text-slate-700 cursor-pointer"
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
                        className="w-full pl-7 pr-3 py-2.5 text-xs font-bold rounded-lg border border-blue-300 bg-white"
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

              {/* 5. GENDER WIDGET (Condition #4 - Specifically simplified, no operator dropdown needed) */}
              {formData.field === 'gender' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-gov-secondary" />
                    <span>Select Target Gender:</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                            operator: g.val === 'All Genders' ? 'EXISTS' : '==',
                            description: g.desc,
                          })
                        }
                        className={`p-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center border ${
                          formData.expectedValue === g.val
                            ? 'bg-gov-secondary text-white border-gov-secondary shadow-sm ring-2 ring-gov-secondary/30'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Click a target gender option above. No equality operators needed — rule logic applies automatically.
                  </p>
                </div>
              )}

              {/* 6. SOCIAL CATEGORY WIDGET (Condition #7) */}
              {formData.field === 'community' && (
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-gov-secondary" />
                    <span>Select Eligible Social Categories:</span>
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
                <div className="space-y-2.5">
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
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-gov-secondary" />
                    <span>Select Accepted Education Qualifications:</span>
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
                <div className="space-y-2.5">
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
                <div className="space-y-2.5">
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
                <div className="space-y-2.5">
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
                <div className="space-y-2.5">
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
                <div className="space-y-2.5">
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
                <div className="space-y-2.5">
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
                <div className="space-y-2.5">
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
          ) : (
            /* Custom blank rule form - Only shown for CUSTOM_NEW */
            <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/30 space-y-4">
              <div className="border-b border-amber-200 pb-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Custom Blank Rule Configuration
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    Target Evaluation Value <span className="text-gov-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.expectedValue}
                    onChange={(e) => setFormData({ ...formData, expectedValue: e.target.value })}
                    placeholder="e.g. 18, 60 or 250000"
                    className="w-full text-xs rounded-lg border border-gov-border p-2 focus:outline-none focus:ring-2 focus:ring-gov-secondary font-mono bg-white font-bold"
                    required
                  />
                </div>
              </div>
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
              className="w-full text-xs rounded-lg border border-gov-border p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary font-medium text-slate-800"
            />
          </div>

          {/* Clean, Human-Friendly Live Condition Summary */}
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-950 text-xs space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Eligibility Rule Summary:</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-800">
                {activeTemplateInfo ? activeTemplateInfo.name : formData.field}
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-slate-900 font-bold text-xs flex items-center gap-2">
              <span className="text-emerald-700">Requirement:</span>
              <span className="text-slate-800 font-semibold">{getHumanFriendlySummary(formData)}</span>
            </div>
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

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                variant={selectedScheme && !selectedScheme.isActive ? 'outline' : 'primary'}
                size="md"
                isLoading={isSaving}
                className="gap-2 shadow-sm font-bold text-xs px-5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isExistingDbRule ? 'Save & Apply Rule' : 'Save Rule to Scheme'}</span>
              </Button>

              {selectedScheme && !selectedScheme.isActive && (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={(e) => handleSaveRule(e, true)}
                  isLoading={isSaving || isPublishingScheme}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Rule & Publish Scheme</span>
                </Button>
              )}
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

                    <div className="flex items-center gap-1.5 pt-1 text-[11px]">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-bold">
                        {rule.field}
                      </span>
                      <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200 font-medium max-w-xs truncate">
                        {Array.isArray(rule.expectedValue)
                          ? rule.expectedValue.join(', ')
                          : String(rule.expectedValue)}
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
