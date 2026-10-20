import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Landmark, ExternalLink, ArrowRight, Layers } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

const DepartmentCard = ({ department }) => {
  return (
    <Card hover className="flex flex-col h-full overflow-hidden">
      <div className="p-5 flex-1 flex flex-col">
        {/* Ministry Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="primary" size="xs" className="truncate max-w-[220px]">
            {department.ministryName}
          </Badge>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-gov-secondary">
            <Layers className="w-3 h-3" />
            {department.activeSchemeCount || 0} schemes
          </span>
        </div>

        {/* Department Name */}
        <Link
          to={`/departments/${department._id}`}
          className="text-base font-bold text-gov-primary hover:text-gov-secondary transition-colors mb-2 line-clamp-2"
        >
          {department.departmentName}
        </Link>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-3 mb-4 flex-1 leading-relaxed">
          {department.description || 'Administering policies, welfare interventions, and direct benefit schemes for eligible beneficiaries.'}
        </p>

        {/* Official Link if available */}
        {department.officialWebsite && (
          <div className="mb-2">
            <a
              href={department.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-gov-secondary transition-colors truncate max-w-full"
            >
              <ExternalLink className="w-3 h-3 shrink-0" />
              <span className="truncate">{department.officialWebsite.replace(/^https?:\/\//, '')}</span>
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gov-border bg-slate-50 flex items-center justify-between">
        <span className="text-xs text-gov-muted font-medium">
          Active Portfolio
        </span>
        <Link to={`/departments/${department._id}`}>
          <Button variant="outline" size="sm" className="text-xs py-1 px-3">
            <span>View Schemes</span>
            <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default DepartmentCard;
