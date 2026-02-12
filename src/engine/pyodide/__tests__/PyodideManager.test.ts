import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { WorkerRequest, WorkerMessage, ProgressBroadcast } from '../messageTypes';

/**
 * Mock Worker class that simulates postMessage/onmessage communication.
 * The test controls what responses the "worker" sends back.
 */
class MockWorker {
  onmessage: ((event: MessageEvent<WorkerMessage>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  private messageHandler: ((request: WorkerRequest) => void) | null = null;

  constructor() {
    MockWorker.lastInstance = this;
  }

  static lastInstance: MockWorker | null = null;

  postMessage(data: WorkerRequest): void {
    if (this.messageHandler) {
      this.messageHandler(data);
    }
  }

  terminate(): void {
    this.onmessage = null;
    this.onerror = null;
  }

  /** Set a handler that auto-responds to incoming requests */
  setAutoResponder(handler: (request: WorkerRequest) => void): void {
    this.messageHandler = handler;
  }

  /** Simulate receiving a message from the worker */
  simulateMessage(data: WorkerMessage): void {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data }));
    }
  }

  /** Simulate a worker error */
  simulateError(message: string): void {
    if (this.onerror) {
      this.onerror(new ErrorEvent('error', { message }));
    }
  }
}

// Mock the Worker constructor globally
vi.stubGlobal('Worker', MockWorker);

// Mock import.meta.url for the Worker URL constructor
vi.mock('../pyodide.worker.ts', () => ({}));

// We need to import after mocking
const { PyodideManager } = await import('../PyodideManager');

