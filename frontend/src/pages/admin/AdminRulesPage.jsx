import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const RULE_FIELDS = [
  { value: 'annualFamilyIncome', label: 'Annual Family Income (₹ Number)' },
  { value: 'age', label: 'Age (Years computed from DOB)' },
  { value: 'occupation', label: 'Occupation (e.g. Farmer, Student)' },
  { value: 'employmentStatus', label: 'Employment Status' },
  { value: 'community', label: 'Social Category / Community (General, OBC, SC, ST, EWS)' },
  { value: 'gender', label: 'Gender (Male, Female, Other)' },
  { value: 'state', label: 'Applicable State' },
  { value: 'disabilityStatus', label: 'Disability Status (Boolean)' },
  { value: 'education', label: 'Highest Education Level' },
];

const OPERATORS = [
  { value: '==', label: '== (Equal to)' },
  { value: '!=', label: '!= (Not equal to)' },
  { value: '<=', label: '<= (Less than or equal to)' },
  { value: '<', label: '< (Strictly less than)' },
  { value: '>=', label: '>= (Greater than or equal to)' },
  { value: '>', label: '> (Strictly greater than)' },
  { value: 'IN', label: 'IN (Must be in allowed list)' },
  { value: 'NOT_IN', label: 'NOT_IN (Must not be in list)' },
  { value: 'BETWEEN', label: 'BETWEEN (Range [min, max])' },
  { value: 'EXISTS', label: 'EXISTS (Must be provided)' },
];

