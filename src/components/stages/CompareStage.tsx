import React from 'react';
import { useSessionStore } from '@/core/state/sessionStore';

export function CompareStage() {
  const context = useSessionStore((state) => state.comparisonContext);

  if (!context || context.comparison_items.length === 0) {
    return (
      <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 duration-300">
        <h2 className="text-xl font-semibold text-[var(--color-slate-900)]">Compare vs Legal Baseline</h2>
        <div className="text-center p-8 text-[var(--color-slate-500)] bg-[var(--color-slate-50)] rounded-lg border border-[var(--color-border-default)]">
          No comparison items found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-semibold text-[var(--color-slate-900)]">Compare vs Legal Baseline</h2>
      
      <div className="space-y-6">
        {context.comparison_items.map(item => (
          <div key={item.comparison_id} className="flex flex-col overflow-hidden rounded-lg border border-[var(--color-border-default)] shadow-sm">
            <div className="bg-[var(--color-slate-50)] p-4 border-b border-[var(--color-border-default)]">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-slate-600)]">Contract says</h3>
              <p className="mt-2 text-[14px] text-[var(--color-slate-900)]">
                &quot;{item.contract_position.statement}&quot;
              </p>
            </div>
            
            <div className="bg-white p-4 border-b border-[var(--color-border-default)]">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--color-slate-600)]">Legal Rule</h3>
              <p className="mt-2 text-[14px] text-[var(--color-slate-900)]">
                {item.legal_baseline.summary}
              </p>
            </div>
            
            <div className="bg-[var(--color-saffron-100)]/40 p-4 border-b border-[var(--color-border-default)]">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#92400E]">AI Interpretation ({item.relationship.replace(/_/g, ' ')})</h3>
              <p className="mt-2 text-[14px] text-[#92400E]">
                {item.explanation}
              </p>
            </div>
            
            <div className="bg-white p-4 flex items-center justify-between">
              <span className="text-[12px] text-[var(--color-text-secondary)]">Source ID: {item.source_ids.join(', ')}</span>
              <span className="inline-flex rounded bg-[var(--color-slate-100)] px-2 py-1 text-[12px] font-mono text-[var(--color-slate-600)]">
                Clause {item.clause_ids.join(', ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
