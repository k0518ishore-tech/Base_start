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
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const RULE_FIELDS = [
  { value: 'annualFamilyIncome', label: 'Annual Family Income (₹ Number)' },
  { value: 'age', label: 'Age (Years computed from DOB)' },
  { value: 'occupation', label: 'Occupation (e.g. Farmer, Student, Artisan)' },
  { value: 'employmentStatus', label: 'Employment Status (Employed, Self-Employed, Unemployed)' },
  { value: 'community', label: 'Social Category / Community (General, OBC, SC, ST, EWS)' },
  { value: 'gender', label: 'Gender (Male, Female, Other)' },
  { value: 'state', label: 'Applicable State' },
  { value: 'disabilityStatus', label: 'Disability Status (Boolean)' },
  { value: 'education', label: 'Highest Education Level' },
];

const OPERATORS = [
  { value: '<=', label: '<= (Less than or equal to - Ceiling limit)' },
  { value: '>=', label: '>= (Greater than or equal to - Minimum threshold)' },
  { value: '==', label: '== (Equal to - Strict match)' },
  { value: '!=', label: '!= (Not equal to - Exclude value)' },
  { value: '<', label: '< (Strictly less than)' },
  { value: '>', label: '> (Strictly greater than)' },
  { value: 'IN', label: 'IN (Must be in allowed list e.g. SC, ST)' },
  { value: 'NOT_IN', label: 'NOT_IN (Must not be in list)' },
  { value: 'BETWEEN', label: 'BETWEEN (Range [min, max] e.g. 18, 60)' },
  { value: 'EXISTS', label: 'EXISTS (Attribute must be present)' },
];

const RULE_PRESETS = [
  {
    name: 'Income Ceiling Under ₹3 Lakh',
    field: 'annualFamilyIncome',
    operator: '<=',
    value: '300000',
    desc: 'Annual family income must not exceed ₹3,00,000.',
  },
  {
    name: 'Minimum Age 18 Years',
    field: 'age',
    operator: '>=',
    value: '18',
    desc: 'Applicant must be at least 18 years of age.',
  },
  {
    name: 'Farmer / Cultivator Occupation',
    field: 'occupation',
    operator: '==',
    value: 'Farmer',
    desc: 'Primary occupation must be agricultural cultivator / farmer.',
  },
  {
    name: 'Reserved Social Categories (SC, ST, OBC)',
    field: 'community',
    operator: 'IN',
    value: 'SC, ST, OBC',
    desc: 'Applicant must belong to eligible affirmative communities.',
  },
  {
    name: 'Female Citizen Beneficiary',
    field: 'gender',
    operator: '==',
    value: 'Female',
    desc: 'Welfare initiative designated specifically for women beneficiaries.',
  },
];

const AdminRulesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const querySchemeId = searchParams.get('schemeId');
  const { showToast } = useToast();

  const [schemes, setSchemes] = useState([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState('');
  const [rules, setRules] = useState([]);
  const [selectedRuleId, setSelectedRuleId] = useState('NEW_RULE');
  const [isLoadingSchemes, setIsLoadingSchemes] = useState(true);
  const [isLoadingRules, setIsLoadingRules] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    ruleName: '',
    field: 'annualFamilyIncome',
    operator: '<=',
    expectedValue: '300000',
    description: '',
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
  const fetchRulesForScheme = async (schemeId, preserveSelectedRuleId = null) => {
    if (!schemeId) return;
    setIsLoadingRules(true);
    try {
      const res = await api.get(`/eligibility-rules/scheme/${schemeId}`);
      if (res.data.success) {
        const fetchedRules = res.data.data;
        setRules(fetchedRules);

        // Determine which rule to select
        if (preserveSelectedRuleId && preserveSelectedRuleId !== 'NEW_RULE') {
          const matched = fetchedRules.find((r) => r._id === preserveSelectedRuleId);
          if (matched) {
            handleSelectRule(matched._id, fetchedRules);
            return;
          }
        }

        if (fetchedRules.length > 0) {
          handleSelectRule(fetchedRules[0]._id, fetchedRules);
        } else {
          handleSelectRule('NEW_RULE', []);
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

  // When user selects a rule from Dropdown 2 (or from the rules list)
  const handleSelectRule = (ruleId, currentRules = rules) => {
    setSelectedRuleId(ruleId);

    if (ruleId === 'NEW_RULE') {
      setFormData({
        ruleName: '',
        field: 'annualFamilyIncome',
        operator: '<=',
        expectedValue: '300000',
        description: 'Beneficiary annual income must not exceed the specified ceiling limit',
        isMandatory: true,
        isActive: true,
      });
      return;
    }

    const rule = currentRules.find((r) => r._id === ruleId);
    if (rule) {
      let valStr = rule.expectedValue;
      if (Array.isArray(valStr)) valStr = valStr.join(', ');
      else if (typeof valStr === 'object') valStr = JSON.stringify(valStr);
      else valStr = String(valStr);

      setFormData({
        ruleName: rule.ruleName,
        field: rule.field,
        operator: rule.operator,
        expectedValue: valStr,
        description: rule.description || '',
        isMandatory: Boolean(rule.isMandatory),
        isActive: Boolean(rule.isActive),
      });
    }
  };

  // Apply Preset Template
  const handleApplyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      ruleName: preset.name,
      field: preset.field,
      operator: preset.operator,
      expectedValue: preset.value,
      description: preset.desc,
    }));
    showToast(`Loaded preset: ${preset.name}`, 'info');
  };

  // Save Rule (POST if NEW_RULE, PUT if existing)
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

      if (selectedRuleId && selectedRuleId !== 'NEW_RULE') {
        await api.put(`/eligibility-rules/${selectedRuleId}`, payload);
        showToast('Rule updated and applied successfully!', 'success');
        fetchRulesForScheme(selectedSchemeId, selectedRuleId);
      } else {
        const res = await api.post('/eligibility-rules', payload);
        showToast('New eligibility rule created and applied!', 'success');
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
    if (!selectedRuleId || selectedRuleId === 'NEW_RULE') return;
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
  const isEditingExisting = selectedRuleId && selectedRuleId !== 'NEW_RULE';

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
            Select a scheme, pick any rule from the dropdown to edit its parameters, or create new criteria rules to apply.
          </p>
        </div>

        {selectedScheme && (
          <Link
            to={`/schemes/${selectedScheme._id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors self-start sm:self-center"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Show Scheme Page</span>
          </Link>
        )}
      </div>

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
              <span className="text-[11px] text-slate-400 font-semibold normal-case">
                {rules.length} rule(s) configured
              </span>
            </label>

            {isLoadingRules ? (
              <div className="h-10 bg-slate-100 animate-pulse rounded-xl" />
            ) : (
              <select
                value={selectedRuleId}
                onChange={(e) => handleSelectRule(e.target.value)}
                className="w-full text-xs rounded-xl border border-gov-border p-3 bg-slate-50 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary text-slate-900 shadow-xs cursor-pointer"
              >
                <option value="NEW_RULE">➕ + Create New Rule for this Scheme</option>
                {rules.length > 0 && (
                  <optgroup label={`Configured Rules for ${selectedScheme?.schemeName || 'Scheme'} (${rules.length})`}>
                    {rules.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.ruleName} — [{r.field} {r.operator} {JSON.stringify(r.expectedValue)}] {r.isMandatory ? '★ Mandatory' : '(Advisory)'}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* RULE EDITOR PANEL (Inline editing as requested) */}
      <div className="bg-white rounded-2xl border border-gov-border shadow-subtle overflow-hidden">
        {/* Editor Header */}
        <div className="bg-slate-50/80 px-6 py-4 border-b border-gov-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`p-1.5 rounded-lg ${
                isEditingExisting
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-emerald-100 text-emerald-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isEditingExisting ? 'Active Rule Editor' : 'Rule Formulation Desk'}
              </div>
              <h2 className="text-base font-extrabold text-slate-900">
                {isEditingExisting ? `Editing: ${formData.ruleName || 'Selected Rule'}` : `Configure New Rule for "${selectedScheme?.schemeName || 'Scheme'}"`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditingExisting && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteRule}
                isLoading={isDeleting}
                className="text-rose-600 hover:bg-rose-50 border-rose-200 gap-1 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Rule</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectRule('NEW_RULE')}
              className="gap-1 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Rule</span>
            </Button>
          </div>
        </div>

        {/* Quick Presets Strip */}
        <div className="px-6 py-2.5 bg-blue-50/50 border-b border-blue-100/70 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-gov-secondary flex items-center gap-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            Quick Presets:
          </span>
          {RULE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="px-2.5 py-1 rounded-md bg-white border border-blue-200 hover:border-gov-secondary text-slate-700 hover:text-gov-secondary text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Editor Form */}
        <form onSubmit={handleSaveRule} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <Input
                label="Rule Name / Public Condition Title"
                value={formData.ruleName}
                onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
                placeholder="e.g. Annual Income Under ₹3 Lakh"
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
                placeholder="e.g. 300000 or Farmer or SC, OBC"
                className="w-full text-xs rounded-lg border border-gov-border p-2 focus:outline-none focus:ring-2 focus:ring-gov-secondary font-mono bg-white"
                required
              />
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
              placeholder="e.g. Beneficiary family income must not exceed 3 lakhs per annum to qualify for DBT subsidy."
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
                className="gap-2 shadow-sm font-bold text-sm px-6"
              >
                <Save className="w-4 h-4" />
                <span>{isEditingExisting ? 'Save & Apply Rule' : 'Create & Apply Rule'}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* ALL CONFIGURED RULES FOR THIS SCHEME (Suite Overview) */}
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
            title="No rules applied yet"
            description="Use the editor above to configure the first eligibility rule for this scheme."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rules.map((rule) => {
              const isSelected = selectedRuleId === rule._id;
              return (
                <div
                  key={rule._id}
                  onClick={() => handleSelectRule(rule._id)}
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
