import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  ExternalLink,
  Search,
  ChevronRight,
  Layers,
  Mail,
  Phone,
  MapPin,
  ChevronLeft,
} from 'lucide-react';
import SchemeCard from '../../components/cards/SchemeCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import api from '../../services/api';

const DepartmentDetailPage = () => {
  const { id } = useParams();

  const [department, setDepartment] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch department details & schemes
  useEffect(() => {
    const fetchDeptData = async () => {
      setIsLoading(true);
      try {
        const deptRes = await api.get(`/departments/${id}`);
        if (deptRes.data.success) {
          setDepartment(deptRes.data.data);
        }

        const schemesRes = await api.get(`/departments/${id}/schemes`, {
          params: { search, category, page, limit: 9 },
        });

        if (schemesRes.data.success) {
          setSchemes(schemesRes.data.data);
          setTotalPages(schemesRes.data.pagination.totalPages);
          setTotalCount(schemesRes.data.pagination.total);
        }
      } catch (err) {
        console.error('Error loading department schemes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeptData();
  }, [id, search, category, page]);

  if (isLoading && !department) {
    return <LoadingSpinner label="Loading department details..." size="lg" className="py-24" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gov-muted">
        <Link to="/" className="hover:text-gov-primary">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/departments" className="hover:text-gov-primary">
          Departments
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gov-text font-medium truncate max-w-xs">{department?.departmentName}</span>
      </nav>

      {/* Department Header Profile */}
      {department && (
        <div className="bg-white rounded-2xl border border-gov-border p-6 sm:p-8 shadow-subtle">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm">
                  {department.ministryName}
                </Badge>
                <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                  Active Department
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gov-primary tracking-tight">
                {department.departmentName}
              </h1>

              <p className="text-sm text-slate-700 leading-relaxed">
                {department.description ||
                  'Administering policies, welfare interventions, and direct benefit schemes for eligible beneficiaries.'}
              </p>

              {/* Contact and Official Link details */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
                {department.officialWebsite && (
                  <a
                    href={department.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-gov-secondary hover:underline font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Official Portal</span>
                  </a>
                )}

                {department.contactInformation?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{department.contactInformation.phone}</span>
                  </div>
                )}

                {department.contactInformation?.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{department.contactInformation.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Scheme Count Stat Card */}
            <div className="bg-slate-50 border border-gov-border rounded-xl p-5 text-center shrink-0 min-w-[160px]">
              <div className="text-3xl font-black text-gov-primary">{department.activeSchemeCount || totalCount}</div>
              <div className="text-xs text-gov-muted font-medium mt-1">Active Schemes</div>
            </div>
          </div>
        </div>
      )}

      {/* Schemes Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gov-primary">
              Schemes Under {department?.departmentName}
            </h2>
            <p className="text-xs text-gov-muted mt-0.5">
              Showing {schemes.length} of {totalCount} active schemes
            </p>
          </div>

          {/* Search within department */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search schemes in this department..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gov-border bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
            />
          </div>
        </div>

        {/* Schemes Grid */}
        {isLoading ? (
          <LoadingSpinner label="Loading department schemes..." size="lg" />
        ) : schemes.length === 0 ? (
          <EmptyState
            title="No schemes found"
            description="No active schemes matched your search query in this department."
            actionLabel="Clear Search"
            onAction={() => setSearch('')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
  );
};

export default DepartmentDetailPage;
