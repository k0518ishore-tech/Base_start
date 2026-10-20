import React from 'react';

const Card = ({ children, className = '', hover = false, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gov-border shadow-subtle ${
        hover ? 'transition-all duration-200 hover:shadow-card hover:border-slate-300' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
