import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const FEEDBACK_TYPES = [
  { value: 'GENERAL', label: 'General Feedback' },
  { value: 'INCORRECT_SCHEME_INFO', label: 'Incorrect Scheme Information' },
  { value: 'INCORRECT_ELIGIBILITY', label: 'Incorrect Eligibility Evaluation' },
  { value: 'TECHNICAL_ISSUE', label: 'Technical Issue / Bug' },
  { value: 'SUGGESTION', label: 'Feature Suggestion' },
];

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [feedbackType, setFeedbackType] = useState('GENERAL');
  const [schemeId, setSchemeId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchMyFeedback = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/feedback/my');
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
    fetchMyFeedback();

    api
      .get('/schemes?limit=2500&sortBy=name_asc')
      .then((res) => {
        if (res.data.success) {
          setSchemes(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      showToast('Please provide a subject and message', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        feedbackType,
        schemeId: schemeId || undefined,
        subject,
        message,
      };

      const res = await api.post('/feedback', payload);
      if (res.data.success) {
        showToast('Feedback submitted successfully! An administrator will review it.', 'success');
        setSubject('');
        setMessage('');
        setSchemeId('');
        fetchMyFeedback();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit feedback', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gov-primary tracking-tight">Citizen Feedback & Support</h1>
        <p className="text-xs text-gov-muted mt-0.5">
          Submit corrections, report eligibility discrepancies, or suggest features directly to our portal administration.
        </p>
      </div>

      {/* Submission Form Card */}
      <div className="bg-white rounded-2xl border border-gov-border p-6 shadow-subtle space-y-4">
        <h2 className="text-sm font-bold text-gov-primary border-b border-gov-border pb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gov-secondary" />
          <span>Submit Feedback</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Feedback Category"
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              options={FEEDBACK_TYPES}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gov-text mb-1.5">
                Related Scheme (Optional)
              </label>
              <select
                value={schemeId}
                onChange={(e) => setSchemeId(e.target.value)}
                className="w-full text-xs rounded-lg border border-gov-border p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
              >
                <option value="">General (Not scheme-specific)</option>
                {schemes.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.schemeName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief description of the feedback or issue"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gov-text mb-1.5">
              Detailed Message <span className="text-gov-error">*</span>
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the issue or suggestion in detail..."
              className="w-full text-xs rounded-lg border border-gov-border p-3 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="md" isLoading={isSubmitting} className="gap-2 shadow-sm">
              <Send className="w-4 h-4" />
              <span>Submit Feedback</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Submitted Feedback History */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-gov-primary">Your Submitted Feedback ({feedbacks.length})</h3>

        {isLoading ? (
          <LoadingSpinner label="Loading feedback history..." size="md" />
        ) : feedbacks.length === 0 ? (
          <EmptyState
            title="No feedback submitted"
            description="You have not submitted any feedback yet. If you notice any scheme discrepancies, feel free to use the form above."
          />
        ) : (
          <div className="space-y-4">
            {feedbacks.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl border border-gov-border p-5 shadow-subtle space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {item.feedbackType.replace(/_/g, ' ')}
                    </span>
                    {item.schemeId && (
                      <span className="text-xs text-gov-muted truncate max-w-xs">
                        Scheme: {item.schemeId.schemeName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gov-muted">
                      {new Date(item.createdAt).toLocaleDateString('en-IN')}
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
                  <h4 className="text-sm font-bold text-gov-primary">{item.subject}</h4>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">{item.message}</p>
                </div>

                {/* Admin response banner if available */}
                {item.adminResponse && (
                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 text-xs text-emerald-950 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Administrator Response:</span>
                    </div>
                    <p className="text-slate-700">{item.adminResponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
