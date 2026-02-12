/**
 * Helper to get a ready PyodideManager instance.
 * Replaces the repeated 3-line boilerplate pattern across all engine modules.
 */
import { PyodideManager } from './PyodideManager';

export function ensurePyodideReady(): PyodideManager {
  const manager = PyodideManager.getInstance();
  if (!manager.getState().isReady) {
    throw new Error('Pyodide ist nicht initialisiert. Bitte zuerst die ML-Engine starten.');
  }
  return manager;
}
