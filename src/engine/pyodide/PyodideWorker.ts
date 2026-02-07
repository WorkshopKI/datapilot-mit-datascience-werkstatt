// Pyodide Worker Interface (Mock Implementation for Phase 1)
// This will be replaced with actual Pyodide integration in Phase 2

export interface PyodideStatus {
  loaded: boolean;
  loading: boolean;
  error?: string;
}

export interface ExecutionResult {
  success: boolean;
  output?: unknown;
  error?: string;
  logs?: string[];
}

// Mock implementation - will be replaced with actual Pyodide
export class PyodideWorker {
  private status: PyodideStatus = { loaded: false, loading: false };

  async initialize(): Promise<void> {
    this.status.loading = true;
    // Mock: Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 100));
    this.status.loading = false;
    this.status.loaded = true;
    console.log('[PyodideWorker] Mock initialized - Phase 2 will add real Pyodide');
  }

  getStatus(): PyodideStatus {
    return { ...this.status };
  }

  async execute(code: string): Promise<ExecutionResult> {
    if (!this.status.loaded) {
      return { success: false, error: 'Pyodide not loaded' };
    }

    // Mock execution
    console.log('[PyodideWorker] Mock execute:', code.substring(0, 100) + '...');
    return {
      success: true,
      output: { message: 'Mock execution result' },
      logs: ['[Mock] Code executed successfully'],
    };
  }

  async loadPackage(packageName: string): Promise<boolean> {
    console.log('[PyodideWorker] Mock loadPackage:', packageName);
    return true;
  }

  terminate(): void {
    this.status = { loaded: false, loading: false };
    console.log('[PyodideWorker] Mock terminated');
  }
}

// Singleton instance
let workerInstance: PyodideWorker | null = null;

export function getPyodideWorker(): PyodideWorker {
  if (!workerInstance) {
    workerInstance = new PyodideWorker();
  }
  return workerInstance;
}
