import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  Sliders,
  Eye,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Building2,
  ShieldCheck,
  Check,
  X,
  MessageSquare,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const AdminRecommendationsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedCardId, setExpandedCardId] = useState(null);

  // Status Update Modal
  const [selectedRec, setSelectedRec] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const query = statusFilter !== 'All' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/admin/recommendations${query}`);
      if (res.data.success) {
        setRecommendations(res.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load recommendations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [statusFilter]);

  const handleOpenStatusModal = (rec, status) => {
    setSelectedRec(rec);
    setNewStatus(status);
    setAdminNotes(rec.adminNotes || '');
  };

  const handleUpdateStatus = async () => {
    if (!selectedRec || !newStatus) return;
    setIsUpdating(true);
    try {
      const res = await api.patch(`/admin/recommendations/${selectedRec._id}/status`, {
        status: newStatus,
        adminNotes,
      });
      if (res.data.success) {
        showToast(`Recommendation marked as ${newStatus}`, 'success');
        setSelectedRec(null);
        fetchRecommendations();
      }
    } catch (err) {
      showToast('Failed to update recommendation', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredRecs = recommendations.filter((r) => {
    const q = search.toLowerCase();
    const schemeName = r.schemeId?.schemeName?.toLowerCase() || '';
    const title = r.title.toLowerCase();
    const desc = r.description.toLowerCase();
    return schemeName.includes(q) || title.includes(q) || desc.includes(q);
  });

  const totalCount = recommendations.length;
  const pendingCount = recommendations.filter((r) => r.status === 'PENDING').length;
  const inReviewCount = recommendations.filter((r) => r.status === 'IN_REVIEW').length;
  const implementedCount = recommendations.filter((r) => r.status === 'IMPLEMENTED').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning" size="xs">Pending Review</Badge>;
      case 'IN_REVIEW':
        return <Badge variant="secondary" size="xs">In Review</Badge>;
      case 'IMPLEMENTED':
        return <Badge variant="success" size="xs">Implemented</Badge>;
      case 'DISMISSED':
        return <Badge variant="neutral" size="xs">Dismissed</Badge>;
      default:
        return <Badge variant="neutral" size="xs">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-amber-100 text-amber-800">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Automated Feedback Aggregation
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Scheme Improvement Recommendations
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Repeated citizen feedback reaching the <strong>threshold of 5 distinct citizens</strong> is automatically escalated here for administrative action.
          </p>
        </div>

        {/* Threshold indicator pill */}
        <div className="flex items-center gap-2 self-start sm:self-center bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs">
          <Users className="w-4 h-4 text-amber-400" />
          <span>Escalation Threshold:</span>
          <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-md text-[11px]">
            5 Citizens
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-gov-secondary flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{totalCount}</div>
            <div className="text-xs text-slate-500 font-medium">Total Recommendations</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{pendingCount}</div>
            <div className="text-xs text-slate-500 font-medium">Pending Action</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{inReviewCount}</div>
            <div className="text-xs text-slate-500 font-medium">In Investigation</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">{implementedCount}</div>
            <div className="text-xs text-slate-500 font-medium">Implemented Rules</div>
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-gov-border p-4 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['All', 'PENDING', 'IN_REVIEW', 'IMPLEMENTED', 'DISMISSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-gov-secondary text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'All' ? 'All' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by scheme or issue..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gov-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
          />
        </div>
      </div>

      {/* Recommendations Feed */}
      {isLoading ? (
        <LoadingSpinner label="Evaluating feedback clusters and recommendations..." size="lg" className="py-20" />
      ) : filteredRecs.length === 0 ? (
        <EmptyState
          title="No recommendations found"
          description="When 5 or more distinct citizens submit similar feedback on a scheme or eligibility rule, it will automatically escalate here."
        />
      ) : (
        <div className="space-y-4">
          {filteredRecs.map((rec) => {
            const isExpanded = expandedCardId === rec._id;
            return (
              <div
                key={rec._id}
                className="bg-white rounded-2xl border border-gov-border p-5 shadow-subtle hover:border-gov-secondary/40 transition-all space-y-4"
              >
                {/* Top Row: Meta Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                      {rec.citizenCount} Citizens Reported (Threshold: {rec.threshold})
                    </span>

                    {rec.schemeId && (
                      <span className="text-[11px] font-bold bg-blue-50 text-gov-secondary px-2.5 py-0.5 rounded-full">
                        {rec.schemeId.category}
                      </span>
                    )}

                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {new Date(rec.updatedAt || rec.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(rec.status)}
                  </div>
                </div>

                {/* Scheme & Issue Title */}
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {rec.title}
                  </h3>
                  {rec.schemeId && (
                    <div className="flex items-center gap-1.5 text-xs text-gov-secondary font-bold mt-0.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Target Scheme: {rec.schemeId.schemeName}</span>
                    </div>
                  )}
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {rec.description}
                  </p>
                </div>

                {/* Actionable Advice Box */}
                {rec.suggestedAction && (
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-bold block mb-0.5">Recommended Administrative Action:</span>
                      <p className="text-amber-800 text-[11px] leading-relaxed">{rec.suggestedAction}</p>
                    </div>
                  </div>
                )}

                {/* Expandable Citizen Feedback Excerpts */}
                {rec.feedbackIds && rec.feedbackIds.length > 0 && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setExpandedCardId(isExpanded ? null : rec._id)}
                      className="text-xs font-bold text-gov-secondary hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>
                        {isExpanded ? 'Hide' : 'Inspect'} Citizen Complaints ({rec.feedbackIds.length})
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-2 max-h-60 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                        {rec.feedbackIds.map((fb, idx) => (
                          <div key={fb._id || idx} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span className="font-bold text-slate-700">
                                {fb.userId?.fullName || `Citizen #${idx + 1}`}
                              </span>
                              <span>{new Date(fb.createdAt).toLocaleDateString('en-IN')}</span>
                            </div>
                            <div className="font-semibold text-slate-800 text-[11px]">{fb.subject}</div>
                            <p className="text-slate-600 text-[11px] leading-relaxed italic">"{fb.message}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Controls Bar */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* 1-Click Rule Builder Navigation */}
                    {rec.schemeId && (
                      <Link
                        to={`/admin/rules?schemeId=${rec.schemeId._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
                      >
                        <Sliders className="w-3.5 h-3.5 text-amber-400" />
                        <span>Open in Rule Builder</span>
                      </Link>
                    )}

                    {/* Show Scheme Details */}
                    {rec.schemeId && (
                      <Link
                        to={`/schemes/${rec.schemeId._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-gov-secondary text-xs font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Show Scheme</span>
                      </Link>
                    )}
                  </div>

                  {/* Status Modification Buttons */}
                  <div className="flex items-center gap-2">
                    {rec.status !== 'IMPLEMENTED' && (
                      <button
                        type="button"
                        onClick={() => handleOpenStatusModal(rec, 'IMPLEMENTED')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Implemented</span>
                      </button>
                    )}

                    {rec.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => handleOpenStatusModal(rec, 'IN_REVIEW')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <span>Investigate</span>
                      </button>
                    )}

                    {rec.status !== 'DISMISSED' && (
                      <button
                        type="button"
                        onClick={() => handleOpenStatusModal(rec, 'DISMISSED')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Dismiss</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Status Update Modal */}
      {selectedRec && (
        <Modal
          isOpen={Boolean(selectedRec)}
          onClose={() => setSelectedRec(null)}
          title={`Update Recommendation: ${newStatus.replace('_', ' ')}`}
          maxWidth="max-w-md"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setSelectedRec(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleUpdateStatus} isLoading={isUpdating}>
                Confirm Update
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              You are updating the status of this recommendation to <strong>{newStatus}</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Administrative Notes / Action Taken
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Updated annual income threshold rule to ₹3,00,000 in Rule Builder to resolve citizen complaints..."
                className="w-full text-xs rounded-lg border border-gov-border p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminRecommendationsPage;
