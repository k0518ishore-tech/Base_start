import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Filter,
  Sparkles,
  MessageSquare,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Clock,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const AdminNotificationsPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/system-notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load system notifications', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await api.patch(`/admin/system-notifications/${id}/read`);
      if (res.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      const res = await api.patch('/admin/system-notifications/read-all');
      if (res.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        showToast('All notifications marked as read', 'success');
      }
    } catch (err) {
      showToast('Failed to mark all as read', 'error');
    } finally {
      setIsMarkingAll(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'RECOMMENDATIONS') return n.eventType === 'FEEDBACK_TO_RECOMMENDATION';
    if (filterType === 'FEEDBACK') return n.eventType === 'FEEDBACK_RECEIVED';
    if (filterType === 'REGISTRATIONS') return n.eventType === 'USER_REGISTRATION';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getEventVisuals = (eventType) => {
    switch (eventType) {
      case 'FEEDBACK_TO_RECOMMENDATION':
        return {
          icon: Sparkles,
          iconBg: 'bg-amber-100 text-amber-800',
          badgeText: 'Feedback Escalation',
          badgeVariant: 'warning',
          actionText: 'Open Recommendations',
          actionPath: '/admin/recommendations',
        };
      case 'FEEDBACK_RECEIVED':
        return {
          icon: MessageSquare,
          iconBg: 'bg-blue-100 text-gov-secondary',
          badgeText: 'User Feedback',
          badgeVariant: 'secondary',
          actionText: 'View Feedback Desk',
          actionPath: '/admin/feedback',
        };
      case 'USER_REGISTRATION':
        return {
          icon: UserPlus,
          iconBg: 'bg-emerald-100 text-emerald-800',
          badgeText: 'New Citizen',
          badgeVariant: 'success',
          actionText: 'View Citizen Accounts',
          actionPath: '/admin/users',
        };
      default:
        return {
          icon: Bell,
          iconBg: 'bg-slate-100 text-slate-700',
          badgeText: eventType.replace(/_/g, ' '),
          badgeVariant: 'neutral',
          actionText: 'View Dashboard',
          actionPath: '/admin',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-blue-100 text-gov-secondary">
              <Bell className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-gov-secondary uppercase tracking-wider">
              Administrative Notification Feed
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            System Notifications & Lifecycle Events
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Monitor real-time citizen feedback submissions, threshold escalations to recommendations, and new citizen registrations.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            isLoading={isMarkingAll}
            className="gap-1.5 self-start sm:self-center"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Mark All as Read ({unreadCount})</span>
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border border-gov-border p-3 shadow-subtle flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            filterType === 'ALL'
              ? 'bg-gov-secondary text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Events ({notifications.length})
        </button>

        <button
          onClick={() => setFilterType('RECOMMENDATIONS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
            filterType === 'RECOMMENDATIONS'
              ? 'bg-gov-secondary text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Feedback → Recommendation</span>
          <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 rounded-full">
            {notifications.filter((n) => n.eventType === 'FEEDBACK_TO_RECOMMENDATION').length}
          </span>
        </button>

        <button
          onClick={() => setFilterType('FEEDBACK')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
            filterType === 'FEEDBACK'
              ? 'bg-gov-secondary text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
          <span>Feedback Submissions</span>
          <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 rounded-full">
            {notifications.filter((n) => n.eventType === 'FEEDBACK_RECEIVED').length}
          </span>
        </button>

        <button
          onClick={() => setFilterType('REGISTRATIONS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
            filterType === 'REGISTRATIONS'
              ? 'bg-gov-secondary text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
          <span>New Citizens</span>
          <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 rounded-full">
            {notifications.filter((n) => n.eventType === 'USER_REGISTRATION').length}
          </span>
        </button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <LoadingSpinner label="Loading notification events..." size="lg" className="py-20" />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          title="No notification records"
          description="There are currently no notification events in this category."
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const visual = getEventVisuals(notif.eventType);
            const Icon = visual.icon;
            return (
              <div
                key={notif._id}
                onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !notif.isRead
                    ? 'bg-white border-blue-200 shadow-card'
                    : 'bg-white/80 border-slate-200 shadow-subtle hover:bg-white'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className={`w-10 h-10 rounded-xl ${visual.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{notif.title}</span>
                      <Badge variant={visual.badgeVariant} size="xs">
                        {visual.badgeText}
                      </Badge>
                      {!notif.isRead && (
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-600" title="Unread" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {notif.description}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium pt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(notif.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Link */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Link
                    to={visual.actionPath}
                    onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <span>{visual.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminNotificationsPage;
