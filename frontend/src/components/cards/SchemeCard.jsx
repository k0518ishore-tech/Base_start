import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Building2,
  MapPin,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const SchemeCard = ({ scheme, onBookmarkChange = null }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isBookmarked, setIsBookmarked] = useState(scheme.isBookmarked || false);
  const [isTogglingBookmark, setIsTogglingBookmark] = useState(false);

  const handleBookmarkToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast('Please sign in to save schemes to your bookmarks', 'warning');
      navigate('/login');
      return;
    }

    setIsTogglingBookmark(true);
    try {
      const res = await api.post(`/bookmarks/toggle/${scheme._id}`);
      if (res.data.success) {
        setIsBookmarked(res.data.isBookmarked);
        showToast(res.data.message, 'success');
        if (onBookmarkChange) {
          onBookmarkChange(scheme._id, res.data.isBookmarked);
        }
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update bookmark', 'error');
    } finally {
      setIsTogglingBookmark(false);
    }
  };

  const departmentName = scheme.departmentId?.departmentName || 'Government of India';
  const primaryBenefit = scheme.benefits && scheme.benefits.length > 0 ? scheme.benefits[0] : null;

  return (
    <Card hover className="flex flex-col h-full overflow-hidden transition-all duration-200">
      <div className="p-5 flex-1 flex flex-col">
        {/* Top Badges & Bookmark Action */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5 items-center">
            {scheme.recommendationBadge && (
              <Badge variant="warning" size="xs" className="gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                {scheme.recommendationBadge}
              </Badge>
            )}
            <Badge variant="secondary" size="xs">
              {scheme.category || 'General'}
            </Badge>
            <Badge variant="neutral" size="xs">
              {scheme.schemeLevel || 'Central'}
            </Badge>
            {scheme.verificationStatus === 'VERIFIED' && (
              <Badge variant="success" size="xs" className="gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified
              </Badge>
            )}
          </div>

          <button
            onClick={handleBookmarkToggle}
            disabled={isTogglingBookmark}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Scheme'}
            className={`p-1.5 rounded-lg border transition-colors ${
              isBookmarked
                ? 'bg-amber-50 border-amber-200 text-amber-600'
                : 'border-slate-200 text-slate-400 hover:text-gov-primary hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
          </button>
        </div>

        {/* Scheme Name */}
        <Link
          to={`/schemes/${scheme._id}`}
          className="text-base font-bold text-gov-primary hover:text-gov-secondary transition-colors line-clamp-2 mb-2"
        >
          {scheme.schemeName}
        </Link>

        {/* Department Name */}
        <div className="flex items-center gap-1.5 text-xs text-gov-muted mb-3">
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{departmentName}</span>
        </div>

        {/* Recommendation Reason */}
        {scheme.recommendationReason && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-lg px-2.5 py-1 mb-2.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{scheme.recommendationReason}</span>
          </div>
        )}

        {/* Short Description */}
        <p className="text-xs text-slate-600 line-clamp-3 mb-4 flex-1 leading-relaxed">
          {scheme.shortDescription}
        </p>

        {/* Primary Benefit Callout */}
        {primaryBenefit && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 mb-4">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
              Key Benefit
            </div>
            <div className="text-xs font-bold text-gov-primary">
              {primaryBenefit.amount ? `${primaryBenefit.amount} — ` : ''}
              <span className="font-medium text-slate-700">{primaryBenefit.title}</span>
            </div>
          </div>
        )}

        {/* Footer info: Applicable states */}
        <div className="flex items-center gap-1 text-[11px] text-gov-muted mb-4">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">
            {Array.isArray(scheme.applicableStates)
              ? scheme.applicableStates.slice(0, 2).join(', ') +
                (scheme.applicableStates.length > 2 ? ` +${scheme.applicableStates.length - 2} more` : '')
              : 'All India'}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3 border-t border-gov-border bg-slate-50/70 flex items-center justify-between gap-2">
        <Link
          to={`/eligibility?schemeId=${scheme._id}`}
          className="text-xs font-semibold text-gov-secondary hover:text-blue-800 transition-colors flex items-center gap-1"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Check Eligibility
        </Link>

        <Link to={`/schemes/${scheme._id}`}>
          <Button variant="outline" size="sm" className="text-xs py-1 px-3">
            <span>Details</span>
            <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default SchemeCard;
