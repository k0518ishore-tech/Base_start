import React from 'react';
import { SearchX } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = SearchX,
  title = 'No items found',
  description = 'Try adjusting your search criteria or clear active filters.',
  actionLabel = null,
  onAction = null,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-dashed border-gov-border my-4 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-gov-muted mb-3">
        <Icon className="w-6 h-6 text-slate-500" />
      </div>
      <h3 className="text-base font-semibold text-gov-text mb-1">{title}</h3>
      <p className="text-sm text-gov-muted max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
