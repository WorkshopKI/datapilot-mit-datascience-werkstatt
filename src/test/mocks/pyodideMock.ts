/**
 * Shared PyodideManager mock factory and helpers.
 *
 * Usage in test files:
 *
 *   // vi.mock with async factory (avoids hoisting issues)
 *   vi.mock('../../pyodide/PyodideManager', async () => {
 *     const m = await import('@/test/mocks/pyodideMock');
 *     return m.pyodideMockFactory();
 *   });
 *
 *   // Import helpers normally (resolved after vi.mock registration)
 *   import {
 *     mockRunPython, mockPyodideReady, mockPyodideNotReady,
 *     mockRunPythonSuccess, mockRunPythonError, mockLoadPackages,
 *   } from '@/test/mocks/pyodideMock';
 */

import { vi } from 'vitest';

// --- Shared mock functions (singleton per test process) ---

export const mockRunPython = vi.fn();
export const mockGetState = vi.fn();
export const mockLoadPackages = vi.fn().mockResolvedValue(undefined);

/** Factory for vi.mock() – returns the PyodideManager mock module shape */
export function pyodideMockFactory() {
  const mockGetInstance = vi.fn(() => ({
    runPython: mockRunPython,
    getState: mockGetState,
    loadPackages: mockLoadPackages,
  }));

  return {
    PyodideManager: {
      getInstance: mockGetInstance,
    },
  };
}

// --- Convenience helpers ---

export function mockPyodideReady(): void {
  mockGetState.mockReturnValue({
    isReady: true,
    isLoading: false,
    stage: 'ready',
    percent: 100,
    message: '',
  });
}

export function mockPyodideNotReady(): void {
  mockGetState.mockReturnValue({
    isReady: false,
    isLoading: false,
    stage: 'downloading',
    percent: 0,
    message: '',
  });
}

export function mockRunPythonSuccess(result: unknown): void {
  mockRunPython.mockResolvedValue({
    success: true,
    result,
    stdout: [],
    stderr: [],
  });
}

export function mockRunPythonError(error: string): void {
  mockRunPython.mockResolvedValue({
    success: false,
    error,
    stdout: [],
    stderr: [],
  });
}
