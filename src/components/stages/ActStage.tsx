import React from 'react';
import { useSessionStore } from '@/core/state/sessionStore';

export function ActStage() {
  const context = useSessionStore((state) => state.actionContext);

  if (!context || context.action_items.length === 0) {
    return (
      <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 duration-300">
        <h2 className="text-xl font-semibold text-[var(--color-slate-900)]">Recommended Actions</h2>
        <div className="text-center p-8 text-[var(--color-slate-500)] bg-[var(--color-slate-50)] rounded-lg border border-[var(--color-border-default)]">
          No actions required.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-semibold text-[var(--color-slate-900)]">Recommended Actions</h2>
      
      <div className="space-y-4">
        {context.action_items.map((action, index) => (
          <div key={action.action_id} className="relative flex rounded-lg border border-[var(--color-border-default)] bg-white p-5 shadow-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[var(--color-saffron-600)] text-sm font-bold text-[var(--color-saffron-600)]">
              {index + 1}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-[16px] font-medium text-[var(--color-slate-900)]">
                {action.title}
              </h3>
              
              <div className="mt-2 text-[14px] text-[var(--color-slate-700)]">
                {action.description}
              </div>
              
              <div className="mt-4 grid grid-cols-1 gap-2 text-[13px] text-[var(--color-slate-600)] sm:grid-cols-2">
                <div className="flex items-start">
                  <span className="font-semibold uppercase w-16">Type:</span>
                  <span className="flex-1">{action.action_type}</span>
                </div>
                {action.government_route_id && (
                  <div className="flex items-start">
                    <span className="font-semibold uppercase w-16">Route:</span>
                    <span className="flex-1">{action.government_route_id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
