import React, { useState, useEffect } from 'react';
import { MessageSquare, Reply, CheckCircle2, Clock, Filter, Eye } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const AdminFeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Reply Modal State
  const [activeFeedback, setActiveFeedback] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [newStatus, setNewStatus] = useState('RESOLVED');
  const [isReplying, setIsReplying] = useState(false);

  const { showToast } = useToast();

  const fetchFeedback = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/feedback', {
        params: {
          status: statusFilter !== 'All' ? statusFilter : undefined,
          type: typeFilter !== 'All' ? typeFilter : undefined,
          limit: 100,
        },
      });
      if (res.data.success) {
        setFeedbacks(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [statusFilter, typeFilter]);

  const handleOpenReply = (item) => {
    setActiveFeedback(item);
    setAdminResponse(item.adminResponse || '');
    setNewStatus(item.status || 'RESOLVED');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!activeFeedback) return;

    setIsReplying(true);
    try {
      const res = await api.patch(`/feedback/${activeFeedback._id}`, {
        status: newStatus,
        adminResponse,
      });

      if (res.data.success) {
        showToast('Feedback updated and citizen notified', 'success');
        setActiveFeedback(null);
        fetchFeedback();
      }
    } catch (err) {
      showToast('Failed to update feedback', 'error');
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Feedback Desk</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Review citizen feedback, scheme discrepancy reports, and send administrative replies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-lg border border-gov-border p-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
          >
            <option value="All">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="IN_REVIEW">IN_REVIEW</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs rounded-lg border border-gov-border p-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
          >
            <option value="All">All Types</option>
            <option value="GENERAL">General</option>
            <option value="INCORRECT_SCHEME_INFO">Scheme Info</option>
            <option value="INCORRECT_ELIGIBILITY">Eligibility</option>
            <option value="TECHNICAL_ISSUE">Bug / Technical</option>
            <option value="SUGGESTION">Suggestion</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Loading feedback entries..." size="lg" />
      ) : feedbacks.length === 0 ? (
        <EmptyState title="No feedback entries found" description="No feedback matched your filter." />
      ) : (
        <div className="space-y-3">
          {feedbacks.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl border border-gov-border p-5 shadow-subtle space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {item.feedbackType?.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    From: {item.userId?.fullName} ({item.userId?.email})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gov-muted">
                    {new Date(item.createdAt).toLocaleString('en-IN')}
                  </span>
                  <Badge
                    variant={
                      item.status === 'RESOLVED'
                        ? 'success'
                        : item.status === 'IN_REVIEW'
                        ? 'secondary'
                        : 'warning'
                    }
                    size="xs"
                  >
                    {item.status}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">{item.subject}</h4>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">{item.message}</p>
                {item.schemeId && (
                  <p className="text-[11px] text-gov-secondary mt-1 font-semibold">
                    Related Scheme: {item.schemeId.schemeName}
                  </p>
                )}
              </div>

              {item.adminResponse && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold text-gov-primary block text-[11px] mb-0.5">
                    Your Response:
                  </span>
                  <p>{item.adminResponse}</p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenReply(item)}
                  className="gap-1.5 text-xs py-1"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>{item.adminResponse ? 'Update Response' : 'Reply & Resolve'}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {activeFeedback && (
        <Modal
          isOpen={!!activeFeedback}
          onClose={() => setActiveFeedback(null)}
          title={`Reply to Feedback: ${activeFeedback.subject}`}
          maxWidth="max-w-lg"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setActiveFeedback(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSendReply} isLoading={isReplying}>
                Submit Response
              </Button>
            </>
          }
        >
          <form onSubmit={handleSendReply} className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-500 block mb-1">Citizen Feedback:</span>
              <p className="text-slate-800">{activeFeedback.message}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Feedback Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full text-xs rounded-lg border border-gov-border p-2 bg-white"
              >
                <option value="IN_REVIEW">IN REVIEW</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Administrator Response Message <span className="text-gov-error">*</span>
              </label>
              <textarea
                rows={4}
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Type your official administrative response here..."
                className="w-full text-xs rounded-lg border border-gov-border p-2.5"
                required
              />
              <span className="text-[10px] text-gov-muted mt-1 block">
                This response will be visible to the citizen and generate an in-portal notification.
              </span>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminFeedbackPage;
