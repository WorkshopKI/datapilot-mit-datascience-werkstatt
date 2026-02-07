/**
 * PyodideWorker – Re-exports from PyodideManager for backward compatibility.
 *
 * The original mock implementation has been replaced with a real Pyodide
 * Web Worker in Feature 2. This file re-exports the new API under the
 * old names so any existing imports continue to work.
 */

export { PyodideManager as PyodideWorker } from './PyodideManager';
export type { PyodideState as PyodideStatus } from './PyodideManager';
export type { PyodideExecutionResult as ExecutionResult } from './PyodideManager';

import { PyodideManager } from './PyodideManager';

/**
 * @deprecated Use `PyodideManager.getInstance()` instead.
 */
export function getPyodideWorker(): PyodideManager {
  return PyodideManager.getInstance();
}
