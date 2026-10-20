import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ label = 'Loading details...', size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 gap-3 text-gov-muted ${className}`}>
      <Loader2 className={`${sizes[size] || sizes.md} animate-spin text-gov-primary`} />
      {label && <p className="text-xs font-medium text-slate-500 tracking-wide">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;
