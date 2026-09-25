"use client";

import { create } from 'zustand';

import { PiiMapping } from '../privacy/piiMapping';
import { 
  UnderstandingContext, 
  AnalysisContext, 
  ComparisonContext, 
  ActionContext,
  PrepareContext
} from '../contexts/contracts';

export type Stage = 'UPLOAD' | 'UNDERSTAND' | 'FLAG' | 'COMPARE' | 'ACT' | 'PREPARE';
export type Language = 'EN' | 'TE' | 'HI';

export interface RiskItem {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  label: string;
  clause: string;
  explanation: string;
}

export type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error' | 'unsupported' | 'unknown';

interface SessionState {
  // UI/Session Metadata fields
  sessionId: string | null;
  activeDocumentId: string | null;
  activeDocumentName: string | null;
  currentStage: Stage;
  language: Language;
  isProcessing: boolean;
  documentUrl: string | null;
  piiMap: PiiMapping[];
  
  // Dynamic Data
  analysisStatus: AnalysisStatus;
  analysisError?: string;
  understandingContext: UnderstandingContext | null;
  analysisContext: AnalysisContext | null;
  comparisonContext: ComparisonContext | null;
  actionContext: ActionContext | null;
  prepareContext: PrepareContext | null;

  // Computed Properties (in Zustand we just derive them in components or getters, 
  // but we'll store them for easy UI binding)
  riskCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };

  // Actions
  setSessionId: (id: string | null) => void;
  setActiveDocumentId: (id: string | null) => void;
  setActiveDocumentName: (name: string | null) => void;
  setStage: (stage: Stage) => void;
  setLanguage: (lang: Language) => void;
  setIsProcessing: (value: boolean) => void;
  setDocumentUrl: (url: string | null) => void;
  setPiiMap: (map: PiiMapping[]) => void;
  setAnalysisStatus: (status: AnalysisStatus, error?: string) => void;
  setContexts: (contexts: {
    understandingContext?: UnderstandingContext;
    analysisContext?: AnalysisContext;
    comparisonContext?: ComparisonContext;
    actionContext?: ActionContext;
  }) => void;
  setPrepareContext: (context: PrepareContext) => void;
  resetSession: () => void;
}

const initialState = {
  sessionId: null,
  activeDocumentId: null,
  activeDocumentName: null,
  currentStage: 'UPLOAD' as Stage,
  language: 'EN' as Language,
  isProcessing: false,
  documentUrl: null,
  piiMap: [] as PiiMapping[],
  analysisStatus: 'idle' as AnalysisStatus,
  analysisError: undefined,
  understandingContext: null,
  analysisContext: null,
  comparisonContext: null,
  actionContext: null,
  prepareContext: null,
  riskCounts: { critical: 0, high: 0, medium: 0, low: 0 },
};

export const useSessionStore = create<SessionState>((set) => ({
  ...initialState,
  
  setSessionId: (id) => set({ sessionId: id }),
  setActiveDocumentId: (id) => set({ activeDocumentId: id }),
  setActiveDocumentName: (name) => set({ activeDocumentName: name }),
  setStage: (stage) => {
    console.log(`[Stage Transition] Entering stage: ${stage}`);
    set({ currentStage: stage });
  },
  setLanguage: (lang) => set({ language: lang }),
  setIsProcessing: (value) => set({ isProcessing: value }),
  setDocumentUrl: (url) => set({ documentUrl: url }),
  setPiiMap: (map) => set({ piiMap: map }),
  setAnalysisStatus: (status, error) => set({ analysisStatus: status, analysisError: error }),
  setContexts: (contexts) => {
    // Dynamically calculate risk counts if analysisContext is provided
    const newRiskCounts = { critical: 0, high: 0, medium: 0, low: 0 };
    if (contexts.analysisContext) {
      const findings = contexts.analysisContext.findings;
      newRiskCounts.critical = findings.filter(f => f.severity === 'CRITICAL').length;
      newRiskCounts.high = findings.filter(f => f.severity === 'HIGH').length;
      newRiskCounts.medium = findings.filter(f => f.severity === 'MEDIUM').length;
      newRiskCounts.low = findings.filter(f => f.severity === 'LOW').length;
    }
    
    set(() => ({ 
      ...contexts,
      ...(contexts.analysisContext ? { riskCounts: newRiskCounts } : {})
    }));
  },
  setPrepareContext: (context) => set({ prepareContext: context }),
  
  resetSession: () => set(initialState),
}));
