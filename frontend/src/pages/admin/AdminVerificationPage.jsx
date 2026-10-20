import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, ExternalLink, Calendar, Check, Search } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const AdminVerificationPage = () => {
  const [schemes, setSchemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const { showToast } = useToast();

  const fetchSchemes = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/schemes?limit=100&includeInactive=true');
      if (res.data.success) {
        setSchemes(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleUpdateStatus = async (schemeId, newStatus) => {
    setUpdatingId(schemeId);
    try {
      const res = await api.patch(`/schemes/${schemeId}/verification`, {
        verificationStatus: newStatus,
        lastVerifiedAt: new Date().toISOString(),
      });
      if (res.data.success) {
        setSchemes((prev) =>
          prev.map((s) => (s._id === schemeId ? { ...s, verificationStatus: newStatus, lastVerifiedAt: new Date() } : s))
        );
        showToast(`Verification status updated to ${newStatus}`, 'success');
      }
    } catch (err) {
      showToast('Failed to update verification', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Data Quality & Source Verification
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Audit official government portal URLs, document lists, and mark verification statuses to prevent fraudulent records.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Auditing verification status..." size="lg" />
      ) : (
        <div className="space-y-4">
          {schemes.map((scheme) => (
            <div
              key={scheme._id}
              className="bg-white rounded-2xl border border-gov-border p-5 shadow-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      scheme.verificationStatus === 'VERIFIED'
                        ? 'success'
                        : scheme.verificationStatus === 'PARTIALLY_VERIFIED'
                        ? 'secondary'
                        : 'warning'
                    }
                    size="xs"
                  >
                    {scheme.verificationStatus}
                  </Badge>
                  <span className="text-xs text-slate-500 font-medium">{scheme.category}</span>
                  {scheme.lastVerifiedAt && (
                    <span className="text-[11px] text-slate-400">
                      Last Verified: {new Date(scheme.lastVerifiedAt).toLocaleDateString('en-IN')}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900">{scheme.schemeName}</h3>

                {/* Source URLs */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {scheme.officialWebsite && (
                    <a
                      href={scheme.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gov-secondary hover:underline flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Official Website</span>
                    </a>
                  )}

                  {scheme.officialApplicationUrl && (
                    <a
                      href={scheme.officialApplicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gov-secondary hover:underline flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Application Portal</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Status Action Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant={scheme.verificationStatus === 'VERIFIED' ? 'primary' : 'outline'}
                  size="sm"
                  disabled={updatingId === scheme._id}
                  onClick={() => handleUpdateStatus(scheme._id, 'VERIFIED')}
                  className="text-xs py-1"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mark Verified</span>
                </Button>

                <Button
                  variant={scheme.verificationStatus === 'NEEDS_VERIFICATION' ? 'danger' : 'outline'}
                  size="sm"
                  disabled={updatingId === scheme._id}
                  onClick={() => handleUpdateStatus(scheme._id, 'NEEDS_VERIFICATION')}
                  className="text-xs py-1"
                >
                  <span>Needs Review</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminVerificationPage;
