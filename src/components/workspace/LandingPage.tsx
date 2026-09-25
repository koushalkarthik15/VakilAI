"use client";

import React, { useState } from 'react';
import { useSessionStore, Language } from '@/core/state/sessionStore';
import { Button } from '@/components/ui/Button';
import { extractPdfText } from '@/features/document/services/pdfExtraction';
import { 
  UnderstandingContextSchema, 
  AnalysisContextSchema, 
  ComparisonContextSchema, 
  ActionContextSchema 
} from '@/core/contexts/contracts';

const LANGUAGES: { id: Language; label: string; script: string }[] = [
  { id: 'EN', label: 'English', script: 'English' },
  { id: 'TE', label: 'Telugu', script: 'తెలుగు' },
  { id: 'HI', label: 'Hindi', script: 'हिंदी' },
];

export function LandingPage() {
  const { setLanguage, setStage, setIsProcessing, isProcessing, setActiveDocumentName } = useSessionStore();
  const [selectedLang, setSelectedLang] = useState<Language>('EN');
  const [showLangGrid, setShowLangGrid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('UNSUPPORTED: Only PDF files are supported for V1.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }

    // F-03: Reset session before processing a new document
    useSessionStore.getState().resetSession();

    setError(null);
    setIsProcessing(true);
    
    const fileUrl = URL.createObjectURL(file);
    useSessionStore.getState().setDocumentUrl(fileUrl);
    
    try {
      // 1. Client-side Parsing
      const arrayBuffer = await file.arrayBuffer();
      const result = await extractPdfText(arrayBuffer, {
        document_id: crypto.randomUUID(),
        filename: file.name,
        mime_type: file.type
      });
      
      // 2. Log outcome to the server terminal
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          size: file.size,
          status: result.extraction.status,
          textLength: result.extraction.text.length,
          snippet: result.extraction.text.substring(0, 100).replace(/\n/g, ' ')
        }),
      }).catch(() => console.error("Could not send logs to server"));
      
      // 3. Handle errors based on client parsing status
      if (result.extraction.status === 'FAILED' || result.extraction.status === 'UNREADABLE') {
        setIsProcessing(false);
        useSessionStore.getState().setDocumentUrl(null);
        setError(`We could not extract readable text from this PDF. (Status: ${result.extraction.status})`);
        return;
      }
      
      // If parsing succeeded, start the analysis API call
      const { setAnalysisStatus, setContexts } = useSessionStore.getState();
      
      setAnalysisStatus('loading');
      setLanguage(selectedLang);
      setActiveDocumentName(file.name);
      setIsProcessing(false);
      setStage('UNDERSTAND');

      // Execute in background
      fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: result.extraction.text,
          filename: file.name,
          mime_type: file.type
        })
      })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setAnalysisStatus('error', data.error || 'Server error');
          return;
        }

        if (data.status === 'UNSUPPORTED' || data.status === 'UNKNOWN') {
          setAnalysisStatus(data.status.toLowerCase() as 'unsupported' | 'unknown');
          return;
        }

        try {
          // F-02: Runtime validation at the frontend API boundary
          const understandingContext = UnderstandingContextSchema.parse(data.understandingContext);
          const analysisContext = AnalysisContextSchema.parse(data.analysisContext);
          const comparisonContext = ComparisonContextSchema.parse(data.comparisonContext);
          const actionContext = ActionContextSchema.parse(data.actionContext);

          // We no longer set PII map from the server! (F-01)
          
          setContexts({
            understandingContext,
            analysisContext,
            comparisonContext,
            actionContext
          });
          setAnalysisStatus('success');
        } catch (validationError) {
          console.error('[LandingPage] API response failed Zod validation:', validationError);
          setAnalysisStatus('error', 'Received malformed data from the server.');
        }
      })
      .catch((err) => {
        console.error('[LandingPage] /api/analyze network error:', err);
        setAnalysisStatus('error', 'Network or server failure during analysis');
      });
      
    } catch {
      setIsProcessing(false);
      useSessionStore.getState().setDocumentUrl(null);
      setError('An error occurred while uploading or parsing the document.');
    }
  };

  if (showLangGrid) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[var(--color-background)]">
        <h2 className="mb-8 text-2xl font-bold text-[var(--color-slate-900)]">Select Language</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              aria-pressed={selectedLang === lang.id}
              onClick={() => {
                if (lang.id !== 'EN') {
                  alert('Incoming feature! For now, please choose English.');
                } else {
                  setSelectedLang(lang.id);
                  setLanguage(lang.id);
                }
                setShowLangGrid(false);
              }}
              className={`flex h-24 w-40 flex-col items-center justify-center rounded-lg border transition-colors ${
                selectedLang === lang.id
                  ? 'border-[var(--color-slate-900)] bg-[var(--color-slate-900)] text-white'
                  : 'border-[var(--color-slate-200)] bg-white text-[var(--color-slate-900)] hover:border-[var(--color-slate-900)]'
              }`}
            >
              <span className="text-lg font-bold">{lang.script}</span>
              <span className="text-sm opacity-80">{lang.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-lg space-y-6">
          <h2 className="text-2xl font-bold text-[var(--color-slate-900)] mb-8 motion-safe:animate-pulse">Scanning document...</h2>
          
          <div className="space-y-4 text-left">
            {/* Skeleton lines for text parsing simulation */}
            <div className="h-4 w-3/4 motion-safe:animate-pulse rounded bg-[var(--color-slate-100)]" 
                 style={{ backgroundImage: 'linear-gradient(90deg, var(--color-slate-100) 0%, var(--color-slate-50) 50%, var(--color-slate-100) 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s linear infinite' }} />
            <div className="h-4 w-full motion-safe:animate-pulse rounded bg-[var(--color-slate-100)]" 
                 style={{ backgroundImage: 'linear-gradient(90deg, var(--color-slate-100) 0%, var(--color-slate-50) 50%, var(--color-slate-100) 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s linear infinite 0.2s' }} />
            <div className="h-4 w-5/6 motion-safe:animate-pulse rounded bg-[var(--color-slate-100)]" 
                 style={{ backgroundImage: 'linear-gradient(90deg, var(--color-slate-100) 0%, var(--color-slate-50) 50%, var(--color-slate-100) 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s linear infinite 0.4s' }} />
            <div className="h-4 w-full motion-safe:animate-pulse rounded bg-[var(--color-slate-100)]" 
                 style={{ backgroundImage: 'linear-gradient(90deg, var(--color-slate-100) 0%, var(--color-slate-50) 50%, var(--color-slate-100) 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s linear infinite 0.1s' }} />
            <div className="h-4 w-2/3 motion-safe:animate-pulse rounded bg-[var(--color-slate-100)]" 
                 style={{ backgroundImage: 'linear-gradient(90deg, var(--color-slate-100) 0%, var(--color-slate-50) 50%, var(--color-slate-100) 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s linear infinite 0.3s' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
      <div className="absolute right-6 top-6">
        <Button variant="ghost" aria-label="Select language" onClick={() => setShowLangGrid(true)}>
          {LANGUAGES.find(l => l.id === selectedLang)?.script} ▾
        </Button>
      </div>

      <div className="mb-12 max-w-xl space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--color-slate-900)]">Vakil AI</h1>
        <p className="text-lg text-[var(--color-text-secondary)]">
          Understand before you sign.<br />
          Prepare before you meet your vakil.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-4">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border-default)] bg-white p-8 transition-colors hover:border-[var(--color-slate-900)] hover:bg-[var(--color-slate-50)] focus-within:ring-2 focus-within:ring-[var(--color-slate-900)] focus-within:ring-offset-2">
          <span className="mb-2 text-lg font-medium text-[var(--color-slate-900)]">Upload document</span>
          <span className="text-sm text-[var(--color-text-secondary)]">PDF up to 10MB</span>
          <input
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={handleFileUpload}
          />
        </label>
        
        {error && (
          <div className="rounded-md bg-[#FFF5F5] p-3 text-sm text-[#E53E3E]">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
