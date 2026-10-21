import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  User,
  ShieldCheck,
  Building2,
  RefreshCw,
  Info,
  Search,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const STATES = [
  'All India',
  'Maharashtra',
  'Uttar Pradesh',
  'Bihar',
  'Madhya Pradesh',
  'Rajasthan',
  'Gujarat',
  'Karnataka',
  'Tamil Nadu',
  'West Bengal',
  'Punjab',
  'Haryana',
  'Kerala',
  'Delhi',
];

const COMMUNITIES = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority'];
const EMPLOYMENT_STATUSES = [
  'Employed',
  'Self-Employed',
  'Unemployed',
  'Student',
  'Retired',
  'Farmer',
  'Daily Wage Worker',
];

const EligibilityCheckerPage = () => {
  const [searchParams] = useSearchParams();
  const preselectedSchemeId = searchParams.get('schemeId') || '';

  const { user, profile, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [schemes, setSchemes] = useState([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState(preselectedSchemeId);
  const [checkMode, setCheckMode] = useState(preselectedSchemeId ? 'single' : 'batch'); // 'single' | 'batch'
  const [schemeSearchTerm, setSchemeSearchTerm] = useState('');
  const [isLoadingSchemes, setIsLoadingSchemes] = useState(false);

  // User input profile state for assessment (prefilled from profile if logged in)
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    age: '',
    gender: 'Male',
    state: 'Maharashtra',
    district: '',
    annualFamilyIncome: '',
    occupation: '',
    employmentStatus: '',
    community: 'General',
    disabilityStatus: false,
  });

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [singleResult, setSingleResult] = useState(null);
  const [batchResult, setBatchResult] = useState(null);

  // Load all schemes list sorted alphabetically
  useEffect(() => {
    setIsLoadingSchemes(true);
    api
      .get('/schemes?limit=2500&sortBy=name_asc')
      .then((res) => {
        if (res.data.success) {
          const list = res.data.data || [];
          setSchemes(list);
          if (preselectedSchemeId) {
            setSelectedSchemeId(preselectedSchemeId);
          } else if (list.length > 0 && !selectedSchemeId) {
            setSelectedSchemeId(list[0]._id);
          }
        }
      })
      .catch((err) => console.error('Failed to load schemes for evaluation:', err))
      .finally(() => setIsLoadingSchemes(false));
  }, [preselectedSchemeId]);

  const filteredSchemes = schemes.filter((s) => {
    if (!schemeSearchTerm.trim()) return true;
    const term = schemeSearchTerm.toLowerCase();
    const nameMatch = s.schemeName?.toLowerCase().includes(term);
    const catMatch = s.category?.toLowerCase().includes(term);
    const stateMatch = Array.isArray(s.applicableStates)
      ? s.applicableStates.some((st) => st.toLowerCase().includes(term))
      : s.applicableStates?.toLowerCase().includes(term);
    return nameMatch || catMatch || stateMatch;
  });

  // Prepopulate form if profile is available
  useEffect(() => {
    if (profile) {
      let computedAge = '';
      if (profile.dateOfBirth) {
        const b = new Date(profile.dateOfBirth);
        const now = new Date();
        computedAge = now.getFullYear() - b.getFullYear();
      }

      setFormData({
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : '',
        age: computedAge,
        gender: profile.gender || 'Male',
        state: profile.state || 'Maharashtra',
        district: profile.district || '',
        annualFamilyIncome: profile.annualFamilyIncome !== null ? profile.annualFamilyIncome : '',
        occupation: profile.occupation || '',
        employmentStatus: profile.employmentStatus || '',
        community: profile.community || 'General',
        disabilityStatus: Boolean(profile.disabilityStatus),
      });
    }
  }, [profile]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAgeChange = (e) => {
    const ageVal = e.target.value;
    handleInputChange('age', ageVal);
    // calculate synthetic DOB
    if (ageVal) {
      const d = new Date();
      d.setFullYear(d.getFullYear() - Number(ageVal));
      handleInputChange('dateOfBirth', d.toISOString().slice(0, 10));
    }
  };

  const handleRunEvaluation = async (e) => {
    if (e) e.preventDefault();
    setIsEvaluating(true);
    setSingleResult(null);
    setBatchResult(null);

    try {
      const payload = {
        customProfile: {
          ...formData,
          annualFamilyIncome:
            formData.annualFamilyIncome !== '' ? Number(formData.annualFamilyIncome) : undefined,
        },
      };

      if (checkMode === 'single') {
        if (!selectedSchemeId) {
          showToast('Please select a scheme to evaluate', 'warning');
          setIsEvaluating(false);
          return;
        }

        const res = await api.post(`/eligibility/check-scheme/${selectedSchemeId}`, payload);
        if (res.data.success) {
          setSingleResult(res.data.data);
          showToast(`Evaluation completed: ${res.data.data.overallStatus}`, 'success');
        }
      } else {
        // Batch check all schemes
        const res = await api.post('/eligibility/check-all', payload);
        if (res.data.success) {
          setBatchResult(res.data);
          showToast(
            `Evaluated ${res.data.summary.totalEvaluated} schemes (${res.data.summary.eligibleCount} Eligible)`,
            'success'
          );
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to complete evaluation', 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="primary" size="xs">
            Rule-Based Assessment
          </Badge>
          <span className="text-xs text-gov-muted font-medium">100% Deterministic Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gov-primary tracking-tight">
          Government Scheme Eligibility Engine
        </h1>
        <p className="text-sm text-gov-muted mt-1.5 leading-relaxed">
          Verify your eligibility against government threshold conditions. Every rule is evaluated transparently with exact reasons provided for passed, failed, or missing requirements.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl border border-gov-border w-fit shadow-subtle">
        <button
          onClick={() => {
            setCheckMode('batch');
            setSingleResult(null);
          }}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            checkMode === 'batch'
              ? 'bg-gov-primary text-white shadow-sm'
              : 'text-slate-600 hover:text-gov-primary'
          }`}
        >
          Check Eligibility Across All Schemes
        </button>
        <button
          onClick={() => {
            setCheckMode('single');
            setBatchResult(null);
          }}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            checkMode === 'single'
              ? 'bg-gov-primary text-white shadow-sm'
              : 'text-slate-600 hover:text-gov-primary'
          }`}
        >
          Evaluate Specific Scheme
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Citizen Profile Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gov-border p-6 shadow-subtle space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gov-border">
            <div className="flex items-center gap-2 font-bold text-sm text-gov-primary">
              <User className="w-4 h-4 text-gov-secondary" />
              <span>Assessment Parameters</span>
            </div>
            {isAuthenticated ? (
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Loaded from Profile
              </span>
            ) : (
              <span className="text-xs text-slate-500 font-medium">Guest Mode</span>
            )}
          </div>

          <form onSubmit={handleRunEvaluation} className="space-y-4 text-xs">
            {checkMode === 'single' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Select Scheme to Evaluate <span className="text-gov-error">*</span>
                  </label>
                  <span className="text-[11px] text-gov-muted font-medium">
                    {isLoadingSchemes ? (
                      'Loading directory...'
                    ) : (
                      `${filteredSchemes.length} of ${schemes.length} schemes`
                    )}
                  </span>
                </div>

                {/* Instant Search Filter for Schemes */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={schemeSearchTerm}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSchemeSearchTerm(val);
                      if (val.trim()) {
                        const term = val.toLowerCase();
                        const matching = schemes.filter(
                          (s) =>
                            s.schemeName?.toLowerCase().includes(term) ||
                            s.category?.toLowerCase().includes(term) ||
                            (Array.isArray(s.applicableStates)
                              ? s.applicableStates.some((st) => st.toLowerCase().includes(term))
                              : s.applicableStates?.toLowerCase().includes(term))
                        );
                        if (matching.length > 0 && !matching.some((s) => s._id === selectedSchemeId)) {
                          setSelectedSchemeId(matching[0]._id);
                        }
                      }
                    }}
                    placeholder="Search schemes by name, category, or state..."
                    className="w-full pl-8 pr-12 py-1.5 text-xs rounded-lg border border-gov-border bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-gov-secondary transition-all"
                  />
                  {schemeSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setSchemeSearchTerm('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-slate-800 bg-slate-200 hover:bg-slate-300 rounded px-1.5 py-0.5 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <select
                  value={selectedSchemeId}
                  onChange={(e) => setSelectedSchemeId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-gov-border p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary shadow-sm"
                  required
                  disabled={isLoadingSchemes || filteredSchemes.length === 0}
                >
                  {filteredSchemes.length === 0 ? (
                    <option value="">No schemes match "{schemeSearchTerm}"</option>
                  ) : (
                    filteredSchemes.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.schemeName} {s.category ? `• ${s.category}` : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={formData.age}
                  onChange={handleAgeChange}
                  placeholder="e.g. 35"
                  className="w-full text-xs rounded-lg border border-gov-border p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full text-xs rounded-lg border border-gov-border p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Annual Family Income (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.annualFamilyIncome}
                onChange={(e) => handleInputChange('annualFamilyIncome', e.target.value)}
                placeholder="e.g. 250000"
                className="w-full text-xs rounded-lg border border-gov-border p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
              />
              <span className="text-[10px] text-gov-muted">Used for EWS/BPL threshold checks</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  State
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full text-xs rounded-lg border border-gov-border p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
                >
                  {STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Social Category
                </label>
                <select
                  value={formData.community}
                  onChange={(e) => handleInputChange('community', e.target.value)}
                  className="w-full text-xs rounded-lg border border-gov-border p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
                >
                  {COMMUNITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Occupation
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  placeholder="e.g. Farmer, Student, Artisan"
                  className="w-full text-xs rounded-lg border border-gov-border p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Employment
                </label>
                <select
                  value={formData.employmentStatus}
                  onChange={(e) => handleInputChange('employmentStatus', e.target.value)}
                  className="w-full text-xs rounded-lg border border-gov-border p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
                >
                  <option value="">Select status</option>
                  {EMPLOYMENT_STATUSES.map((es) => (
                    <option key={es} value={es}>
                      {es}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="disabilityCheck"
                checked={formData.disabilityStatus}
                onChange={(e) => handleInputChange('disabilityStatus', e.target.checked)}
                className="rounded border-gov-border text-gov-secondary focus:ring-gov-secondary"
              />
              <label htmlFor="disabilityCheck" className="text-xs text-slate-700 font-medium">
                Person with Benchmark Disability (PwD)
              </label>
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isEvaluating}
                className="w-full shadow-sm"
              >
                {checkMode === 'single' ? 'Evaluate Scheme Eligibility' : 'Evaluate Across All Schemes'}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Assessment Results */}
        <div className="lg:col-span-7 space-y-6">
          {isEvaluating && (
            <div className="bg-white rounded-2xl border border-gov-border p-12 text-center shadow-subtle">
              <LoadingSpinner label="Running rule engine evaluation against criteria..." size="lg" />
            </div>
          )}

          {/* Initial Empty State */}
          {!isEvaluating && !singleResult && !batchResult && (
            <div className="bg-white rounded-2xl border border-dashed border-gov-border p-12 text-center shadow-subtle">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-gov-secondary flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gov-primary mb-1">Ready for Assessment</h3>
              <p className="text-xs text-gov-muted max-w-md mx-auto mb-6 leading-relaxed">
                Fill in your economic and demographic details on the left, then click Evaluate to receive an instant rule-by-rule status breakdown.
              </p>
              <Button variant="outline" size="sm" onClick={() => handleRunEvaluation()}>
                Run Assessment with Current Details
              </Button>
            </div>
          )}

          {/* Single Scheme Evaluation Results */}
          {!isEvaluating && singleResult && (
            <div className="bg-white rounded-2xl border border-gov-border p-6 shadow-subtle space-y-6">
              {/* Header Status Banner */}
              <div
                className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  singleResult.overallStatus === 'ELIGIBLE'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : singleResult.overallStatus === 'NOT_ELIGIBLE'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {singleResult.overallStatus === 'ELIGIBLE' && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                    {singleResult.overallStatus === 'NOT_ELIGIBLE' && (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                    {singleResult.overallStatus === 'INCOMPLETE' && (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    )}
                    <span className="font-extrabold text-base tracking-wide">
                      {singleResult.overallStatus === 'ELIGIBLE' && 'PRELIMINARY ELIGIBLE'}
                      {singleResult.overallStatus === 'NOT_ELIGIBLE' && 'NOT ELIGIBLE'}
                      {singleResult.overallStatus === 'INCOMPLETE' && 'INCOMPLETE PROFILE DATA'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold">{singleResult.schemeName}</h3>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-semibold">
                    Passed {singleResult.summary.passedCount} / {singleResult.summary.totalRules} Rules
                  </div>
                  {singleResult.summary.failedCount > 0 && (
                    <div className="text-[11px] text-rose-700">
                      {singleResult.summary.failedCount} condition(s) unmet
                    </div>
                  )}
                  {singleResult.summary.incompleteCount > 0 && (
                    <div className="text-[11px] text-amber-700">
                      {singleResult.summary.incompleteCount} missing value(s)
                    </div>
                  )}
                </div>
              </div>

              {/* Explanations List */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Detailed Rule Evaluations
                </h4>

                {/* Passed rules */}
                {singleResult.passedRules.map((rule, idx) => (
                  <div
                    key={`p-${idx}`}
                    className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">
                      <span className="font-bold text-slate-800">{rule.ruleName}</span>
                      <p className="text-emerald-900 mt-0.5 leading-relaxed">{rule.explanation}</p>
                    </div>
                  </div>
                ))}

                {/* Failed rules */}
                {singleResult.failedRules.map((rule, idx) => (
                  <div
                    key={`f-${idx}`}
                    className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 flex items-start gap-3"
                  >
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{rule.ruleName}</span>
                        {rule.isMandatory && (
                          <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold">
                            Mandatory
                          </span>
                        )}
                      </div>
                      <p className="text-rose-900 mt-0.5 leading-relaxed">{rule.explanation}</p>
                    </div>
                  </div>
                ))}

                {/* Incomplete rules */}
                {singleResult.incompleteRules.map((rule, idx) => (
                  <div
                    key={`i-${idx}`}
                    className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 flex items-start gap-3"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">
                      <span className="font-bold text-slate-800">{rule.ruleName}</span>
                      <p className="text-amber-900 mt-0.5 leading-relaxed">{rule.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action and Disclaimers */}
              <div className="pt-3 border-t border-gov-border flex flex-wrap items-center justify-between gap-3">
                <Link to={`/schemes/${singleResult.schemeId}`}>
                  <Button variant="outline" size="sm">
                    View Full Scheme Details & Official Links &rarr;
                  </Button>
                </Link>

                <Button variant="ghost" size="sm" onClick={() => handleRunEvaluation()}>
                  Re-evaluate
                </Button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-500 leading-relaxed">
                <strong>Official Disclaimer: </strong>
                {singleResult.disclaimer}
              </div>
            </div>
          )}

          {/* Batch Evaluation Results */}
          {!isEvaluating && batchResult && (
            <div className="space-y-6">
              {/* Summary Stats Card */}
              <div className="bg-white rounded-2xl border border-gov-border p-6 shadow-subtle">
                <h3 className="text-base font-bold text-gov-primary mb-4">
                  Assessment Summary Across All Schemes
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                    <div className="text-2xl font-extrabold text-emerald-700">
                      {batchResult.summary.eligibleCount}
                    </div>
                    <div className="text-xs font-semibold text-emerald-800 mt-1">Eligible Schemes</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <div className="text-2xl font-extrabold text-amber-700">
                      {batchResult.summary.incompleteCount}
                    </div>
                    <div className="text-xs font-semibold text-amber-800 mt-1">Incomplete Profile</div>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                    <div className="text-2xl font-extrabold text-rose-700">
                      {batchResult.summary.ineligibleCount}
                    </div>
                    <div className="text-xs font-semibold text-rose-800 mt-1">Not Eligible</div>
                  </div>
                </div>
              </div>

              {/* Eligible Schemes List */}
              {batchResult.data.eligible.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Eligible Welfare Schemes ({batchResult.data.eligible.length})
                  </h4>
                  <div className="space-y-3">
                    {batchResult.data.eligible.map((s) => (
                      <div
                        key={s._id}
                        className="bg-white rounded-xl border border-emerald-200 p-4 shadow-subtle flex flex-col sm:flex-row justify-between items-start gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="success" size="xs">
                              Eligible
                            </Badge>
                            <span className="text-xs text-gov-muted">{s.category}</span>
                          </div>
                          <Link
                            to={`/schemes/${s._id}`}
                            className="font-bold text-sm text-gov-primary hover:text-gov-secondary hover:underline"
                          >
                            {s.schemeName}
                          </Link>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{s.shortDescription}</p>
                        </div>

                        <Link to={`/schemes/${s._id}`} className="shrink-0">
                          <Button variant="outline" size="sm" className="text-xs py-1">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Incomplete Evaluation Schemes List */}
              {batchResult.data.incomplete.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Schemes Needing Additional Information ({batchResult.data.incomplete.length})
                  </h4>
                  <div className="space-y-3">
                    {batchResult.data.incomplete.map((s) => (
                      <div
                        key={s._id}
                        className="bg-white rounded-xl border border-amber-200 p-4 shadow-subtle flex flex-col sm:flex-row justify-between items-start gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="warning" size="xs">
                              Missing Info
                            </Badge>
                            <span className="text-xs text-gov-muted">{s.category}</span>
                          </div>
                          <Link
                            to={`/schemes/${s._id}`}
                            className="font-bold text-sm text-gov-primary hover:text-gov-secondary"
                          >
                            {s.schemeName}
                          </Link>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                            Missing fields: {s.evaluation?.incompleteRules?.map((r) => r.field).join(', ')}
                          </p>
                        </div>

                        <Link to={`/schemes/${s._id}`} className="shrink-0">
                          <Button variant="outline" size="sm" className="text-xs py-1">
                            Check Criteria
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EligibilityCheckerPage;
