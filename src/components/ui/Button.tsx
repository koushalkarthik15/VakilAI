import * as React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'cta' | 'ghost' | 'destructive';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', ...props }, ref) => {
    let variantStyles = '';
    
    switch (variant) {
      case 'primary':
        variantStyles = 'bg-[var(--color-slate-900)] text-white hover:bg-[var(--color-slate-600)]';
        break;
      case 'secondary':
        variantStyles = 'bg-transparent border border-[var(--color-slate-900)] text-[var(--color-slate-900)] hover:bg-[var(--color-slate-100)]';
        break;
      case 'cta':
        variantStyles = 'bg-[var(--color-saffron-600)] text-white hover:opacity-90';
        break;
      case 'ghost':
        variantStyles = 'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-slate-100)]';
        break;
      case 'destructive':
        variantStyles = 'bg-transparent border border-[#E53E3E] text-[#E53E3E] hover:bg-[#FFF5F5]';
        break;
    }

    const baseStyles = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-slate-900)] disabled:opacity-50 disabled:pointer-events-none';
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
