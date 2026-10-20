import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  Clock,
  Sparkles,
  Info,
  AlertCircle,
} from 'lucide-react';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterUnread, setFilterUnread] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/notifications', {
        params: { isRead: filterUnread ? 'false' : undefined },
      });
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filterUnread]);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await api.patch('/notifications/read-all');
      if (res.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        showToast('All notifications marked as read', 'success');
      }
    } catch (err) {
      showToast('Failed to update', 'error');
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const res = await api.delete(`/notifications/${id}`);
      if (res.data.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        showToast('Notification deleted', 'success');
      }
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gov-primary tracking-tight">Notifications</h1>
          <p className="text-xs text-gov-muted mt-0.5">
            You have {unreadCount} unread alert(s) regarding your schemes and deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark All Read</span>
            </Button>
          )}

          <button
            onClick={() => setFilterUnread(!filterUnread)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              filterUnread
                ? 'bg-blue-50 border-blue-200 text-gov-secondary'
                : 'bg-white border-gov-border text-slate-600 hover:bg-slate-50'
            }`}
          >
            {filterUnread ? 'Showing Unread' : 'Filter Unread'}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <LoadingSpinner label="Loading notifications..." size="lg" />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description={filterUnread ? 'No unread notifications.' : 'Your notification feed is completely up to date.'}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                !n.isRead
                  ? 'bg-blue-50/50 border-blue-200 shadow-subtle'
                  : 'bg-white border-gov-border opacity-85'
              }`}
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-gov-secondary animate-pulse shrink-0" />
                  )}
                  <span
                    className={`text-xs font-bold ${
                      !n.isRead ? 'text-gov-primary' : 'text-slate-700'
                    }`}
                  >
                    {n.title}
                  </span>
                  <span className="text-[10px] text-gov-muted">
                    {new Date(n.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                {n.relatedSchemeId && (
                  <div className="pt-1">
                    <Link
                      to={`/schemes/${n.relatedSchemeId._id}`}
                      className="text-xs font-semibold text-gov-secondary hover:underline inline-flex items-center gap-1"
                    >
                      <span>Open: {n.relatedSchemeId.schemeName}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n._id)}
                    className="p-1.5 text-slate-400 hover:text-gov-secondary rounded-lg hover:bg-slate-100"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteNotification(n._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
