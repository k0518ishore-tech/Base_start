import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  CheckCircle2,
  Bookmark,
  Bell,
  ExternalLink,
  ShieldCheck,
  Calendar,
  FileText,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Share2,
  AlertTriangle,
  Award,
  Layers,
  ChevronRight,
} from 'lucide-react';
import SchemeCard from '../../components/cards/SchemeCard';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import Tabs from '../../components/common/Tabs';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ReminderModal from '../../components/dialogs/ReminderModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const SchemeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [scheme, setScheme] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [relatedSchemes, setRelatedSchemes] = useState([]);

  useEffect(() => {
    if (scheme?.category) {
      api
        .get(`/schemes?category=${encodeURIComponent(scheme.category)}&limit=4`)
        .then((res) => {
          if (res.data.success) {
            setRelatedSchemes(res.data.data.filter((s) => s._id !== scheme._id).slice(0, 3));
          }
        })
        .catch(() => {});
    }
  }, [scheme?._id, scheme?.category]);

  useEffect(() => {
    const fetchScheme = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/schemes/${id}`);
        if (res.data.success) {
          setScheme(res.data.data);
          setIsBookmarked(res.data.data.isBookmarked);
        }
      } catch (err) {
        showToast('Scheme not found or failed to load', 'error');
        navigate('/schemes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchScheme();
  }, [id]);

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in to save schemes to your bookmarks', 'warning');
      navigate('/login');
      return;
    }

    try {
      const res = await api.post(`/bookmarks/toggle/${scheme._id}`);
      if (res.data.success) {
        setIsBookmarked(res.data.isBookmarked);
        showToast(res.data.message, 'success');
      }
    } catch (err) {
      showToast('Failed to update bookmark', 'error');
    }
  };

  if (isLoading || !scheme) {
    return <LoadingSpinner label="Loading scheme details..." size="lg" className="py-24" />;
  }

  const tabs = [
    { id: 'overview', label: 'Overview & Objectives' },
    { id: 'benefits', label: 'Benefits & Assistance' },
    { id: 'eligibility', label: 'Eligibility Criteria & Rules' },
    { id: 'documents', label: 'Required Documents' },
    { id: 'process', label: 'Application Steps' },
    { id: 'sources', label: 'Official Portals & Sources' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gov-muted">
        <Link to="/" className="hover:text-gov-primary">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/schemes" className="hover:text-gov-primary">
          Schemes
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gov-text font-medium truncate max-w-xs">{scheme.schemeName}</span>
      </nav>

      {/* Scheme Header Card */}
      <div className="bg-white rounded-2xl border border-gov-border p-6 sm:p-8 shadow-subtle">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary" size="sm">
                {scheme.category}
              </Badge>
              <Badge variant="neutral" size="sm">
                {scheme.schemeLevel} Scheme
              </Badge>
              {scheme.verificationStatus === 'VERIFIED' ? (
                <Badge variant="success" size="sm" className="gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified by Authority
                </Badge>
              ) : (
                <Badge variant="warning" size="sm">
                  {scheme.verificationStatus}
                </Badge>
              )}
            </div>

            {/* Scheme Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gov-primary tracking-tight leading-snug">
              {scheme.schemeName}
            </h1>

            {/* Department and Ministry info */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gov-muted pt-1">
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <Building2 className="w-4 h-4 text-gov-secondary" />
                <Link
                  to={`/departments/${scheme.departmentId?._id}`}
                  className="hover:text-gov-secondary underline-offset-2 hover:underline"
                >
                  {scheme.departmentId?.departmentName || scheme.ministry}
                </Link>
              </div>

              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{scheme.applicableStates?.join(', ') || 'All India'}</span>
              </div>

              {scheme.lastVerifiedAt && (
                <div className="flex items-center gap-1 text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Verified: {new Date(scheme.lastVerifiedAt).toLocaleDateString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap sm:flex-nowrap lg:flex-col gap-2.5 shrink-0">
            <Link to={`/eligibility?schemeId=${scheme._id}`} className="w-full">
              <Button variant="primary" size="md" className="w-full gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                <span>Check My Eligibility</span>
              </Button>
            </Link>

            <div className="flex gap-2 w-full">
              <Button
                variant={isBookmarked ? 'secondary' : 'outline'}
                size="md"
                onClick={handleBookmarkToggle}
                className="flex-1 gap-1.5"
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-white' : ''}`} />
                <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  if (!isAuthenticated) {
                    showToast('Please sign in to schedule reminders', 'warning');
                    navigate('/login');
                  } else {
                    setIsReminderModalOpen(true);
                  }
                }}
                className="gap-1.5"
                title="Set Date Reminder"
              >
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Reminder</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="bg-white rounded-2xl border border-gov-border overflow-hidden shadow-subtle">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="px-6 pt-2 bg-slate-50" />

        <div className="p-6 sm:p-8">
          {/* Tab 1: Overview & Objectives */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gov-primary mb-3">Scheme Overview</h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {scheme.fullDescription}
                </p>
              </div>

              {scheme.objectives && scheme.objectives.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gov-primary mb-3">Key Objectives</h3>
                  <ul className="space-y-2">
                    {scheme.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {scheme.targetBeneficiaries && scheme.targetBeneficiaries.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gov-primary uppercase tracking-wider mb-2">
                    Target Beneficiary Groups
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {scheme.targetBeneficiaries.map((b, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Benefits & Financial Assistance */}
          {activeTab === 'benefits' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gov-primary mb-2">
                  Sanctioned Benefits & Assistance
                </h3>
                <p className="text-sm text-gov-muted mb-6">
                  Direct financial grants, subsidies, or healthcare cover sanctioned under this scheme.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scheme.benefits?.map((benefit, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-xl border border-gov-border bg-slate-50/70 hover:bg-white hover:border-gov-secondary transition-all"
                  >
                    {benefit.amount && (
                      <div className="text-xl font-extrabold text-gov-secondary mb-1">
                        {benefit.amount}
                      </div>
                    )}
                    <h4 className="text-sm font-bold text-gov-primary mb-1">{benefit.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Eligibility Criteria & Rules */}
          {activeTab === 'eligibility' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gov-primary mb-2">
                  Official Eligibility Criteria
                </h3>
                <p className="text-sm text-gov-muted mb-4">
                  {scheme.eligibilitySummary ||
                    'Review the criteria conditions evaluated by the portal engine.'}
                </p>
              </div>

              {/* Active Rules Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Configured Rule Requirements ({scheme.rulesCount || 0})
                </h4>

                {scheme.rules && scheme.rules.length > 0 ? (
                  scheme.rules.map((rule) => (
                    <div
                      key={rule._id}
                      className="p-4 rounded-xl border border-gov-border bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gov-primary">{rule.ruleName}</span>
                          {rule.isMandatory && (
                            <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded font-semibold">
                              Mandatory
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{rule.description}</p>
                      </div>

                      <div className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-mono text-gov-secondary shrink-0">
                        {rule.field} {rule.operator} {JSON.stringify(rule.expectedValue)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    General eligibility applies. Click Check Eligibility to test against standard criteria.
                  </p>
                )}
              </div>

              <div className="pt-4">
                <Link to={`/eligibility?schemeId=${scheme._id}`}>
                  <Button variant="primary" size="md" className="gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Run Automated Eligibility Evaluation</span>
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Tab 4: Required Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gov-primary mb-2">
                  Required Documentation Checklist
                </h3>
                <p className="text-sm text-gov-muted mb-4">
                  Ensure you possess valid digital or self-attested physical copies before applying.
                </p>
              </div>

              <div className="space-y-3">
                {scheme.requiredDocuments?.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-gov-border bg-white flex items-start gap-3.5"
                  >
                    <FileText className="w-5 h-5 text-gov-secondary shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gov-primary">{doc.name}</span>
                        {doc.mandatory ? (
                          <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded font-semibold">
                            Mandatory
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                            Optional
                          </span>
                        )}
                      </div>
                      {doc.notes && <p className="text-xs text-slate-500 mt-1">{doc.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Application Steps */}
          {activeTab === 'process' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gov-primary mb-2">
                  Step-by-Step Application Procedure
                </h3>
                <p className="text-sm text-gov-muted mb-4">
                  Follow the official protocol to register your application directly with the authority.
                </p>
              </div>

              <ol className="space-y-4">
                {scheme.applicationProcedure?.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3.5">
                    <span className="w-7 h-7 rounded-full bg-blue-100 text-gov-secondary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-slate-700 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Tab 6: Official Sources & Links */}
          {activeTab === 'sources' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gov-primary mb-2">
                  Official Government Portals & Sources
                </h3>
                <p className="text-sm text-gov-muted mb-4">
                  Always verify official domain extensions (.gov.in or .nic.in) before submitting sensitive personal identification numbers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {scheme.officialApplicationUrl && (
                  <a
                    href={scheme.officialApplicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-xl border border-gov-secondary/40 bg-blue-50/50 hover:bg-blue-50 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-gov-secondary uppercase tracking-wider mb-1">
                        Application Form
                      </div>
                      <div className="text-sm font-bold text-gov-primary group-hover:underline">
                        Apply on Official Portal
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gov-secondary" />
                  </a>
                )}

                {scheme.officialStatusUrl && (
                  <a
                    href={scheme.officialStatusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-xl border border-gov-border bg-white hover:border-gov-secondary transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Application Tracking
                      </div>
                      <div className="text-sm font-bold text-gov-primary group-hover:underline">
                        Check Beneficiary Status
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-slate-400" />
                  </a>
                )}

                {scheme.officialWebsite && (
                  <a
                    href={scheme.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-xl border border-gov-border bg-white hover:border-gov-secondary transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Department Portal
                      </div>
                      <div className="text-sm font-bold text-gov-primary group-hover:underline truncate max-w-xs">
                        {scheme.officialWebsite}
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-slate-400" />
                  </a>
                )}
              </div>

              {/* Source Verification Box */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 text-xs text-emerald-900 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold">Verified Public Records Policy:</span>
                  <p className="text-emerald-800">
                    This scheme has been verified against official records published by {scheme.ministry}. We do not host fraudulent third-party application forms or charge fees of any kind.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Schemes Section */}
      {relatedSchemes.length > 0 && (
        <div className="pt-8 border-t border-gov-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gov-primary">
                Related {scheme.category} Schemes
              </h2>
              <p className="text-xs text-gov-muted">
                Other welfare programs citizens frequently explore alongside this scheme.
              </p>
            </div>
            <Link
              to={`/schemes?category=${encodeURIComponent(scheme.category)}`}
              className="text-xs font-semibold text-gov-secondary hover:underline flex items-center gap-1"
            >
              <span>View all in {scheme.category}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedSchemes.map((rel) => (
              <SchemeCard key={rel._id} scheme={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        scheme={scheme}
      />
    </div>
  );
};

export default SchemeDetailPage;
