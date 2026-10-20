import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bell,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const RemindersPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'history'
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [historyReminders, setHistoryReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchReminders = async () => {
    setIsLoading(true);
    try {
      const [upRes, histRes] = await Promise.all([
        api.get('/reminders/upcoming'),
        api.get('/reminders/history'),
      ]);

      if (upRes.data.success) setUpcomingReminders(upRes.data.data);
      if (histRes.data.success) setHistoryReminders(histRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleCancelReminder = async (bookmarkId) => {
    try {
      const res = await api.patch(`/reminders/${bookmarkId}/cancel`);
      if (res.data.success) {
        showToast('Reminder cancelled', 'success');
        fetchReminders();
      }
    } catch (err) {
      showToast('Failed to cancel reminder', 'error');
    }
  };

  const handleCompleteReminder = async (bookmarkId) => {
    try {
      const res = await api.patch(`/reminders/${bookmarkId}/complete`);
      if (res.data.success) {
        showToast('Reminder marked as completed', 'success');
        fetchReminders();
      }
    } catch (err) {
      showToast('Failed to complete reminder', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gov-primary tracking-tight">Scheme Reminders</h1>
        <p className="text-xs text-gov-muted mt-0.5">
          Automated background cron jobs monitor these dates and notify you when actions are due.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gov-border">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'upcoming'
              ? 'border-gov-secondary text-gov-secondary'
              : 'border-transparent text-slate-500 hover:text-gov-primary'
          }`}
        >
          Upcoming Reminders ({upcomingReminders.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-gov-secondary text-gov-secondary'
              : 'border-transparent text-slate-500 hover:text-gov-primary'
          }`}
        >
          Past / Completed History ({historyReminders.length})
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner label="Loading reminders..." size="lg" />
      ) : activeTab === 'upcoming' ? (
        upcomingReminders.length === 0 ? (
          <EmptyState
            title="No upcoming reminders"
            description="You don't have any pending reminders scheduled. You can set reminders on any scheme from its detail page or your saved bookmarks."
            actionLabel="View Saved Schemes"
            onAction={() => (window.location.href = '/dashboard/bookmarks')}
          />
        ) : (
          <div className="space-y-3">
            {upcomingReminders.map((r) => (
              <div
                key={r._id}
                className="bg-white rounded-xl border border-gov-border p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                      UPCOMING
                    </span>
                    <span className="text-xs text-gov-muted">{r.schemeId?.category}</span>
                  </div>

                  <Link
                    to={`/schemes/${r.schemeId?._id}`}
                    className="font-bold text-sm text-gov-primary hover:text-gov-secondary block"
                  >
                    {r.schemeId?.schemeName}
                  </Link>

                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1 font-semibold text-gov-secondary">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(r.reminder.reminderDate).toLocaleString('en-IN')}</span>
                    </div>
                    <span>({r.reminder.timezone || 'Asia/Kolkata'})</span>
                  </div>

                  {r.reminder.message && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg mt-1">
                      "{r.reminder.message}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCompleteReminder(r._id)}
                    className="text-xs py-1 text-emerald-700 hover:bg-emerald-50 border-emerald-200 gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelReminder(r._id)}
                    className="text-xs py-1 text-slate-500 hover:text-rose-600 gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </Button>

                  <Link to={`/schemes/${r.schemeId?._id}`}>
                    <Button variant="outline" size="sm" className="text-xs py-1">
                      Scheme
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : historyReminders.length === 0 ? (
        <EmptyState
          title="No reminder history"
          description="Past triggered, completed, or cancelled reminders will appear here."
        />
      ) : (
        <div className="space-y-3">
          {historyReminders.map((r) => {
            const status = r.reminder?.status;
            let statusBadge = (
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                {status}
              </span>
            );
            if (status === 'TRIGGERED') {
              statusBadge = (
                <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                  TRIGGERED / NOTIFIED
                </span>
              );
            } else if (status === 'COMPLETED') {
              statusBadge = (
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                  COMPLETED
                </span>
              );
            } else if (status === 'CANCELLED') {
              statusBadge = (
                <span className="text-[10px] bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full font-bold">
                  CANCELLED
                </span>
              );
            }

            return (
              <div
                key={r._id}
                className="bg-white rounded-xl border border-gov-border p-4 shadow-subtle flex items-center justify-between gap-4 opacity-90"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {statusBadge}
                    <span className="text-xs text-gov-muted">
                      {new Date(r.reminder.reminderDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <Link
                    to={`/schemes/${r.schemeId?._id}`}
                    className="font-bold text-xs text-gov-primary hover:underline"
                  >
                    {r.schemeId?.schemeName}
                  </Link>
                </div>

                <Link to={`/schemes/${r.schemeId?._id}`}>
                  <Button variant="outline" size="sm" className="text-xs py-1">
                    View Scheme
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RemindersPage;
