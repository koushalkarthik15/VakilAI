"use client";

import * as React from 'react';
import { useSessionStore, Stage } from '@/core/state/sessionStore';

const stages: { id: Stage; label: string }[] = [
  { id: 'UNDERSTAND', label: '1&2 · Understand' },
  { id: 'COMPARE', label: '3 · Compare' },
  { id: 'ACT', label: '4 · Act' },
  { id: 'PREPARE', label: '5 · Prepare' }
];

export function StageNavigator() {
  const currentStage = useSessionStore((state) => state.currentStage);
  const setStage = useSessionStore((state) => state.setStage);
  
  // Do not render stage navigator if we are in upload stage
  if (currentStage === 'UPLOAD') return null;

  return (
    <div className="flex w-full justify-start border-b border-[var(--color-border-default)] bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        {stages.map((stage) => {
          // If current stage is FLAG, highlight the UNDERSTAND pill (1&2)
          const isActive = currentStage === stage.id || (currentStage === 'FLAG' && stage.id === 'UNDERSTAND');
          return (
            <button
              key={stage.id}
              onClick={() => setStage(stage.id)}
              aria-current={isActive ? 'step' : undefined}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-[var(--color-slate-900)] text-white shadow-sm' 
                  : 'bg-transparent text-[var(--color-slate-600)] hover:bg-[var(--color-slate-50)]'
              }`}
            >
              {stage.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
