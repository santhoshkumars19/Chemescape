import React from 'react';

/**
 * PageContainer — Reusable global container component
 * Ensures consistent 1440px max-width, horizontal centering, responsive padding,
 * and box-sizing across all EduNova modules without cutting off vertical overflow.
 */
export default function PageContainer({ children, className = '', style = {}, id }) {
  return (
    <div
      id={id}
      className={`w-full max-w-[1440px] mx-auto px-4 sm:px-6 min-w-0 box-border ${className}`}
      style={{
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
