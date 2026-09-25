import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { AIOutputCard } from '@/components/ui/AIOutputCard';

type RiskSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type RiskCategory = 'CONTRADICTION' | 'DEVIATION' | 'GAP' | 'AMBIGUOUS';

interface RiskCardProps {
  severity: RiskSeverity;
  category: RiskCategory;
  label: string;
  clause: string;
  explanation: string;
}

export function RiskCard({ severity, category, label, clause, explanation }: RiskCardProps) {
  let badgeVariant: 'critical' | 'high' | 'medium' | 'low' = 'low';
  switch (severity) {
    case 'CRITICAL': badgeVariant = 'critical'; break;
    case 'HIGH': badgeVariant = 'high'; break;
    case 'MEDIUM': badgeVariant = 'medium'; break;
    case 'LOW': badgeVariant = 'low'; break;
  }

  // Placeholder category symbols based on design doc
  let categoryIcon = '';
  switch (category) {
    case 'CONTRADICTION': categoryIcon = '⮂'; break; // Circular arrows
    case 'DEVIATION': categoryIcon = '▲'; break; // Triangle
    case 'GAP': categoryIcon = '◌'; break; // Dashed circle
    case 'AMBIGUOUS': categoryIcon = '?'; break; // Question mark
  }

  return (
    <AIOutputCard className="!bg-white !border-l-0 border border-[var(--color-border-default)] !p-0 overflow-hidden shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant={badgeVariant}>
              <span className="mr-1">{categoryIcon}</span> {severity}: {category}
            </Badge>
            <span className="text-[14px] font-semibold text-[var(--color-slate-900)]">{label}</span>
          </div>
          <span className="inline-flex rounded bg-[var(--color-slate-100)] px-2 py-1 text-[12px] font-mono text-[var(--color-slate-600)]">
            {clause}
          </span>
        </div>
        
        <p className="text-[14px] text-[var(--color-text-secondary)]">
          {explanation}
        </p>
      </div>
    </AIOutputCard>
  );
}
