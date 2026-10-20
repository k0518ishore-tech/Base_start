import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertTriangle, Calendar, ExternalLink } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';

const EligibilityHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api
      .get('/eligibility/history')
      .then((res) => {
        if (res.data.success) {
          setHistory(res.data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gov-primary tracking-tight">
          Eligibility Evaluation History
        </h1>
        <p className="text-xs text-gov-muted mt-0.5">
          Audit log of all preliminary evaluations run against your profile.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Loading evaluation history..." size="lg" />
      ) : history.length === 0 ? (
        <EmptyState
          title="No evaluations on record"
          description="You haven't evaluated your profile against any schemes yet. Visit the Eligibility Checker to run your first automated assessment."
          actionLabel="Go to Eligibility Checker"
          onAction={() => (window.location.href = '/eligibility')}
        />
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl border border-gov-border p-4 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={
                      item.overallStatus === 'ELIGIBLE'
                        ? 'success'
                        : item.overallStatus === 'NOT_ELIGIBLE'
                        ? 'danger'
                        : 'warning'
                    }
                    size="xs"
                  >
                    {item.overallStatus}
                  </Badge>
                  <span className="text-xs text-gov-muted">
                    {new Date(item.evaluatedAt).toLocaleString('en-IN')}
                  </span>
                </div>

                <Link
                  to={`/schemes/${item.schemeId?._id}`}
                  className="font-bold text-sm text-gov-primary hover:text-gov-secondary block"
                >
                  {item.schemeId?.schemeName || 'Evaluated Scheme'}
                </Link>

                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>Passed: {item.passedRules?.length || 0}</span>
                  <span>Failed: {item.failedRules?.length || 0}</span>
                  <span>Incomplete: {item.incompleteRules?.length || 0}</span>
                </div>
              </div>

              {item.schemeId && (
                <Link to={`/schemes/${item.schemeId._id}`} className="shrink-0">
                  <Button variant="outline" size="sm" className="text-xs py-1">
                    View Scheme
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EligibilityHistoryPage;
