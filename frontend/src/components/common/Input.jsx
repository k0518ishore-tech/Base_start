import React, { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      type = 'text',
      className = '',
      id,
      required = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gov-text mb-1.5">
            {label}
            {required && <span className="text-gov-error ml-1">*</span>}
          </label>
        )}
        <div className="relative rounded-lg">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gov-muted">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={`w-full rounded-lg border bg-white text-sm text-gov-text transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-secondary focus:border-transparent ${
              Icon ? 'pl-9 pr-3' : 'px-3.5'
            } py-2 ${
              error
                ? 'border-gov-error text-gov-error focus:ring-gov-error'
                : 'border-gov-border hover:border-slate-300'
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-gov-error">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-gov-muted">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
