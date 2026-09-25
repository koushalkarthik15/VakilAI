"use client";

import React, { useState } from 'react';
import { DocumentPane } from './DocumentPane';
import { AssistancePane } from './AssistancePane';
import { useSessionStore, Language } from '@/core/state/sessionStore';

export function MainWorkspace() {
  const language = useSessionStore((state) => state.language);
  const setLanguage = useSessionStore((state) => state.setLanguage);
  const riskCounts = useSessionStore((state) => state.riskCounts);
  const activeDocumentName = useSessionStore((state) => state.activeDocumentName);
  const analysisStatus = useSessionStore((state) => state.analysisStatus);
  const understandingContext = useSessionStore((state) => state.understandingContext);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const langLabel = language === 'EN' ? 'English' : language === 'TE' ? 'Telugu' : 'Hindi';

  // Format dynamic classification tag
  const renderTag = () => {
    if (analysisStatus === 'loading') {
      return (
        <span className="ml-2 rounded-full bg-slate-700/50 px-2.5 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-600/50">
          Analyzing...
        </span>
      );
    }
    if (analysisStatus === 'unsupported' || analysisStatus === 'unknown') {
      return (
        <span className="ml-2 rounded-full bg-red-900/30 px-2.5 py-0.5 text-[11px] font-medium text-red-400 border border-red-900/50">
          Unsupported
        </span>
      );
    }
    if (understandingContext) {
      const typeStr = understandingContext.classification.type.replace('_', ' ');
      const typeCapitalized = typeStr.charAt(0).toUpperCase() + typeStr.slice(1).toLowerCase();
      const jurisdictionFact = understandingContext.document_facts.find(f => f.field === 'JURISDICTION');
      const jurStr = jurisdictionFact?.value === 'CENTRAL' ? 'India' : (jurisdictionFact?.value || 'India');
      const jurCapitalized = jurStr.charAt(0).toUpperCase() + jurStr.slice(1).toLowerCase();
      
      return (
        <span className="ml-2 rounded-full bg-[#92400e]/30 px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-saffron-600)] border border-[#92400e]/50">
          {typeCapitalized} · {jurCapitalized}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="flex h-screen w-full flex-col bg-[var(--color-background)]">
      {/* Top Navigation Bar */}
      <header className="relative z-50 flex h-14 w-full shrink-0 items-center justify-between bg-[var(--color-slate-900)] px-4 text-white">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2 font-bold text-white">
            <button 
              onClick={useSessionStore.getState().resetSession}
              className="mr-2 flex items-center justify-center rounded-full bg-[var(--color-slate-800)] w-6 h-6 text-[var(--color-slate-400)] hover:text-white hover:bg-[var(--color-slate-700)] transition-colors"
              aria-label="Upload different document"
              title="Upload different document"
            >
              ←
            </button>
            <span className="text-[var(--color-saffron-600)]">●</span> Vakil AI
          </div>
          <span className="text-[var(--color-slate-600)]">/</span>
          <span className="text-[var(--color-slate-100)] max-w-[200px] truncate" title={activeDocumentName || 'Document'}>{activeDocumentName || 'Document'}</span>
          {renderTag()}
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-3 text-[13px] font-medium">
            {riskCounts.critical > 0 && <span className="flex items-center gap-1.5"><span className="text-[#E53E3E]">●</span> {riskCounts.critical} critical</span>}
            {riskCounts.high > 0 && <span className="flex items-center gap-1.5"><span className="text-[#D97706]">●</span> {riskCounts.high} high</span>}
            {riskCounts.medium > 0 && <span className="flex items-center gap-1.5"><span className="text-[#2E6DA4]">●</span> {riskCounts.medium} medium</span>}
            {riskCounts.low > 0 && <span className="flex items-center gap-1.5"><span className="text-[var(--color-slate-400)]">●</span> {riskCounts.low} low</span>}
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              aria-expanded={isLangOpen}
              aria-haspopup="menu"
              className="flex items-center gap-1 rounded bg-[var(--color-slate-600)]/30 px-3 py-1.5 text-[13px] font-medium hover:bg-[var(--color-slate-600)]/50"
            >
              {language} · {langLabel} ▾
            </button>
            {isLangOpen && (
              <div 
                className="absolute right-0 top-full mt-1 w-32 rounded bg-white py-1 shadow-lg border border-[var(--color-border-default)]"
                role="menu"
              >
                {(['EN', 'TE', 'HI'] as Language[]).map((l) => (
                  <button
                    key={l}
                    role="menuitem"
                    onClick={() => {
                      if (l !== 'EN') {
                        alert('Incoming feature! For now, please choose English.');
                      } else {
                        setLanguage(l);
                      }
                      setIsLangOpen(false);
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm transition-colors duration-150 ${
                      language === l
                        ? 'bg-[var(--color-slate-900)] font-bold text-white'
                        : 'text-[var(--color-slate-900)] hover:bg-[var(--color-slate-900)] hover:text-white'
                    }`}
                  >
                    {l === 'EN' ? 'English' : l === 'TE' ? 'Telugu' : 'Hindi'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden lg:flex-row">
        <DocumentPane />
        <AssistancePane />
      </div>
    </div>
  );
}