const AdminRulesPage = () => {
  const [schemes, setSchemes] = useState([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState('');
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    ruleName: '',
    field: 'annualFamilyIncome',
    operator: '<=',
    expectedValue: '250000',
    description: '',
    isMandatory: true,
    isActive: true,
  });

  useEffect(() => {
    api
      .get('/schemes?limit=100')
      .then((res) => {
        if (res.data.success && res.data.data.length > 0) {
          setSchemes(res.data.data);
          setSelectedSchemeId(res.data.data[0]._id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const fetchRules = async (schemeId) => {
    if (!schemeId) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/eligibility-rules/scheme/${schemeId}`);
      if (res.data.success) {
        setRules(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSchemeId) {
      fetchRules(selectedSchemeId);
    }
  }, [selectedSchemeId]);

  const handleOpenCreate = () => {
    setEditingRuleId(null);
    setFormData({
      ruleName: '',
      field: 'annualFamilyIncome',
      operator: '<=',
      expectedValue: '300000',
      description: 'Annual family income must not exceed threshold limit',
      isMandatory: true,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule) => {
    setEditingRuleId(rule._id);
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
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.ruleName || !formData.field || !formData.operator) {
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
        ruleName: formData.ruleName,
        field: formData.field,
        operator: formData.operator,
        expectedValue: parsedVal,
        description: formData.description,
        isMandatory: formData.isMandatory,
        isActive: formData.isActive,
      };

      if (editingRuleId) {
        await api.put(`/eligibility-rules/${editingRuleId}`, payload);
        showToast('Rule updated successfully', 'success');
      } else {
        await api.post('/eligibility-rules', payload);
        showToast('Eligibility rule created', 'success');
      }

      setIsModalOpen(false);
      fetchRules(selectedSchemeId);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save rule', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this eligibility rule?')) return;
    try {
      const res = await api.delete(`/eligibility-rules/${ruleId}`);
      if (res.data.success) {
        setRules((prev) => prev.filter((r) => r._id !== ruleId));
        showToast('Rule deleted', 'success');
      }
    } catch (err) {
      showToast('Failed to delete rule', 'error');
    }
  };

  // Preview generated text
  const previewText = `Condition: Citizen's ${formData.field} must satisfy [ ${formData.operator} ${formData.expectedValue} ]`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Eligibility Rule Builder
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Configure Boolean thresholds and evaluation logic for each scheme without writing raw code.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Add Condition Rule</span>
        </Button>
      </div>

      {/* Scheme Selector Bar */}
      <div className="bg-white rounded-xl border border-gov-border p-4 shadow-subtle flex flex-col sm:flex-row items-center gap-3">
        <label className="text-xs font-bold text-gov-primary uppercase tracking-wider shrink-0">
          Target Scheme:
        </label>
        <select
          value={selectedSchemeId}
          onChange={(e) => setSelectedSchemeId(e.target.value)}
          className="w-full text-xs rounded-lg border border-gov-border p-2 bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-gov-secondary"
        >
          {schemes.map((s) => (
            <option key={s._id} value={s._id}>
              {s.schemeName} ({s.category})
            </option>
          ))}
        </select>
      </div>

      {/* Rules List for Selected Scheme */}
      {isLoading ? (
        <LoadingSpinner label="Loading rules for scheme..." size="lg" />
      ) : rules.length === 0 ? (
        <EmptyState
          title="No eligibility rules defined"
          description="This scheme currently has no eligibility rules configured. Add rules such as maximum income ceiling, age threshold, or occupation criteria."
          actionLabel="Add First Rule"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule._id}
              className="bg-white rounded-xl border border-gov-border p-4 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{rule.ruleName}</span>
                  {rule.isMandatory ? (
                    <Badge variant="danger" size="xs">
                      Mandatory Condition
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="xs">
                      Advisory
                    </Badge>
                  )}
                  {!rule.isActive && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded">
                      Deactivated
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600">{rule.description || 'No description provided'}</p>

                <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-gov-primary font-bold">
                    {rule.field}
                  </span>
                  <span className="text-gov-secondary font-black">{rule.operator}</span>
                  <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200 font-bold">
                    {JSON.stringify(rule.expectedValue)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenEdit(rule)}
                  className="p-1.5 text-slate-400 hover:text-gov-secondary rounded-lg hover:bg-slate-100"
                  title="Edit Rule"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteRule(rule._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  title="Delete Rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Rule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRuleId ? 'Edit Eligibility Rule' : 'Add Eligibility Condition Rule'}
        maxWidth="max-w-lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSaving}>
              {editingRuleId ? 'Update Rule' : 'Save Rule'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <Input
            label="Rule Name / Title"
            value={formData.ruleName}
            onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })}
            placeholder="e.g. Income Ceiling Under ₹3 Lakh"
            required
          />

          <div className="grid grid-cols-2 gap-3">
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
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Expected Target Value <span className="text-gov-error">*</span>
            </label>
            <input
              type="text"
              value={formData.expectedValue}
              onChange={(e) => setFormData({ ...formData, expectedValue: e.target.value })}
              placeholder="e.g. 300000, Farmer, or SC, OBC"
              className="w-full text-xs rounded-lg border border-gov-border p-2 focus:outline-none focus:ring-2 focus:ring-gov-secondary font-mono"
              required
            />
            <span className="text-[10px] text-gov-muted mt-1 block">
              For IN/NOT_IN/BETWEEN, separate values with commas (e.g. SC, ST, OBC or 18, 70).
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Readable Explanation Note
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Beneficiary annual income must not exceed 3 lakhs"
              className="w-full text-xs rounded-lg border border-gov-border p-2"
            />
          </div>

          {/* Live Preview Box */}
          <div className="p-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-900 text-xs">
            <span className="font-bold flex items-center gap-1 mb-1">
              <Eye className="w-3.5 h-3.5 text-gov-secondary" />
              Live Evaluation Logic Preview:
            </span>
            <code className="block bg-white p-2 rounded border border-blue-200 text-slate-800 font-mono text-[11px]">
              {previewText}
            </code>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isMandatory}
                onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })}
                className="rounded text-gov-secondary"
              />
              <span className="text-xs font-bold text-slate-800">Mandatory Condition</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-gov-secondary"
              />
              <span className="text-xs font-bold text-slate-800">Active</span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminRulesPage;
