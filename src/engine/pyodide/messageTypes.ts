/**
 * Typed message protocol for Pyodide WebWorker communication.
 * Uses discriminated unions for type-safe postMessage handling.
 */

// --- Request types (Main Thread → Worker) ---

export type WorkerRequestType =
  | 'INITIALIZE'
  | 'RUN_PYTHON'
  | 'LOAD_PACKAGES'
  | 'HEALTH_CHECK'
  | 'TERMINATE';

export interface InitializeRequest {
  type: 'INITIALIZE';
  id: string;
  cdnUrl: string;
  packages: string[];
}

export interface RunPythonRequest {
  type: 'RUN_PYTHON';
  id: string;
  code: string;
}

export interface LoadPackagesRequest {
  type: 'LOAD_PACKAGES';
  id: string;
  packages: string[];
}

export interface HealthCheckRequest {
  type: 'HEALTH_CHECK';
  id: string;
}

export interface TerminateRequest {
  type: 'TERMINATE';
  id: string;
}

export type WorkerRequest =
  | InitializeRequest
  | RunPythonRequest
  | LoadPackagesRequest
  | HealthCheckRequest
  | TerminateRequest;

// --- Response types (Worker → Main Thread) ---

export interface SuccessResponse {
  kind: 'response';
  type: 'SUCCESS';
  id: string;
  result?: unknown;
}

export interface ErrorResponse {
  kind: 'response';
  type: 'ERROR';
  id: string;
  error: string;
  errorType: 'network' | 'timeout' | 'python' | 'worker' | 'unknown';
}

export type WorkerResponse = SuccessResponse | ErrorResponse;

// --- Broadcast types (Worker → Main Thread, no request ID) ---

export type PyodideLoadStage =
  | 'downloading'
  | 'initializing'
  | 'loading-packages'
  | 'ready'
  | 'error';

export interface ProgressBroadcast {
  kind: 'broadcast';
  type: 'PROGRESS';
  stage: PyodideLoadStage;
  percent: number;
  message: string;
}

export interface StdoutBroadcast {
  kind: 'broadcast';
  type: 'STDOUT';
  text: string;
}

export interface StderrBroadcast {
  kind: 'broadcast';
  type: 'STDERR';
  text: string;
}

export type WorkerBroadcast = ProgressBroadcast | StdoutBroadcast | StderrBroadcast;

// --- Union of all worker-to-main messages ---

export type WorkerMessage = WorkerResponse | WorkerBroadcast;

// --- Utility ---

let counter = 0;

/** Generate a unique request ID for correlating request/response pairs. */
export function generateRequestId(): string {
  return `req-${Date.now()}-${++counter}`;
}
