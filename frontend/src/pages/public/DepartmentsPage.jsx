import React, { useState, useEffect } from 'react';
import { Search, Building2, Layers, ExternalLink } from 'lucide-react';
import DepartmentCard from '../../components/cards/DepartmentCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api
      .get('/departments')
      .then((res) => {
        if (res.data.success) {
          setDepartments(res.data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredDepts = departments.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.departmentName.toLowerCase().includes(q) ||
      d.ministryName.toLowerCase().includes(q) ||
      (d.description && d.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gov-primary tracking-tight">
            Government Department Directory
          </h1>
          <p className="text-sm text-gov-muted mt-1.5">
            Discover welfare initiatives and subsidies organized by executive ministry portfolios.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search departments or ministries..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gov-border bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <LoadingSpinner label="Loading departments directory..." size="lg" />
      ) : filteredDepts.length === 0 ? (
        <EmptyState
          title="No departments found"
          description="No ministries or departments matched your query."
          actionLabel="Clear Search"
          onAction={() => setSearch('')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDepts.map((dept) => (
            <DepartmentCard key={dept._id} department={dept} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentsPage;
