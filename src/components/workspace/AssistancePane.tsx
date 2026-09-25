"use client";

import React from 'react';
import { useSessionStore } from '@/core/state/sessionStore';
import { StageNavigator } from './StageNavigator';
import { UnderstandStage } from '../stages/UnderstandStage';
import { FlagStage } from '../stages/FlagStage';
import { CompareStage } from '../stages/CompareStage';
import { ActStage } from '../stages/ActStage';
import { PrepareStage } from '../stages/PrepareStage';

export function AssistancePane() {
  const currentStage = useSessionStore((state) => state.currentStage);
  const riskCounts = useSessionStore((state) => state.riskCounts);
  const analysisStatus = useSessionStore((state) => state.analysisStatus);

  const renderStageContent = () => {
    switch (currentStage) {
      case 'UNDERSTAND':
        return (
          <div className="space-y-8">
            <UnderstandStage />
            <FlagStage />
          </div>
        );
      case 'FLAG': // Kept for backwards compatibility if needed internally
        return <FlagStage />;
      case 'COMPARE':
        return <CompareStage />;
      case 'ACT':
        return <ActStage />;
      case 'PREPARE':
        return <PrepareStage />;
      default:
        return <div>Unknown Stage</div>;
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-[var(--color-background)] lg:w-1/2">
      {/* Stage Navigator at the top */}
      <div className="sticky top-0 z-20 flex flex-col bg-white">
        <StageNavigator />
      </div>

      <div className="flex-1 p-6">
        {analysisStatus === 'unsupported' || analysisStatus === 'unknown' ? (
          <div className="rounded-lg border border-[var(--color-red-200)] bg-[var(--color-red-50)] p-6 text-[var(--color-red-900)]">
            <h3 className="mb-2 text-lg font-bold">Document Not Supported</h3>
            <p className="text-sm">
              We could not classify this document as a supported legal agreement (e.g., Rental Agreement, Freelance Contract). 
              Our system currently only supports specific legal documents in English, Telugu, and Hindi.
            </p>
          </div>
        ) : (
          <>
            {/* Stage specific content (e.g., AI Output Card) */}
            {renderStageContent()}
          </>
        )}
      </div>
      
      {/* Sticky Bottom Footer for Risk Summary */}
      <div className="sticky bottom-0 border-t border-[var(--color-border-default)] bg-[var(--color-background)] px-6 py-4 flex gap-4 text-[12px] font-bold tracking-wider uppercase">
        <span className={`flex items-center gap-1.5 ${riskCounts.critical > 0 ? 'text-[#E53E3E]' : 'text-[var(--color-slate-400)]'}`}>
          <span className={riskCounts.critical > 0 ? "text-[#E53E3E]" : "text-[var(--color-slate-400)]"}>{riskCounts.critical > 0 ? '●' : '○'}</span> {riskCounts.critical} CRITICAL
        </span>
        <span className={`flex items-center gap-1.5 ${riskCounts.high > 0 ? 'text-[#D97706]' : 'text-[var(--color-slate-400)]'}`}>
          <span className={riskCounts.high > 0 ? "text-[#D97706]" : "text-[var(--color-slate-400)]"}>{riskCounts.high > 0 ? '●' : '○'}</span> {riskCounts.high} HIGH
        </span>
        <span className={`flex items-center gap-1.5 ${riskCounts.medium > 0 ? 'text-[#2E6DA4]' : 'text-[var(--color-slate-400)]'}`}>
          <span className={riskCounts.medium > 0 ? "text-[#2E6DA4]" : "text-[var(--color-slate-300)]"}>{riskCounts.medium > 0 ? '●' : '○'}</span> {riskCounts.medium} MEDIUM
        </span>
        <span className={`flex items-center gap-1.5 ${riskCounts.low > 0 ? 'text-slate-500' : 'text-[var(--color-slate-400)]'}`}>
          <span className={riskCounts.low > 0 ? "text-slate-500" : "text-[var(--color-slate-300)]"}>{riskCounts.low > 0 ? '●' : '○'}</span> {riskCounts.low} LOW
        </span>
      </div>
    </div>
  );
}
