"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { AIOutputCard } from '@/components/ui/AIOutputCard';
import { useSessionStore } from '@/core/state/sessionStore';

export function PrepareStage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const prepareContext = useSessionStore((state) => state.prepareContext);
  const setPrepareContext = useSessionStore((state) => state.setPrepareContext);
  const analysisContext = useSessionStore((state) => state.analysisContext);
  const comparisonContext = useSessionStore((state) => state.comparisonContext);
  const actionContext = useSessionStore((state) => state.actionContext);

  const handlePrepare = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisContext,
          comparisonContext,
          actionContext,
          userGoal: 'I need a briefing sheet to share with my lawyer'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to prepare');
      }

      setPrepareContext(data.prepareContext);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 duration-300">
        <h2 className="text-xl font-semibold text-[var(--color-slate-900)]">Preparing Attorney Briefing Sheet</h2>
        <div className="h-64 w-full motion-safe:animate-pulse rounded-md bg-[var(--color-slate-100)]" 
             style={{ backgroundImage: 'linear-gradient(90deg, var(--color-slate-100) 0%, var(--color-slate-50) 50%, var(--color-slate-100) 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.2s linear infinite' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 duration-300">
        <AIOutputCard>
          <p className="text-[var(--color-red-600)]">Error: {error}</p>
          <Button variant="secondary" onClick={handlePrepare} className="mt-4">Try Again</Button>
        </AIOutputCard>
      </div>
    );
  }

  if (!prepareContext) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12 text-center motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 duration-300">
        <div className="rounded-full bg-[var(--color-slate-100)] p-4">
          <span className="text-2xl">📄</span>
        </div>
        <div className="max-w-sm">
          <h2 className="text-xl font-semibold text-[var(--color-slate-900)]">Ready to meet a lawyer?</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            We can generate a briefing sheet summarizing the document, the risks identified, and the specific clauses to review with your legal professional.
          </p>
        </div>
        <Button variant="cta" onClick={handlePrepare} disabled={!analysisContext}>
          Generate Briefing Sheet
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[var(--color-slate-900)]">Attorney Briefing Sheet</h2>
        <Button variant="secondary">Export PDF</Button>
      </div>
      
      <AIOutputCard>
        <div className="space-y-6 text-[14px]">
          <div>
            <h3 className="font-semibold text-lg border-b border-[var(--color-slate-200)] pb-2 mb-3">Goal</h3>
            <p>{prepareContext.user_goal}</p>
          </div>
          
          {prepareContext.selected_findings.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg border-b border-[var(--color-slate-200)] pb-2 mb-3">Key Findings</h3>
              <ul className="list-disc pl-5 space-y-2">
                {prepareContext.selected_findings.map(f => (
                  <li key={f.finding_id}>
                    <strong>{f.summary}</strong>: {f.explanation} (Clause {f.clause_ids.join(', ')})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {prepareContext.required_information.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg border-b border-[var(--color-slate-200)] pb-2 mb-3">Required Information</h3>
              <ul className="list-disc pl-5 space-y-1">
                {prepareContext.required_information.map((info, idx) => (
                  <li key={idx}>{info}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </AIOutputCard>
    </div>
  );
}
