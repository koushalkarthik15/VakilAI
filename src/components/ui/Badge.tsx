import * as React from 'react';

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'ai' | 'critical' | 'high' | 'medium' | 'low';
};

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  let variantStyles = '';

  switch (variant) {
    case 'default':
      variantStyles = 'bg-[var(--color-slate-100)] text-[var(--color-slate-900)]';
      break;
    case 'ai':
      variantStyles = 'bg-[var(--color-saffron-100)] text-[#92400E]';
      break;
    case 'critical':
      variantStyles = 'bg-[var(--risk-critical-bg)] text-[#E53E3E] border border-[var(--risk-critical-border)]';
      break;
    case 'high':
      variantStyles = 'bg-[var(--risk-high-bg)] text-[#D97706] border border-[var(--risk-high-border)]';
      break;
    case 'medium':
      variantStyles = 'bg-[var(--risk-medium-bg)] text-[#2E6DA4] border border-[var(--risk-medium-border)]';
      break;
    case 'low':
      variantStyles = 'bg-[var(--risk-low-bg)] text-[#16A34A] border border-[var(--risk-low-border)]';
      break;
  }

  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-slate-900)]';

  return (
    <div className={`${baseStyles} ${variantStyles} ${className}`} {...props} />
  );
}
