import React from 'react';
import { AIOutputCard } from '@/components/ui/AIOutputCard';
import { useSessionStore } from '@/core/state/sessionStore';

export function UnderstandStage() {
  const status = useSessionStore(state => state.analysisStatus);
  const context = useSessionStore(state => state.understandingContext);
  const piiMap = useSessionStore(state => state.piiMap);

  if (status === 'loading') {
    return (
      <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 duration-300">
        <AIOutputCard>
          <div className="space-y-3">
            <div className="h-4 bg-[var(--color-slate-200)] rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-[var(--color-slate-200)] rounded w-full animate-pulse"></div>
            <div className="h-4 bg-[var(--color-slate-200)] rounded w-5/6 animate-pulse"></div>
          </div>
        </AIOutputCard>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 duration-300">
        <AIOutputCard>
          <p className="text-[var(--color-red-600)]">Failed to analyze document.</p>
        </AIOutputCard>
      </div>
    );
  }

  if (!context) {
    return null;
  }

  // Helper to replace PII placeholders with real text
  const restorePii = (text: string) => {
    let restored = text;
    piiMap.forEach(p => {
      restored = restored.replace(new RegExp(`\\[${p.placeholder}\\]`, 'g'), p.original);
    });
    return restored;
  };

  const landlord = context.parties.find(p => p.role.toLowerCase().includes('landlord'))?.display_reference || 'the landlord';
  const tenant = context.parties.find(p => p.role.toLowerCase().includes('tenant'))?.display_reference || 'you';
  const rentFact = context.document_facts.find(f => f.field === 'RENT_AMOUNT');
  const depositFact = context.document_facts.find(f => f.field === 'DEPOSIT_AMOUNT');
  const jurisdictionFact = context.document_facts.find(f => f.field === 'JURISDICTION');
  const jurisdiction = jurisdictionFact?.value === 'CENTRAL' ? 'India' : (jurisdictionFact?.value || 'India');
  
  return (
    <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 duration-300">
      <AIOutputCard>
        <p className="mb-4 text-[14px] leading-relaxed text-[var(--color-slate-900)]">
          This is a {context.classification.type.replace('_', ' ').toLowerCase()} agreement between {restorePii(tenant)} and {restorePii(landlord)} in {jurisdiction}.
        </p>
        
        <ul className="mb-4 text-[14px] leading-relaxed text-[var(--color-slate-900)] list-disc pl-5">
          {rentFact?.value && <li><strong>Rent:</strong> {restorePii(rentFact.value)}</li>}
          {depositFact?.value && <li><strong>Deposit:</strong> {restorePii(depositFact.value)}</li>}
        </ul>

        {context.missing_information.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--color-slate-200)]">
            <p className="font-semibold text-sm mb-2 text-[var(--color-slate-900)]">Missing Information:</p>
            <ul className="list-disc pl-5 text-sm text-[var(--color-slate-600)]">
              {context.missing_information.map((info, idx) => (
                <li key={idx}>{info}</li>
              ))}
            </ul>
          </div>
        )}
      </AIOutputCard>
    </div>
  );
}
