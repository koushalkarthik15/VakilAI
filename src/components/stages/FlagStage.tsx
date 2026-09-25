import React from 'react';
import { RiskCard } from '@/components/ui/RiskCard';
import { useSessionStore } from '@/core/state/sessionStore';

export function FlagStage() {
  const context = useSessionStore((state) => state.analysisContext);

  if (!context) return null;

  const findings = context.findings;

  return (
    <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-semibold text-[var(--color-slate-900)]">Potential Risks & Flags</h2>
      
      <div className="space-y-4">
        {findings.map((finding) => (
          <RiskCard 
            key={finding.finding_id}
            severity={finding.severity as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'} 
            category={finding.issue_type as 'CONTRADICTION' | 'DEVIATION' | 'GAP' | 'AMBIGUOUS'}
            label={finding.summary}
            clause={`Clause ${finding.clause_ids.join(', ')}`}
            explanation={finding.explanation}
          />
        ))}
        {findings.length === 0 && (
          <div className="text-center p-8 text-[var(--color-slate-500)] bg-[var(--color-slate-50)] rounded-lg border border-[var(--color-border-default)]">
            No risks identified in this document.
          </div>
        )}
      </div>
    </div>
  );
}
