import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'crisp-canvas-state';

export interface CanvasState {
  problemType: string | null;
  industry: string | null;
  notes: Record<string, string>;
  checks: Record<string, boolean>;
}

const initialState: CanvasState = {
  problemType: null,
  industry: null,
  notes: {
    business: '',
    data: '',
    preparation: '',
    modeling: '',
    evaluation: '',
    deployment: ''
  },
  checks: {}
};

export function useCanvasState() {
  const [state, setState] = useState<CanvasState>(() => {
    if (typeof window === 'undefined') return initialState;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initialState, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load canvas state:', e);
    }
    return initialState;
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save canvas state:', e);
    }
  }, [state]);

  const setScenario = useCallback((problemType: string | null, industry: string | null) => {
    setState(prev => ({
      ...prev,
      problemType,
      industry
    }));
  }, []);

  const setNote = useCallback((phaseId: string, note: string) => {
    setState(prev => ({
      ...prev,
      notes: {
        ...prev.notes,
        [phaseId]: note
      }
    }));
  }, []);

  const toggleCheck = useCallback((checkKey: string) => {
    setState(prev => ({
      ...prev,
      checks: {
        ...prev.checks,
        [checkKey]: !prev.checks[checkKey]
      }
    }));
  }, []);

  const setCheck = useCallback((checkKey: string, value: boolean) => {
    setState(prev => ({
      ...prev,
      checks: {
        ...prev.checks,
        [checkKey]: value
      }
    }));
  }, []);

  const getProgress = useCallback(() => {
    const totalChecks = 24; // 6 phases × 4 checks
    const completedChecks = Object.values(state.checks).filter(Boolean).length;
    return {
      completed: completedChecks,
      total: totalChecks,
      percentage: Math.round((completedChecks / totalChecks) * 100)
    };
  }, [state.checks]);

  const getPhaseProgress = useCallback((phaseId: string) => {
    const phaseChecks = Object.entries(state.checks).filter(
      ([key]) => key.startsWith(`${phaseId}-`)
    );
    const completed = phaseChecks.filter(([, value]) => value).length;
    return { completed, total: 4 };
  }, [state.checks]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const hasScenario = state.problemType !== null && state.industry !== null;

  return {
    state,
    setScenario,
    setNote,
    toggleCheck,
    setCheck,
    getProgress,
    getPhaseProgress,
    reset,
    hasScenario
  };
}
