import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  User,
  Search,
  RotateCcw,
  History,
  Trash2,
  Filter,
  ShieldCheck,
  Compass,
  Building2,
  Layers,
} from 'lucide-react';
import SchemeCard from '../../components/cards/SchemeCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const CATEGORIES = [
  'All',
  'Education',
  'Agriculture',
  'Healthcare',
  'Housing',
  'Finance & Loans',
  'Social Welfare',
  'Skill & Livelihood',
  'Women & Child',
];

const RecommendationsPage = () => {
  const { isAuthenticated, user, profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Filter state
  const [activeSourceFilter, setActiveSourceFilter] = useState('all'); // 'all' | 'search' | 'profile'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  // Data state
  const [ragData, setRagData] = useState({
    schemes: [],
    searchedTopics: [],
    recentQueries: [],
    aiSummary: '',
    hasSearchHistory: false,
  });
  const [profileSummary, setProfileSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearingHistory, setIsClearingHistory] = useState(false);

  // Fetch recommendations
  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const [ragRes, profileRes] = await Promise.all([
        api.get('/schemes/rag-recommendations?limit=30').catch(() => ({ data: { success: false, data: [] } })),
        api.get('/schemes/recommended').catch(() => ({ data: { success: false, data: [] } })),
      ]);

      let combinedSchemes = [];
      const seenIds = new Set();

      // Process RAG search-based recommendations
      if (ragRes.data?.success) {
        const rSchemes = ragRes.data.data || [];
        rSchemes.forEach((s) => {
          if (!seenIds.has(s._id)) {
            seenIds.add(s._id);
            combinedSchemes.push({
              ...s,
              recommendationType: s.matchedKeyword ? 'search' : 'profile',
            });
          }
        });

        setRagData({
          schemes: rSchemes,
          searchedTopics: ragRes.data.searchInsights?.searchedTopics || [],
          recentQueries: ragRes.data.searchInsights?.recentQueries || [],
          aiSummary: ragRes.data.searchInsights?.aiSummary || '',
          hasSearchHistory: Boolean(ragRes.data.hasSearchHistory),
        });
      }

      // Process profile-based recommendations
      if (profileRes.data?.success) {
        const pSchemes = profileRes.data.data || [];
        if (profileRes.data.profileSummary) {
          setProfileSummary(profileRes.data.profileSummary);
        }

        pSchemes.forEach((s) => {
          if (!seenIds.has(s._id)) {
            seenIds.add(s._id);
            combinedSchemes.push({
              ...s,
              recommendationType: 'profile',
              recommendationBadge: s.recommendationBadge || 'Profile Match',
              recommendationReason: s.recommendationReason || 'Matches your profile eligibility criteria',
            });
          }
        });
      }

      setAllSchemes(combinedSchemes);
    } catch (err) {
      console.error('Error loading recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const [allSchemes, setAllSchemes] = useState([]);

  useEffect(() => {
    loadRecommendations();
  }, [isAuthenticated]);

  // Clear search history
  const handleClearHistory = async () => {
    if (!window.confirm('Clear your recent search history? Recommendations will reset to your profile only.')) {
      return;
    }
    setIsClearingHistory(true);
    try {
      const res = await api.delete('/search-history/clear');
      if (res.data.success) {
        showToast('Search history cleared', 'success');
        setSelectedTopic('');
        setSearchKeyword('');
        loadRecommendations();
      }
    } catch (err) {
      showToast('Failed to clear search history', 'error');
    } finally {
      setIsClearingHistory(false);
    }
  };

  // Filter schemes based on active source, category, and keyword
  const filteredSchemes = useMemo(() => {
    return allSchemes.filter((scheme) => {
      // Source filter ('all' | 'search' | 'profile')
      if (activeSourceFilter === 'search' && scheme.recommendationType !== 'search') {
        return false;
      }
      if (activeSourceFilter === 'profile' && scheme.recommendationType !== 'profile') {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && scheme.category !== selectedCategory) {
        return false;
      }

      // Topic filter (from pill click)
      if (selectedTopic) {
        const text = `${scheme.schemeName} ${scheme.category} ${scheme.shortDescription}`.toLowerCase();
        if (!text.includes(selectedTopic.toLowerCase())) {
          return false;
        }
      }

      // Search keyword filter
      if (searchKeyword.trim()) {
        const query = searchKeyword.toLowerCase().trim();
        const text = `${scheme.schemeName} ${scheme.category} ${scheme.shortDescription} ${scheme.ministry}`.toLowerCase();
        if (!text.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [allSchemes, activeSourceFilter, selectedCategory, selectedTopic, searchKeyword]);

  // Counts for tabs
  const searchMatchCount = useMemo(
    () => allSchemes.filter((s) => s.recommendationType === 'search').length,
    [allSchemes]
  );
  const profileMatchCount = useMemo(
    () => allSchemes.filter((s) => s.recommendationType === 'profile').length,
    [allSchemes]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gov-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-gov-secondary bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Personalized Recommendations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gov-primary tracking-tight">
            Recommended For You
          </h1>
          <p className="text-sm text-gov-muted mt-1">
            Welfare schemes matched with your recent search interests and verified for your profile eligibility.
          </p>
        </div>

        {/* Source Filter Switcher */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto shrink-0 shadow-2xs">
          <button
            onClick={() => setActiveSourceFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSourceFilter === 'all'
                ? 'bg-gov-primary text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Recommended ({allSchemes.length})
          </button>

          {ragData.hasSearchHistory && searchMatchCount > 0 && (
            <button
              onClick={() => setActiveSourceFilter('search')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSourceFilter === 'search'
                  ? 'bg-gov-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>From Your Searches</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeSourceFilter === 'search' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {searchMatchCount}
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveSourceFilter('profile')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSourceFilter === 'profile'
                ? 'bg-gov-primary text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>From Your Profile</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeSourceFilter === 'profile' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {profileMatchCount}
            </span>
          </button>
        </div>
      </div>

      {/* Real-Application Context & Interest Bar */}
      <div className="bg-gradient-to-r from-blue-50/70 via-slate-50 to-amber-50/40 border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Summary & Active Profile/Search Context */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs sm:text-sm font-semibold text-slate-800">
                {ragData.aiSummary || (
                  profileSummary
                    ? `Showing schemes you qualify for as a ${profileSummary.occupation || 'citizen'} in ${profileSummary.state || 'India'}.`
                    : 'Showing top verified schemes you are currently eligible to apply for.'
                )}
              </p>
            </div>

            {/* Recent Search Topic Pills */}
            {ragData.searchedTopics && ragData.searchedTopics.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1 mr-1">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  Your recent topics:
                </span>
                {ragData.searchedTopics.map((topic, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (selectedTopic === topic) {
                        setSelectedTopic('');
                      } else {
                        setSelectedTopic(topic);
                        setActiveSourceFilter('all');
                      }
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors border ${
                      selectedTopic === topic
                        ? 'bg-gov-secondary text-white border-gov-secondary shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {topic}
                  </button>
                ))}

                {selectedTopic && (
                  <button
                    onClick={() => setSelectedTopic('')}
                    className="text-xs text-gov-secondary hover:underline font-semibold ml-1 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset topic
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Filter Search & Clear History */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Filter recommendations..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-secondary"
              />
            </div>

            {ragData.hasSearchHistory && isAuthenticated && (
              <button
                onClick={handleClearHistory}
                disabled={isClearingHistory}
                title="Clear your stored search history"
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors text-xs flex items-center gap-1 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear History</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-gov-primary text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Schemes Results Count & Active Filters Indicator */}
      <div className="flex items-center justify-between text-xs text-gov-muted pt-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">
            Showing <strong className="text-gov-primary font-bold">{filteredSchemes.length}</strong> of{' '}
            <strong className="text-gov-primary font-bold">{allSchemes.length}</strong> recommended schemes
          </span>
          {selectedCategory !== 'All' && (
            <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-medium">
              Category: {selectedCategory}
            </span>
          )}
          {selectedTopic && (
            <span className="bg-blue-100 text-blue-900 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-medium">
              Topic: {selectedTopic}
            </span>
          )}
        </div>

        <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          100% Profile Eligibility Verified
        </span>
      </div>

      {/* Schemes Grid */}
      {isLoading ? (
        <LoadingSpinner label="Evaluating schemes for your profile..." size="lg" className="py-20" />
      ) : filteredSchemes.length === 0 ? (
        <EmptyState
          title="No recommended schemes match these filters"
          description="Try selecting 'All Recommended' or choosing a different category to explore available welfare initiatives."
          actionLabel="Reset Filters"
          onAction={() => {
            setActiveSourceFilter('all');
            setSelectedCategory('All');
            setSelectedTopic('');
            setSearchKeyword('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme) => (
            <SchemeCard key={scheme._id} scheme={scheme} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
