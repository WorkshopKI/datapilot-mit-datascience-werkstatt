/**
 * PyodideManager – Main thread singleton for communicating with the Pyodide Web Worker.
 *
 * Provides a Promise-based API to initialize Pyodide, run Python code,
 * and load additional packages. Uses request-ID correlation to match
 * responses to pending requests.
 */

import type {
  WorkerRequest,
  WorkerMessage,
  WorkerResponse,
  ProgressBroadcast,
  PyodideLoadStage,
} from './messageTypes';
import { generateRequestId } from './messageTypes';

/** Default Pyodide CDN URL */
export const PYODIDE_CDN_URL = 'https://cdn.jsdelivr.net/pyodide/v0.27.4/full/';

/** Default packages to load with Pyodide */
export const DEFAULT_PACKAGES = ['numpy', 'pandas', 'scikit-learn'];

/** Timeout for initialization (5 minutes – Pyodide is large) */
const INIT_TIMEOUT_MS = 5 * 60 * 1000;

/** Timeout for individual requests (5 minutes – large datasets may take longer) */
const REQUEST_TIMEOUT_MS = 5 * 60 * 1000;

/** Result from executing Python code */
export interface PyodideExecutionResult {
  success: boolean;
  result?: unknown;
  error?: string;
  stdout: string[];
  stderr: string[];
}

/** State of the Pyodide engine */
export interface PyodideState {
  stage: PyodideLoadStage;
  percent: number;
  message: string;
  isLoading: boolean;
  isReady: boolean;
  error?: string;
}

/** Progress listener callback */
export type ProgressListener = (state: PyodideState) => void;

