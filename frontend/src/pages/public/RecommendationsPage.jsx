import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  User,
  SlidersHorizontal,
  Search,
  RotateCcw,
  History,
  TrendingUp,
  Brain,
  Trash2,
  Filter,
  ShieldCheck,
  Compass,
  Lightbulb,
} from 'lucide-react';
import SchemeCard from '../../components/cards/SchemeCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
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
  'Women & Child',
];

const QUICK_STARTER_TOPICS = [
  { label: 'College Scholarships', query: 'scholarship college student' },
  { label: 'Free Laptop & Tech', query: 'laptop tablet education' },
  { label: 'Farmer Direct Support', query: 'farmer agriculture kisan' },
  { label: 'Healthcare & Insurance', query: 'ayushman health insurance' },
  { label: 'Women & Self-Help Loans', query: 'women self help group loan' },
];

const RecommendationsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  // Mode switcher: 'rag' (AI Search History) vs 'profile' (Demographic Profile)
  const [activeTab, setActiveTab] = useState('rag');

  // --- Profile Mode State ---
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [profileSchemes, setProfileSchemes] = useState([]);
  const [profileSummary, setProfileSummary] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // --- RAG AI Search Mode State ---
  const [ragSchemes, setRagSchemes] = useState([]);
  const [searchInsights, setSearchInsights] = useState({
    searchedTopics: [],
    recentQueries: [],
    aiSummary: '',
  });
  const [hasSearchHistory, setHasSearchHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [isRagLoading, setIsRagLoading] = useState(true);
  const [isClearingHistory, setIsClearingHistory] = useState(false);

  // Load RAG Recommendations
  const fetchRagRecommendations = async (customQuery = '') => {
    setIsRagLoading(true);
    try {
      const params = {};
      if (customQuery && customQuery.trim()) {
        params.query = customQuery.trim();
      }
      const res = await api.get('/schemes/rag-recommendations', { params });
      if (res.data.success) {
        setRagSchemes(res.data.data || []);
        setHasSearchHistory(Boolean(res.data.hasSearchHistory));
        if (res.data.searchInsights) {
          setSearchInsights(res.data.searchInsights);
        }
      }
    } catch (err) {
      console.error('Error fetching RAG recommendations:', err);
    } finally {
      setIsRagLoading(false);
    }
  };

  // Load Profile-based Recommendations
  const fetchProfileRecommendations = async () => {
    setIsProfileLoading(true);
    try {
      const params = selectedCategory !== 'All' ? { category: selectedCategory } : {};
      const res = await api.get('/schemes/recommended', { params });
      if (res.data.success) {
        setProfileSchemes(res.data.data || []);
        if (res.data.profileSummary) {
          setProfileSummary(res.data.profileSummary);
        }
      }
    } catch (err) {
      console.error('Error fetching profile recommendations:', err);
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRagRecommendations(activeSearchTerm);
  }, [activeSearchTerm]);

  useEffect(() => {
    if (activeTab === 'profile') {
      fetchProfileRecommendations();
    }
  }, [activeTab, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setActiveSearchTerm(searchQuery.trim());
  };

  const handleTopicClick = (topic) => {
    setSearchQuery(topic);
    setActiveSearchTerm(topic);
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setActiveSearchTerm('');
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your search and browsing history? This will reset your AI recommendations.')) {
      return;
    }
    setIsClearingHistory(true);
    try {
      const res = await api.delete('/search-history/clear');
      if (res.data.success) {
        showToast('Search history cleared successfully', 'success');
        setSearchQuery('');
        setActiveSearchTerm('');
        fetchRagRecommendations('');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to clear search history', 'error');
    } finally {
      setIsClearingHistory(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gov-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Intelligent Matching Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gov-primary tracking-tight">
            Recommended Schemes
          </h1>
          <p className="text-sm text-gov-muted mt-1">
            Personalized welfare initiatives retrieved from your search intent and verified against your citizen profile.
          </p>
        </div>

        {/* Tab Toggle Switcher */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto shrink-0 shadow-2xs">
          <button
            onClick={() => setActiveTab('rag')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'rag'
                ? 'bg-gov-primary text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Brain className="w-4 h-4 text-amber-400" />
            <span>AI Search Suggestions (RAG)</span>
            {hasSearchHistory && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Active search history detected" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-gov-primary text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Profile Demographic Matched</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: RAG RECOMMENDATIONS ================= */}
      {activeTab === 'rag' && (
        <div className="space-y-6">
          {/* AI Search & Retrieval Insights Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c2340] via-[#12335a] to-[#1a4577] text-white p-5 sm:p-6 shadow-card border border-blue-900/40">
            {/* Background geometric accents */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 -mb-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1 text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-md">
                    <Brain className="w-3.5 h-3.5 text-amber-300" />
                    RAG Knowledge Retrieval
                  </span>
                  <span className="text-[11px] font-medium text-blue-200">
                    Past Search & Browsing History Synthesis
                  </span>
                </div>

                <p className="text-sm sm:text-base text-blue-50 leading-relaxed font-medium">
                  {searchInsights.aiSummary || (
                    hasSearchHistory
                      ? 'Analyzing your recent portal search history and cross-checking eligibility rules in real time...'
                      : 'Explore welfare schemes by typing a search keyword or selecting a recommended topic below.'
                  )}
                </p>

                {/* Topics Pills */}
                {searchInsights.searchedTopics && searchInsights.searchedTopics.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className="text-xs text-blue-200 font-semibold flex items-center gap-1">
                      <History className="w-3.5 h-3.5 text-blue-300" />
                      Learned Interests:
                    </span>
                    {searchInsights.searchedTopics.map((topic, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTopicClick(topic)}
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium transition-colors border ${
                          activeSearchTerm.toLowerCase() === topic.toLowerCase()
                            ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-xs'
                            : 'bg-white/10 hover:bg-white/20 text-blue-100 border-white/20'
                        }`}
                      >
                        #{topic}
                      </button>
                    ))}
                    {activeSearchTerm && (
                      <button
                        onClick={handleResetSearch}
                        className="text-xs text-amber-300 underline hover:text-amber-200 ml-1 font-medium flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Interactive Quick Search Box */}
              <div className="lg:w-80 shrink-0 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15 shadow-inner">
                <form onSubmit={handleSearchSubmit} className="space-y-2">
                  <div className="text-[11px] font-bold text-blue-200 uppercase tracking-wider flex items-center justify-between">
                    <span>Search or Test Topic</span>
                    {hasSearchHistory && isAuthenticated && (
                      <button
                        type="button"
                        onClick={handleClearHistory}
                        disabled={isClearingHistory}
                        title="Clear all stored search interactions"
                        className="text-blue-300 hover:text-rose-300 transition-colors flex items-center gap-1 text-[10px]"
                      >
                        <Trash2 className="w-3 h-3" />
                        Clear History
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 text-blue-200 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. laptop, solar, scholarship..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white/95 text-slate-900 placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 border border-transparent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-1.5 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      Retrieve
                    </button>
                    {activeSearchTerm && (
                      <button
                        type="button"
                        onClick={handleResetSearch}
                        className="py-1.5 px-3 rounded-lg bg-white/15 hover:bg-white/25 text-white font-medium text-xs transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Quick Starter Topics (When starting out or looking for inspiration) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-slate-500 font-semibold shrink-0 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Explore Topics:
            </span>
            {QUICK_STARTER_TOPICS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleTopicClick(item.label)}
                className={`px-3 py-1 rounded-lg border text-xs whitespace-nowrap transition-colors font-medium ${
                  activeSearchTerm.toLowerCase() === item.label.toLowerCase()
                    ? 'bg-gov-primary text-white border-gov-primary shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-gov-muted pt-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">
                Found <strong className="text-gov-primary font-bold">{ragSchemes.length}</strong> Verified Eligible Schemes
              </span>
              {activeSearchTerm && (
                <span className="bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-medium">
                  Keyword Filter: "{activeSearchTerm}"
                </span>
              )}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              100% Deterministic Rule Engine Verified
            </span>
          </div>

          {/* Schemes Grid */}
          {isRagLoading ? (
            <LoadingSpinner label="Running RAG retrieval and validating eligibility rules..." size="lg" className="py-16" />
          ) : ragSchemes.length === 0 ? (
            <EmptyState
              title="No eligible schemes matched this search"
              description="Our eligibility engine evaluated the available schemes against your citizen profile and found none matching both this keyword and your qualifications. Try searching for a broader term like 'scholarship', 'education', or 'grant'."
              actionLabel="View All Suggested Schemes"
              onAction={handleResetSearch}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ragSchemes.map((scheme) => (
                <SchemeCard key={scheme._id} scheme={scheme} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: PROFILE DEMOGRAPHIC MATCHED ================= */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
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
              Showing <strong className="text-gov-primary">{profileSchemes.length}</strong> Recommended {profileSchemes.length === 1 ? 'Scheme' : 'Schemes'}
            </span>
          </div>

          {/* Grid */}
          {isProfileLoading ? (
            <LoadingSpinner label="Evaluating demographic criteria and matching recommended schemes..." size="lg" className="py-16" />
          ) : profileSchemes.length === 0 ? (
            <EmptyState
              title="No recommended schemes in this category"
              description="None of the schemes in this sector currently match your profile rules. You can update your profile or check 'All' categories."
              actionLabel="Show All Categories"
              onAction={() => setSelectedCategory('All')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profileSchemes.map((scheme) => (
                <SchemeCard key={scheme._id} scheme={scheme} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
