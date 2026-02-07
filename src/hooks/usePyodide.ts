/**
 * React hook for Pyodide integration.
 *
 * Provides lazy initialization (no 20MB download until explicitly requested),
 * progress tracking, Python code execution, and error handling with retry.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  PyodideManager,
  PYODIDE_CDN_URL,
  DEFAULT_PACKAGES,
} from '@/engine/pyodide/PyodideManager';
import type { PyodideState, PyodideExecutionResult } from '@/engine/pyodide/PyodideManager';

export interface UsePyodideReturn {
  /** Current load stage */
  status: PyodideState['stage'];
  /** Loading progress percentage (0-100) */
  progress: number;
  /** Human-readable progress message */
  progressMessage: string;
  /** Error message if initialization failed */
  error: string | undefined;
  /** Whether Pyodide is ready to execute code */
  isReady: boolean;
  /** Whether Pyodide is currently loading */
  isLoading: boolean;
  /** Start Pyodide initialization */
  initialize: () => Promise<void>;
  /** Execute Python code */
  runPython: (code: string) => Promise<PyodideExecutionResult>;
  /** Load additional packages */
  loadPackages: (packages: string[]) => Promise<void>;
  /** Retry initialization after failure */
  retry: () => Promise<void>;
}

/**
 * Hook for Pyodide WebWorker integration.
 *
 * @param autoInit - If true, initialize Pyodide immediately on mount. Default: false.
 */
export function usePyodide(autoInit = false): UsePyodideReturn {
  const [state, setState] = useState<PyodideState>(() =>
    PyodideManager.getInstance().getState(),
  );
  const initializedRef = useRef(false);

  // Subscribe to progress updates
  useEffect(() => {
    const manager = PyodideManager.getInstance();
    const cleanup = manager.onProgress((newState) => {
      setState(newState);
    });
    return cleanup;
  }, []);

  // Auto-initialize if requested
  useEffect(() => {
    if (autoInit && !initializedRef.current) {
      initializedRef.current = true;
      PyodideManager.getInstance().initialize().catch(() => {
        // Error is captured in state via progress listener
      });
    }
  }, [autoInit]);

  const initialize = useCallback(async () => {
    await PyodideManager.getInstance().initialize(PYODIDE_CDN_URL, DEFAULT_PACKAGES);
  }, []);

  const runPython = useCallback(async (code: string): Promise<PyodideExecutionResult> => {
    return PyodideManager.getInstance().runPython(code);
  }, []);

  const loadPackages = useCallback(async (packages: string[]): Promise<void> => {
    await PyodideManager.getInstance().loadPackages(packages);
  }, []);

  const retry = useCallback(async () => {
    // Terminate the old worker and reset state
    PyodideManager.resetInstance();
    // Re-subscribe to the new instance
    const manager = PyodideManager.getInstance();
    setState(manager.getState());
    await manager.initialize(PYODIDE_CDN_URL, DEFAULT_PACKAGES);
  }, []);

  return {
    status: state.stage,
    progress: state.percent,
    progressMessage: state.message,
    error: state.error,
    isReady: state.isReady,
    isLoading: state.isLoading,
    initialize,
    runPython,
    loadPackages,
    retry,
  };
}
