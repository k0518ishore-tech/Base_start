import React, { forwardRef } from 'react';

const Select = forwardRef(
  (
    {
      label,
      error,
      helperText,
      options = [],
      className = '',
      id,
      required = false,
      placeholder = 'Select option',
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-gov-text mb-1.5">
            {label}
            {required && <span className="text-gov-error ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`w-full rounded-lg border bg-white text-sm text-gov-text px-3.5 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-gov-secondary focus:border-transparent ${
            error
              ? 'border-gov-error text-gov-error focus:ring-gov-error'
              : 'border-gov-border hover:border-slate-300'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
        {error && <p className="mt-1 text-xs text-gov-error">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-gov-muted">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