describe('PyodideManager', () => {
  beforeEach(() => {
    PyodideManager.resetInstance();
    MockWorker.lastInstance = null;
  });

  afterEach(() => {
    PyodideManager.resetInstance();
  });

  describe('Singleton', () => {
    it('returns the same instance', () => {
      const a = PyodideManager.getInstance();
      const b = PyodideManager.getInstance();
      expect(a).toBe(b);
    });

    it('resetInstance creates a new instance', () => {
      const a = PyodideManager.getInstance();
      PyodideManager.resetInstance();
      const b = PyodideManager.getInstance();
      expect(a).not.toBe(b);
    });
  });

  describe('getState', () => {
    it('returns initial state before initialization', () => {
      const manager = PyodideManager.getInstance();
      const state = manager.getState();
      expect(state.isReady).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('initialize', () => {
    it('creates a worker and sends INITIALIZE request with correct params', async () => {
      const manager = PyodideManager.getInstance();
      let receivedRequest: WorkerRequest | null = null;

      vi.stubGlobal('Worker', class extends MockWorker {
        constructor() {
          super();
          this.setAutoResponder((request) => {
            if (request.type === 'INITIALIZE') {
              receivedRequest = request;
              setTimeout(() => {
                this.simulateMessage({
                  kind: 'response',
                  type: 'SUCCESS',
                  id: request.id,
                  result: 'initialized',
                });
              }, 0);
            }
          });
        }
      });

      await manager.initialize('https://cdn.test/', ['numpy']);

      expect(receivedRequest).not.toBeNull();
      expect((receivedRequest as WorkerRequest & { cdnUrl: string }).cdnUrl).toBe('https://cdn.test/');
      expect((receivedRequest as WorkerRequest & { packages: string[] }).packages).toEqual(['numpy']);

      vi.stubGlobal('Worker', MockWorker);
    });

    it('resolves when worker responds with SUCCESS', async () => {
      const manager = PyodideManager.getInstance();

      vi.stubGlobal('Worker', class extends MockWorker {
        constructor() {
          super();
          // Auto-respond to INITIALIZE after a tick
          this.setAutoResponder((request) => {
            if (request.type === 'INITIALIZE') {
              setTimeout(() => {
                this.simulateMessage({
                  kind: 'response',
                  type: 'SUCCESS',
                  id: request.id,
                  result: 'initialized',
                });
              }, 0);
            }
          });
        }
      });

      await manager.initialize('https://cdn.test/', []);
      expect(manager.getState().isReady).toBe(true);
      expect(manager.getState().stage).toBe('ready');

      vi.stubGlobal('Worker', MockWorker);
    });

    it('rejects when worker responds with ERROR', async () => {
      const manager = PyodideManager.getInstance();

      vi.stubGlobal('Worker', class extends MockWorker {
        constructor() {
          super();
          this.setAutoResponder((request) => {
            if (request.type === 'INITIALIZE') {
              setTimeout(() => {
                this.simulateMessage({
                  kind: 'response',
                  type: 'ERROR',
                  id: request.id,
                  error: 'CDN not reachable',
                  errorType: 'network',
                });
              }, 0);
            }
          });
        }
      });

      await expect(manager.initialize('https://bad.cdn/', [])).rejects.toThrow('CDN not reachable');
      expect(manager.getState().isReady).toBe(false);
      expect(manager.getState().error).toBe('CDN not reachable');

      vi.stubGlobal('Worker', MockWorker);
    });

    it('is idempotent – second call returns same promise', async () => {
      const manager = PyodideManager.getInstance();

      vi.stubGlobal('Worker', class extends MockWorker {
        constructor() {
          super();
          this.setAutoResponder((request) => {
            if (request.type === 'INITIALIZE') {
              setTimeout(() => {
                this.simulateMessage({
                  kind: 'response',
                  type: 'SUCCESS',
                  id: request.id,
                  result: 'initialized',
                });
              }, 0);
            }
          });
        }
      });

      const p1 = manager.initialize('https://cdn.test/', []);
      const p2 = manager.initialize('https://cdn.test/', []);

      await Promise.all([p1, p2]);
      expect(manager.getState().isReady).toBe(true);

      vi.stubGlobal('Worker', MockWorker);
    });

    it('does nothing if already ready', async () => {
      const manager = PyodideManager.getInstance();

      vi.stubGlobal('Worker', class extends MockWorker {
        constructor() {
          super();
          this.setAutoResponder((request) => {
            if (request.type === 'INITIALIZE') {
              setTimeout(() => {
                this.simulateMessage({
                  kind: 'response',
                  type: 'SUCCESS',
                  id: request.id,
                  result: 'initialized',
                });
              }, 0);
            }
          });
        }
      });

      await manager.initialize('https://cdn.test/', []);

      // Second call should return immediately without creating a new worker
      await manager.initialize('https://cdn.test/', []);
      expect(manager.getState().isReady).toBe(true);

      vi.stubGlobal('Worker', MockWorker);
    });
  });

  describe('runPython', () => {
    it('returns error if not initialized', async () => {
      const manager = PyodideManager.getInstance();
      const result = await manager.runPython('print("hello")');
      expect(result.success).toBe(false);
      expect(result.error).toContain('nicht initialisiert');
    });

    it('sends RUN_PYTHON and returns result', async () => {
      const manager = PyodideManager.getInstance();

      vi.stubGlobal('Worker', class extends MockWorker {
        constructor() {
          super();
          this.setAutoResponder((request) => {
            if (request.type === 'INITIALIZE') {
              setTimeout(() => {
                this.simulateMessage({
                  kind: 'response',
                  type: 'SUCCESS',
                  id: request.id,
                  result: 'initialized',
                });
              }, 0);
            } else if (request.type === 'RUN_PYTHON') {
              setTimeout(() => {
                this.simulateMessage({
                  kind: 'response',
                  type: 'SUCCESS',
                  id: request.id,
                  result: 42,
                });
              }, 0);
            }
          });
        }
      });

      await manager.initialize('https://cdn.test/', []);
      const result = await manager.runPython('1 + 1');
      expect(result.success).toBe(true);
      expect(result.result).toBe(42);

      vi.stubGlobal('Worker', MockWorker);
    });

    it('returns Python errors', async () => {
      const manager = PyodideManager.getInstance();

      vi.stubGlobal('Worker', class extends MockWorker {
        constructor() {
          super();
          this.setAutoResponder((request) => {
            if (request.type === 'INITIALIZE') {
              setTimeout(() => {
                this.simulateMessage({
                  kind: 'response',
                  type: 'SUCCESS',
                  id: request.id,
                });
              }, 0);
            } else if (request.type === 'RUN_PYTHON') {
              setTimeout(() => {
                this.simulateMessage({
                  kind: 'response',
                  type: 'ERROR',
                  id: request.id,
                  error: 'NameError: name "x" is not defined',
                  errorType: 'python',
                });
              }, 0);
            }
          });
        }
      });

      await manager.initialize('https://cdn.test/', []);
      const result = await manager.runPython('print(x)');
      expect(result.success).toBe(false);
      expect(result.error).toContain('NameError');

      vi.stubGlobal('Worker', MockWorker);
    });

    it('captures stdout/stderr from broadcasts', async () => {
      const manager = PyodideManager.getInstance();

      vi.stubGlobal('Worker', class extends MockWorker {
        constructor() {
          super();
          this.setAutoResponder((request) => {
            if (request.type === 'INITIALIZE') {
              setTimeout(() => {
                this.simulateMessage({
                  kind: 'response',
                  type: 'SUCCESS',
                  id: request.id,
                });
              }, 0);
            } else if (request.type === 'RUN_PYTHON') {
              // Simulate stdout before response
              setTimeout(() => {
                this.simulateMessage({
                  kind: 'broadcast',
                  type: 'STDOUT',
                  text: 'hello world',
                });
                this.simulateMessage({
                  kind: 'broadcast',
                  type: 'STDERR',
                  text: 'warning: something',
                });
                this.simulateMessage({
                  kind: 'response',
                  type: 'SUCCESS',
                  id: request.id,
                  result: null,
                });
              }, 0);
            }
          });
        }
      });

      await manager.initialize('https://cdn.test/', []);
      const result = await manager.runPython('print("hello world")');
      expect(result.success).toBe(true);
      expect(result.stdout).toContain('hello world');
      expect(result.stderr).toContain('warning: something');

      vi.stubGlobal('Worker', MockWorker);
    });
  });

  describe('onProgress', () => {
    it('fires immediately with current state', () => {
      const manager = PyodideManager.getInstance();
      const states: PyodideManager['getState'] extends () => infer R ? R[] : never = [];

      manager.onProgress((state) => {
        states.push(state);
      });

      expect(states.length).toBe(1);
      expect(states[0].isReady).toBe(false);
    });

    it('fires on progress broadcasts during initialization', async () => {
      const manager = PyodideManager.getInstance();
      const stages: string[] = [];

      manager.onProgress((state) => {
        stages.push(state.stage);
      });

      vi.stubGlobal('Worker', class extends MockWorker {
        constructor() {
          super();
          this.setAutoResponder((request) => {
            if (request.type === 'INITIALIZE') {
              setTimeout(() => {
                this.simulateMessage({
                  kind: 'broadcast',
                  type: 'PROGRESS',
                  stage: 'downloading',
                  percent: 10,
                  message: 'Downloading...',
                } satisfies ProgressBroadcast);
                this.simulateMessage({
                  kind: 'broadcast',
                  type: 'PROGRESS',
                  stage: 'initializing',
                  percent: 30,
                  message: 'Initializing...',
                } satisfies ProgressBroadcast);
                this.simulateMessage({
                  kind: 'broadcast',
                  type: 'PROGRESS',
                  stage: 'loading-packages',
                  percent: 60,
                  message: 'Loading numpy...',
                } satisfies ProgressBroadcast);
                this.simulateMessage({
                  kind: 'response',
                  type: 'SUCCESS',
                  id: request.id,
                  result: 'initialized',
                });
              }, 0);
            }
          });
        }
      });

      await manager.initialize('https://cdn.test/', ['numpy']);

      expect(stages).toContain('downloading');
      expect(stages).toContain('initializing');
      expect(stages).toContain('loading-packages');
      expect(stages).toContain('ready');

      vi.stubGlobal('Worker', MockWorker);
    });

    it('cleanup function removes listener', () => {
      const manager = PyodideManager.getInstance();
      let callCount = 0;

      const cleanup = manager.onProgress(() => {
        callCount++;
      });

      expect(callCount).toBe(1); // Initial fire
      cleanup();

      // Trigger a state change manually via terminate
      manager.terminate();

      // Should not have been called again
      expect(callCount).toBe(1);
    });
  });

  describe('healthCheck', () => {
    it('returns false when no worker exists', async () => {
      const manager = PyodideManager.getInstance();
      const healthy = await manager.healthCheck();
      expect(healthy).toBe(false);
    });

    it('returns true when worker responds with initialized: true', async () => {
      const manager = PyodideManager.getInstance();

      vi.stubGlobal('Worker', class extends MockWorker {
        constructor() {
          super();
          this.setAutoResponder((request) => {
            if (request.type === 'INITIALIZE') {
              setTimeout(() => {
                this.simulateMessage({
                  kind: 'response',
                  type: 'SUCCESS',
                  id: request.id,
                });
              }, 0);
            } else if (request.type === 'HEALTH_CHECK') {
              setTimeout(() => {
                this.simulateMessage({
                  kind: 'response',
                  type: 'SUCCESS',
                  id: request.id,
                  result: { initialized: true },
                });
              }, 0);
            }
          });
        }
      });

      await manager.initialize('https://cdn.test/', []);
      const healthy = await manager.healthCheck();
      expect(healthy).toBe(true);

      vi.stubGlobal('Worker', MockWorker);
    });
  });

  describe('terminate', () => {
    it('rejects pending requests', async () => {
      const manager = PyodideManager.getInstance();

      vi.stubGlobal('Worker', class extends MockWorker {
        constructor() {
          super();
          this.setAutoResponder((request) => {
            if (request.type === 'INITIALIZE') {
              setTimeout(() => {
                this.simulateMessage({
                  kind: 'response',
                  type: 'SUCCESS',
                  id: request.id,
                });
              }, 0);
            }
            // Don't respond to RUN_PYTHON - let it hang
          });
        }
      });

      await manager.initialize('https://cdn.test/', []);

      const runPromise = manager.runPython('while True: pass');
      manager.terminate();

      await expect(runPromise).rejects.toThrow('Worker terminated');

      vi.stubGlobal('Worker', MockWorker);
    });

    it('resets state after termination', () => {
      const manager = PyodideManager.getInstance();
      manager.terminate();

      const state = manager.getState();
      expect(state.isReady).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('loadPackages', () => {
    it('throws if not initialized', async () => {
      const manager = PyodideManager.getInstance();
      await expect(manager.loadPackages(['scipy'])).rejects.toThrow('nicht initialisiert');
    });

    it('sends LOAD_PACKAGES request', async () => {
      const manager = PyodideManager.getInstance();

      vi.stubGlobal('Worker', class extends MockWorker {
        constructor() {
          super();
          this.setAutoResponder((request) => {
            if (request.type === 'INITIALIZE') {
              setTimeout(() => {
                this.simulateMessage({
                  kind: 'response',
                  type: 'SUCCESS',
                  id: request.id,
                });
              }, 0);
            } else if (request.type === 'LOAD_PACKAGES') {
              setTimeout(() => {
                this.simulateMessage({
                  kind: 'response',
                  type: 'SUCCESS',
                  id: request.id,
                  result: request.packages,
                });
              }, 0);
            }
          });
        }
      });

      await manager.initialize('https://cdn.test/', []);
      await expect(manager.loadPackages(['scipy'])).resolves.toBeUndefined();

      vi.stubGlobal('Worker', MockWorker);
    });
  });
});
