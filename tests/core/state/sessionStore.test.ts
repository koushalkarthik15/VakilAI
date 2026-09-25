import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useSessionStore } from '@/core/state/sessionStore';

describe('useSessionStore', () => {
  const initialState = useSessionStore.getState();

  beforeEach(() => {
    useSessionStore.setState(initialState, true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with correct default state', () => {
    const state = useSessionStore.getState();
    expect(state.sessionId).toBeNull();
    expect(state.activeDocumentId).toBeNull();
    expect(state.currentStage).toBe('UPLOAD');
    expect(state.language).toBe('EN');
    expect(state.isProcessing).toBe(false);
  });

  it('should update state fields correctly', () => {
    useSessionStore.getState().setSessionId('sess_123');
    useSessionStore.getState().setActiveDocumentId('doc_456');
    useSessionStore.getState().setStage('FLAG');
    useSessionStore.getState().setLanguage('TE');
    useSessionStore.getState().setIsProcessing(true);

    const state = useSessionStore.getState();
    expect(state.sessionId).toBe('sess_123');
    expect(state.activeDocumentId).toBe('doc_456');
    expect(state.currentStage).toBe('FLAG');
    expect(state.language).toBe('TE');
    expect(state.isProcessing).toBe(true);
  });

  it('should reset session fully to default state', () => {
    useSessionStore.getState().setSessionId('sess_123');
    useSessionStore.getState().setStage('PREPARE');
    
    useSessionStore.getState().resetSession();
    
    const state = useSessionStore.getState();
    expect(state.sessionId).toBeNull();
    expect(state.currentStage).toBe('UPLOAD');
    expect(state.language).toBe('EN');
  });

  it('should NOT call localStorage or sessionStorage when updating state', () => {
    const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');
    const sessionStorageSpy = vi.spyOn(window.sessionStorage, 'setItem');

    useSessionStore.getState().setSessionId('sess_999');
    useSessionStore.getState().setStage('ACT');

    expect(localStorageSpy).not.toHaveBeenCalled();
    expect(sessionStorageSpy).not.toHaveBeenCalled();
  });
});
