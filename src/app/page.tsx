"use client";

import { useSessionStore } from '@/core/state/sessionStore';
import { LandingPage } from '@/components/workspace/LandingPage';
import { MainWorkspace } from '@/components/workspace/MainWorkspace';

export default function Home() {
  const currentStage = useSessionStore((state) => state.currentStage);

  return (
    <main className="flex h-screen w-full flex-col bg-[var(--color-background)]">
      {currentStage === 'UPLOAD' ? (
        <LandingPage />
      ) : (
        <MainWorkspace />
      )}
    </main>
  );
}