/** Pending request awaiting a response */
interface PendingRequest {
  resolve: (response: WorkerResponse) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export class PyodideManager {
  private static instance: PyodideManager | null = null;

  private worker: Worker | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private progressListeners = new Set<ProgressListener>();
  private state: PyodideState = {
    stage: 'downloading',
    percent: 0,
    message: '',
    isLoading: false,
    isReady: false,
  };
  private stdoutBuffer: string[] = [];
  private stderrBuffer: string[] = [];
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  /** Get the singleton instance */
  static getInstance(): PyodideManager {
    if (!PyodideManager.instance) {
      PyodideManager.instance = new PyodideManager();
    }
    return PyodideManager.instance;
  }

  /** Reset the singleton (for testing) */
  static resetInstance(): void {
    if (PyodideManager.instance) {
      PyodideManager.instance.terminate();
    }
    PyodideManager.instance = null;
  }

  /** Current state */
  getState(): PyodideState {
    return { ...this.state };
  }

  /**
   * Subscribe to progress updates. Returns a cleanup function.
   */
  onProgress(listener: ProgressListener): () => void {
    this.progressListeners.add(listener);
    // Immediately fire with current state
    listener(this.getState());
    return () => {
      this.progressListeners.delete(listener);
    };
  }

  /**
   * Initialize Pyodide in a Web Worker.
   * Idempotent – calling multiple times returns the same promise.
   */
  async initialize(
    cdnUrl: string = PYODIDE_CDN_URL,
    packages: string[] = DEFAULT_PACKAGES,
  ): Promise<void> {
    // Already ready
    if (this.state.isReady) return;

    // Already loading – return existing promise
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.doInitialize(cdnUrl, packages);

    try {
      await this.initPromise;
    } catch (err) {
      this.initPromise = null;
      throw err;
    }
  }

  /**
   * Run Python code and return the result.
   */
  async runPython(code: string): Promise<PyodideExecutionResult> {
    if (!this.state.isReady || !this.worker) {
      return {
        success: false,
        error: 'Pyodide ist nicht initialisiert. Bitte zuerst initialize() aufrufen.',
        stdout: [],
        stderr: [],
      };
    }

    // Clear output buffers for this execution
    this.stdoutBuffer = [];
    this.stderrBuffer = [];

    const response = await this.sendRequest(
      { type: 'RUN_PYTHON', id: '', code },
      REQUEST_TIMEOUT_MS,
    );

    const stdout = [...this.stdoutBuffer];
    const stderr = [...this.stderrBuffer];

    if (response.type === 'SUCCESS') {
      return { success: true, result: response.result, stdout, stderr };
    }
    return { success: false, error: response.error, stdout, stderr };
  }

  /**
   * Load additional packages into Pyodide.
   */
  async loadPackages(packages: string[]): Promise<void> {
    if (!this.state.isReady || !this.worker) {
      throw new Error('Pyodide ist nicht initialisiert');
    }

    const response = await this.sendRequest(
      { type: 'LOAD_PACKAGES', id: '', packages },
      INIT_TIMEOUT_MS,
    );

    if (response.type === 'ERROR') {
      throw new Error(response.error);
    }
  }

  /**
   * Check if the worker is alive and Pyodide is initialized.
   */
  async healthCheck(): Promise<boolean> {
    if (!this.worker) return false;

    try {
      const response = await this.sendRequest(
        { type: 'HEALTH_CHECK', id: '' },
        10_000,
      );
      if (response.type === 'SUCCESS') {
        const result = response.result as { initialized: boolean } | undefined;
        return result?.initialized ?? false;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Terminate the worker and reject all pending requests.
   */
  terminate(): void {
    if (this.worker) {
      try {
        this.worker.terminate();
      } catch {
        // Worker may already be terminated
      }
      this.worker = null;
    }

    // Reject all pending requests
    for (const [, pending] of this.pendingRequests) {
      clearTimeout(pending.timer);
      pending.reject(new Error('Worker terminated'));
    }
    this.pendingRequests.clear();

    this.state = {
      stage: 'downloading',
      percent: 0,
      message: '',
      isLoading: false,
      isReady: false,
    };
    this.initPromise = null;
    this.notifyListeners();
  }

  // --- Private methods ---

  private async doInitialize(cdnUrl: string, packages: string[]): Promise<void> {
    this.updateState({
      stage: 'downloading',
      percent: 0,
      message: 'ML-Engine wird gestartet...',
      isLoading: true,
      isReady: false,
      error: undefined,
    });

    // Create worker using Vite's native worker support
    this.worker = new Worker(
      new URL('./pyodide.worker.ts', import.meta.url),
      { type: 'module' },
    );

    // Set up message handler
    this.worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      this.handleMessage(event.data);
    };

    this.worker.onerror = (event: ErrorEvent) => {
      const errorMsg = event.message || 'Worker-Fehler';
      this.updateState({
        stage: 'error',
        percent: 0,
        message: errorMsg,
        isLoading: false,
        isReady: false,
        error: errorMsg,
      });

      // Reject all pending requests
      for (const [id, pending] of this.pendingRequests) {
        clearTimeout(pending.timer);
        pending.reject(new Error(errorMsg));
        this.pendingRequests.delete(id);
      }
    };

    // Send initialization request
    const response = await this.sendRequest(
      { type: 'INITIALIZE', id: '', cdnUrl, packages },
      INIT_TIMEOUT_MS,
    );

    if (response.type === 'ERROR') {
      this.updateState({
        stage: 'error',
        percent: 0,
        message: response.error,
        isLoading: false,
        isReady: false,
        error: response.error,
      });
      throw new Error(response.error);
    }

    this.updateState({
      stage: 'ready',
      percent: 100,
      message: 'ML-Engine bereit',
      isLoading: false,
      isReady: true,
      error: undefined,
    });
  }

  private sendRequest(
    request: Omit<WorkerRequest, 'id'> & { id: string },
    timeoutMs: number,
  ): Promise<WorkerResponse> {
    return new Promise<WorkerResponse>((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker nicht verfügbar'));
        return;
      }

      const id = generateRequestId();
      const fullRequest = { ...request, id } as WorkerRequest;

      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error('Zeitüberschreitung: Anfrage hat zu lange gedauert'));
      }, timeoutMs);

      this.pendingRequests.set(id, { resolve, reject, timer });
      this.worker.postMessage(fullRequest);
    });
  }

  private handleMessage(message: WorkerMessage): void {
    if (message.kind === 'response') {
      const pending = this.pendingRequests.get(message.id);
      if (pending) {
        clearTimeout(pending.timer);
        this.pendingRequests.delete(message.id);
        pending.resolve(message);
      }
    } else if (message.kind === 'broadcast') {
      switch (message.type) {
        case 'PROGRESS':
          this.updateState({
            stage: message.stage,
            percent: message.percent,
            message: message.message,
            isLoading: message.stage !== 'ready' && message.stage !== 'error',
            isReady: message.stage === 'ready',
            error: message.stage === 'error' ? message.message : undefined,
          });
          break;
        case 'STDOUT':
          this.stdoutBuffer.push(message.text);
          break;
        case 'STDERR':
          this.stderrBuffer.push(message.text);
          break;
      }
    }
  }

  private updateState(newState: PyodideState): void {
    this.state = newState;
    this.notifyListeners();
  }

  private notifyListeners(): void {
    const snapshot = this.getState();
    for (const listener of this.progressListeners) {
      listener(snapshot);
    }
  }
}
