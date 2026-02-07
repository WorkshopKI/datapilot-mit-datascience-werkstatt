/**
 * Pyodide Web Worker script.
 * Loads Pyodide from CDN and executes Python code in a background thread.
 * Communicates with main thread via typed postMessage protocol.
 */

import type {
  WorkerRequest,
  WorkerResponse,
  WorkerBroadcast,
  ProgressBroadcast,
} from './messageTypes';

// Worker global scope
declare const self: DedicatedWorkerGlobalScope;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodide: any = null;

function sendResponse(response: WorkerResponse): void {
  self.postMessage(response);
}

function sendBroadcast(broadcast: WorkerBroadcast): void {
  self.postMessage(broadcast);
}

function sendProgress(stage: ProgressBroadcast['stage'], percent: number, message: string): void {
  sendBroadcast({ kind: 'broadcast', type: 'PROGRESS', stage, percent, message });
}

function sendStdout(text: string): void {
  sendBroadcast({ kind: 'broadcast', type: 'STDOUT', text });
}

function sendStderr(text: string): void {
  sendBroadcast({ kind: 'broadcast', type: 'STDERR', text });
}

async function handleInitialize(id: string, cdnUrl: string, packages: string[]): Promise<void> {
  try {
    if (pyodide) {
      sendResponse({ kind: 'response', type: 'SUCCESS', id, result: 'already_initialized' });
      return;
    }

    // Step 1: Download Pyodide from CDN
    sendProgress('downloading', 10, 'Pyodide wird heruntergeladen...');

    // Dynamic import of Pyodide from CDN
    // @vite-ignore is needed because this URL is determined at runtime
    const pyodideUrl = `${cdnUrl}pyodide.mjs`;

    let loadPyodide: (...args: unknown[]) => Promise<unknown>;
    try {
      const pyodideModule = await import(/* @vite-ignore */ pyodideUrl);
      loadPyodide = pyodideModule.loadPyodide;
    } catch (err) {
      sendProgress('error', 0, 'Pyodide CDN nicht erreichbar');
      sendResponse({
        kind: 'response',
        type: 'ERROR',
        id,
        error: `CDN nicht erreichbar: ${err instanceof Error ? err.message : String(err)}`,
        errorType: 'network',
      });
      return;
    }

    // Step 2: Initialize Pyodide runtime
    sendProgress('initializing', 30, 'Python-Runtime wird initialisiert...');

    pyodide = await loadPyodide({
      indexURL: cdnUrl,
      stdout: (text: string) => sendStdout(text),
      stderr: (text: string) => sendStderr(text),
    });

    // Step 3: Load packages
    if (packages.length > 0) {
      sendProgress('loading-packages', 50, `Pakete werden geladen: ${packages.join(', ')}...`);

      const totalPackages = packages.length;
      for (let i = 0; i < totalPackages; i++) {
        const pkg = packages[i];
        const percent = 50 + Math.round(((i + 1) / totalPackages) * 40);
        sendProgress('loading-packages', percent, `Lade ${pkg}... (${i + 1}/${totalPackages})`);

        await pyodide.loadPackage(pkg);
      }
    }

    // Step 4: Ready
    sendProgress('ready', 100, 'ML-Engine bereit');
    sendResponse({ kind: 'response', type: 'SUCCESS', id, result: 'initialized' });
  } catch (err) {
    pyodide = null;
    const message = err instanceof Error ? err.message : String(err);
    sendProgress('error', 0, `Initialisierung fehlgeschlagen: ${message}`);
    sendResponse({
      kind: 'response',
      type: 'ERROR',
      id,
      error: message,
      errorType: 'worker',
    });
  }
}

async function handleRunPython(id: string, code: string): Promise<void> {
  if (!pyodide) {
    sendResponse({
      kind: 'response',
      type: 'ERROR',
      id,
      error: 'Pyodide ist nicht initialisiert',
      errorType: 'worker',
    });
    return;
  }

  try {
    const result = await pyodide.runPythonAsync(code);
    // Convert Pyodide proxy objects to JS values
    const jsResult = result?.toJs ? result.toJs({ dict_converter: Object.fromEntries }) : result;
    sendResponse({ kind: 'response', type: 'SUCCESS', id, result: jsResult });
  } catch (err) {
    sendResponse({
      kind: 'response',
      type: 'ERROR',
      id,
      error: err instanceof Error ? err.message : String(err),
      errorType: 'python',
    });
  }
}

async function handleLoadPackages(id: string, packages: string[]): Promise<void> {
  if (!pyodide) {
    sendResponse({
      kind: 'response',
      type: 'ERROR',
      id,
      error: 'Pyodide ist nicht initialisiert',
      errorType: 'worker',
    });
    return;
  }

  try {
    for (const pkg of packages) {
      await pyodide.loadPackage(pkg);
    }
    sendResponse({ kind: 'response', type: 'SUCCESS', id, result: packages });
  } catch (err) {
    sendResponse({
      kind: 'response',
      type: 'ERROR',
      id,
      error: err instanceof Error ? err.message : String(err),
      errorType: 'worker',
    });
  }
}

function handleHealthCheck(id: string): void {
  sendResponse({
    kind: 'response',
    type: 'SUCCESS',
    id,
    result: { initialized: !!pyodide },
  });
}

// --- Message handler ---

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;

  switch (request.type) {
    case 'INITIALIZE':
      await handleInitialize(request.id, request.cdnUrl, request.packages);
      break;
    case 'RUN_PYTHON':
      await handleRunPython(request.id, request.code);
      break;
    case 'LOAD_PACKAGES':
      await handleLoadPackages(request.id, request.packages);
      break;
    case 'HEALTH_CHECK':
      handleHealthCheck(request.id);
      break;
    case 'TERMINATE':
      pyodide = null;
      sendResponse({ kind: 'response', type: 'SUCCESS', id: request.id });
      self.close();
      break;
  }
};
