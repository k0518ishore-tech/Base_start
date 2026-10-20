import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, User, SlidersHorizontal } from 'lucide-react';
import SchemeCard from '../../components/cards/SchemeCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import api from '../../services/api';

const CATEGORIES = [
  'All',
  'Agriculture',
  'Healthcare',
  'Housing',
  'Finance & Loans',
  'Education',
  'Social Welfare',
  'Skill & Livelihood',
];

const RecommendationsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [schemes, setSchemes] = useState([]);
  const [profileSummary, setProfileSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const params = selectedCategory !== 'All' ? { category: selectedCategory } : {};

    api
      .get('/schemes/recommended', { params })
      .then((res) => {
        if (res.data.success) {
          setSchemes(res.data.data);
          if (res.data.profileSummary) {
            setProfileSummary(res.data.profileSummary);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gov-primary tracking-tight">
          Recommended Schemes
        </h1>
      </div>

      {/* Profile Match Context Banner */}
      {profileSummary && (
        <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gov-secondary text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gov-primary text-sm">
                  Evaluated Against Your Citizen Profile
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                  Active
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-slate-700 mt-1.5">
                {profileSummary.occupation && (
                  <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                    Occupation: <strong className="text-slate-900">{profileSummary.occupation}</strong>
                  </span>
                )}
                {profileSummary.state && (
                  <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                    State: <strong className="text-slate-900">{profileSummary.state}</strong>
                  </span>
                )}
                {profileSummary.annualFamilyIncome !== null && profileSummary.annualFamilyIncome !== undefined && (
                  <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                    Family Income: <strong className="text-slate-900">₹{profileSummary.annualFamilyIncome.toLocaleString('en-IN')}/yr</strong>
                  </span>
                )}
                {profileSummary.community && (
                  <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                    Category: <strong className="text-slate-900">{profileSummary.community}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link
            to="/dashboard/profile"
            className="shrink-0 self-start md:self-center px-3 py-1.5 rounded-lg bg-white border border-gov-secondary text-gov-secondary hover:bg-gov-secondary hover:text-white transition-colors text-xs font-semibold flex items-center gap-1 shadow-xs"
          >
            <span>Update Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-gov-primary text-white shadow-xs'
                : 'bg-white border border-gov-border text-slate-600 hover:border-slate-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recommended Schemes Count */}
      <div className="flex items-center justify-between text-xs text-gov-muted pt-1">
        <span className="font-semibold text-slate-700">
          Showing <strong className="text-gov-primary">{schemes.length}</strong> Recommended {schemes.length === 1 ? 'Scheme' : 'Schemes'}
        </span>
      </div>

      {/* Grid */}
      {isLoading ? (
        <LoadingSpinner label="Evaluating criteria and matching recommended schemes..." size="lg" />
      ) : schemes.length === 0 ? (
        <EmptyState
          title="No recommended schemes in this category"
          description="None of the schemes in this sector currently match your profile rules. You can update your profile or check 'All' categories."
          actionLabel="Show All Categories"
          onAction={() => setSelectedCategory('All')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((scheme) => (
            <SchemeCard key={scheme._id} scheme={scheme} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
