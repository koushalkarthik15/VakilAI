import * as React from 'react';


type AIOutputCardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export function AIOutputCard({ className = '', children, ...props }: AIOutputCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-md border-l-2 border-l-[var(--color-saffron-600)] bg-[var(--color-saffron-100)]/40 p-5 ${className}`}
      {...props}
    >
      <div className="mb-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fef3c7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#92400E]">
          <span className="text-[12px]">✨</span> AI prepared · not legal advice
        </span>
      </div>
      <div className="text-[14px] text-[var(--color-text-primary)]">
        {children}
      </div>
      <div className="mt-6 text-[11px] font-semibold italic text-[var(--color-text-muted)]">
        Bring this to your vakil to verify ↗
      </div>
    </div>
  );
}
