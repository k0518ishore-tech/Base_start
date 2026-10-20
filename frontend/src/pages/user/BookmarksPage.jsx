import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Search,
  Bell,
  Trash2,
  ExternalLink,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ReminderModal from '../../components/dialogs/ReminderModal';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeSchemeForReminder, setActiveSchemeForReminder] = useState(null);
  const { showToast } = useToast();

  const fetchBookmarks = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/bookmarks', { params: { search } });
      if (res.data.success) {
        setBookmarks(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [search]);

  const handleRemoveBookmark = async (schemeId) => {
    try {
      const res = await api.delete(`/bookmarks/${schemeId}`);
      if (res.data.success) {
        setBookmarks((prev) => prev.filter((b) => b.schemeId._id !== schemeId));
        showToast('Scheme removed from bookmarks', 'success');
      }
    } catch (err) {
      showToast('Failed to remove bookmark', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gov-primary tracking-tight">Saved Schemes</h1>
          <p className="text-xs text-gov-muted mt-0.5">
            You have {bookmarks.length} bookmarked government scheme(s).
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved schemes..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gov-border bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
          />
        </div>
      </div>

      {/* Bookmarks List */}
      {isLoading ? (
        <LoadingSpinner label="Loading saved schemes..." size="lg" />
      ) : bookmarks.length === 0 ? (
        <EmptyState
          title="No saved schemes"
          description="You have not bookmarked any schemes yet. Explore our directory and click the bookmark icon to save schemes for quick access."
          actionLabel="Explore Schemes"
          onAction={() => (window.location.href = '/schemes')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarks.map((b) => {
            const s = b.schemeId;
            if (!s) return null;
            const hasActiveReminder = b.reminder?.enabled && b.reminder?.status === 'UPCOMING';

            return (
              <div
                key={b._id}
                className="bg-white rounded-xl border border-gov-border p-5 shadow-subtle hover:border-gov-secondary/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="secondary" size="xs">
                      {s.category}
                    </Badge>
                    {hasActiveReminder && (
                      <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Reminder Set
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/schemes/${s._id}`}
                    className="font-bold text-sm text-gov-primary hover:text-gov-secondary block mb-1.5"
                  >
                    {s.schemeName}
                  </Link>

                  <div className="flex items-center gap-1.5 text-xs text-gov-muted mb-3">
                    <Building2 className="w-3 h-3 shrink-0" />
                    <span className="truncate">{s.departmentId?.departmentName || s.ministry}</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {s.shortDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link to={`/schemes/${s._id}`}>
                      <Button variant="outline" size="sm" className="text-xs py-1 px-3">
                        Details
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveSchemeForReminder(s)}
                      className="text-xs text-slate-600 hover:text-gov-primary gap-1 py-1"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>{hasActiveReminder ? 'Edit Reminder' : 'Set Reminder'}</span>
                    </Button>
                  </div>

                  <button
                    onClick={() => handleRemoveBookmark(s._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reminder Modal */}
      {activeSchemeForReminder && (
        <ReminderModal
          isOpen={!!activeSchemeForReminder}
          onClose={() => setActiveSchemeForReminder(null)}
          scheme={activeSchemeForReminder}
          onSaved={() => fetchBookmarks()}
        />
      )}
    </div>
  );
};

export default BookmarksPage;
