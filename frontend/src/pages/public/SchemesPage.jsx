import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Building2,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import SchemeCard from '../../components/cards/SchemeCard';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
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

const SCHEME_LEVELS = ['All', 'Central', 'State'];

const STATES = [
  'All India',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

const BENEFICIARIES = [
  'All',
  'Farmers',
  'Students',
  'Women',
  'Small Shopkeepers',
  'Artisans',
  'BPL Households',
  'Senior Citizens',
];

const SchemesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [schemes, setSchemes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state from URL query params or defaults
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [departmentId, setDepartmentId] = useState(searchParams.get('departmentId') || 'All');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [schemeLevel, setSchemeLevel] = useState(searchParams.get('schemeLevel') || 'All');
  const [state, setState] = useState(searchParams.get('state') || 'All India');
  const [beneficiary, setBeneficiary] = useState(searchParams.get('beneficiary') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Load departments for the filter dropdown
  useEffect(() => {
    api
      .get('/departments')
      .then((res) => {
        if (res.data.success) {
          setDepartments(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch schemes when parameters change
  useEffect(() => {
    const fetchSchemes = async () => {
      setIsLoading(true);
      try {
        const params = {
          page,
          limit: 9,
          sortBy,
        };

        if (search.trim()) params.search = search.trim();
        if (departmentId !== 'All') params.departmentId = departmentId;
        if (category !== 'All') params.category = category;
        if (schemeLevel !== 'All') params.schemeLevel = schemeLevel;
        if (state !== 'All India') params.state = state;
        if (beneficiary !== 'All') params.beneficiary = beneficiary;

        const res = await api.get('/schemes', { params });
        if (res.data.success) {
          setSchemes(res.data.data);
          setTotalPages(res.data.pagination.totalPages);
          setTotalCount(res.data.pagination.total);
        }
      } catch (err) {
        console.error('Error fetching schemes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchemes();
  }, [search, departmentId, category, schemeLevel, state, beneficiary, sortBy, page]);

  const handleResetFilters = () => {
    setSearch('');
    setDepartmentId('All');
    setCategory('All');
    setSchemeLevel('All');
    setState('All India');
    setBeneficiary('All');
    setSortBy('newest');
    setPage(1);
    setSearchParams({});
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gov-primary tracking-tight">
          Government Schemes Directory
        </h1>
        <p className="text-sm text-gov-muted mt-1.5">
          Explore and filter all verified welfare initiatives, subsidies, and grants across Indian ministries.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-72 bg-white rounded-xl border border-gov-border p-5 shrink-0 shadow-subtle">
          <div className="flex items-center justify-between pb-4 border-b border-gov-border mb-5">
            <div className="flex items-center gap-2 font-bold text-sm text-gov-primary">
              <SlidersHorizontal className="w-4 h-4 text-gov-secondary" />
              <span>Filters</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-gov-secondary hover:text-blue-800 flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          <div className="space-y-4">
            {/* Department Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs rounded-lg border border-gov-border p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
              >
                <option value="All">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.departmentName}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs rounded-lg border border-gov-border p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Scheme Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Level
              </label>
              <select
                value={schemeLevel}
                onChange={(e) => {
                  setSchemeLevel(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs rounded-lg border border-gov-border p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
              >
                {SCHEME_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl} Schemes
                  </option>
                ))}
              </select>
            </div>

            {/* State Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Applicable State
              </label>
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs rounded-lg border border-gov-border p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
              >
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Beneficiary Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Beneficiary
              </label>
              <select
                value={beneficiary}
                onChange={(e) => {
                  setBeneficiary(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs rounded-lg border border-gov-border p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
              >
                {BENEFICIARIES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* Schemes Results Content */}
        <div className="flex-1 w-full space-y-6">
          {/* Top Search & Sort Controls */}
          <div className="bg-white rounded-xl border border-gov-border p-3 sm:p-4 shadow-subtle flex flex-col sm:flex-row items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search schemes by name, keyword, or benefits..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gov-border bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
              />
            </form>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <span className="text-xs text-gov-muted whitespace-nowrap">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs rounded-lg border border-gov-border p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
              >
                <option value="newest">Recently Added</option>
                <option value="name_asc">Scheme Name (A-Z)</option>
                <option value="name_desc">Scheme Name (Z-A)</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Results Count & Badges */}
          <div className="flex items-center justify-between text-xs text-gov-muted px-1">
            <span>
              Showing <strong className="text-gov-primary">{schemes.length}</strong> of{' '}
              <strong className="text-gov-primary">{totalCount}</strong> schemes
            </span>
            {category !== 'All' && (
              <span className="bg-blue-50 text-gov-secondary px-2 py-0.5 rounded font-medium">
                Category: {category}
              </span>
            )}
          </div>

          {/* Schemes Grid */}
          {isLoading ? (
            <LoadingSpinner label="Fetching verified government schemes..." size="lg" />
          ) : schemes.length === 0 ? (
            <EmptyState
              title="No schemes matched your criteria"
              description="Try adjusting your keywords, expanding your state selection, or resetting your category filter."
              actionLabel="Reset All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {schemes.map((scheme) => (
                <SchemeCard key={scheme._id} scheme={scheme} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="text-xs font-semibold text-slate-700 px-3">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchemesPage;
