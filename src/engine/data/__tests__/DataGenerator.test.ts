import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Feature, ProjectType } from '../../types';

// Mock PyodideManager before importing DataGenerator
vi.mock('../../pyodide/PyodideManager', () => {
  const mockRunPython = vi.fn();
  const mockGetState = vi.fn();
  const mockGetInstance = vi.fn(() => ({
    runPython: mockRunPython,
    getState: mockGetState,
  }));

  return {
    PyodideManager: {
      getInstance: mockGetInstance,
    },
    // Expose mocks for test access
    __mockRunPython: mockRunPython,
    __mockGetState: mockGetState,
  };
});

// Import after mocking
import { DataGenerator } from '../DataGenerator';
import type { DataGeneratorConfig } from '../DataGenerator';

// Access the mocks
const pyodideMock = await import('../../pyodide/PyodideManager');
const mockRunPython = (pyodideMock as Record<string, unknown>).__mockRunPython as ReturnType<typeof vi.fn>;
const mockGetState = (pyodideMock as Record<string, unknown>).__mockGetState as ReturnType<typeof vi.fn>;

// --- Test helpers ---

function makeFeatures(names: string[], targetName?: string): Feature[] {
  const features: Feature[] = names.map((name, i) => ({
    id: String(i + 1),
    name,
    type: 'numerisch' as const,
    description: '',
  }));
  if (targetName) {
    features.push({
      id: String(features.length + 1),
      name: targetName,
      type: 'kategorial' as const,
      description: '',
      isTarget: true,
    });
  }
  return features;
}

function makeConfig(overrides?: Partial<DataGeneratorConfig>): DataGeneratorConfig {
  return {
    type: 'klassifikation',
    rowCount: 100,
    features: makeFeatures(['Alter', 'Gehalt', 'Erfahrung'], 'Churn'),
    ...overrides,
  };
}

function mockPyodideReady(): void {
  mockGetState.mockReturnValue({ isReady: true, isLoading: false, stage: 'ready', percent: 100, message: '' });
}

function mockPyodideNotReady(): void {
  mockGetState.mockReturnValue({ isReady: false, isLoading: false, stage: 'downloading', percent: 0, message: '' });
}

function mockRunPythonSuccess(result: unknown): void {
  mockRunPython.mockResolvedValue({
    success: true,
    result,
    stdout: [],
    stderr: [],
  });
}

function mockRunPythonError(error: string): void {
  mockRunPython.mockResolvedValue({
    success: false,
    error,
    stdout: [],
    stderr: [],
  });
}

// --- Tests ---

describe('DataGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================
  // buildPythonCode tests
  // ===========================================

  describe('buildPythonCode', () => {
    it('generates classification code with make_classification', () => {
      const config = makeConfig({ type: 'klassifikation' });
      const code = DataGenerator.buildPythonCode(config);

      expect(code).toContain('from sklearn.datasets import make_classification');
      expect(code).toContain('make_classification(');
      expect(code).toContain('n_samples=100');
      expect(code).toContain('n_features=3');
      expect(code).toContain('random_state=42');
      expect(code).toContain('"Alter"');
      expect(code).toContain('"Gehalt"');
      expect(code).toContain('"Erfahrung"');
      expect(code).toContain('df["Churn"] = y');
    });

    it('generates regression code with make_regression', () => {
      const config = makeConfig({
        type: 'regression',
        features: makeFeatures(['Quadratmeter', 'Zimmer'], 'Preis'),
      });
      const code = DataGenerator.buildPythonCode(config);

      expect(code).toContain('from sklearn.datasets import make_regression');
      expect(code).toContain('make_regression(');
      expect(code).toContain('n_samples=100');
      expect(code).toContain('n_features=2');
      expect(code).toContain('"Quadratmeter"');
      expect(code).toContain('"Zimmer"');
      expect(code).toContain('df["Preis"] = y');
    });

    it('generates clustering code with make_blobs', () => {
      const config = makeConfig({
        type: 'clustering',
        features: makeFeatures(['Umsatz', 'Bestellhäufigkeit']),
      });
      const code = DataGenerator.buildPythonCode(config);

      expect(code).toContain('from sklearn.datasets import make_blobs');
      expect(code).toContain('make_blobs(');
      expect(code).toContain('n_samples=100');
      expect(code).toContain('centers=3');
      expect(code).toContain('"Umsatz"');
      expect(code).toContain('df["Cluster"] = y');
    });

    it('uses custom random seed', () => {
      const config = makeConfig({ randomSeed: 123 });
      const code = DataGenerator.buildPythonCode(config);

      expect(code).toContain('random_state=123');
    });

    it('uses default random seed 42 when not specified', () => {
      const config = makeConfig();
      delete config.randomSeed;
      const code = DataGenerator.buildPythonCode(config);

      expect(code).toContain('random_state=42');
    });

    it('maps noiseFactor for classification (flip_y)', () => {
      const config = makeConfig({ noiseFactor: 0.3 });
      const code = DataGenerator.buildPythonCode(config);

      expect(code).toContain('flip_y=0.3');
    });

    it('maps noiseFactor for regression (noise)', () => {
      const config = makeConfig({
        type: 'regression',
        noiseFactor: 0.5,
        features: makeFeatures(['A', 'B'], 'Y'),
      });
      const code = DataGenerator.buildPythonCode(config);

      // 0.5 * 50 = 25
      expect(code).toContain('noise=25');
    });

    it('maps noiseFactor for clustering (cluster_std)', () => {
      const config = makeConfig({
        type: 'clustering',
        noiseFactor: 0.5,
        features: makeFeatures(['A', 'B']),
      });
      const code = DataGenerator.buildPythonCode(config);

      // 0.5 + 0.5 * 2.5 = 1.75
      expect(code).toContain('cluster_std=1.75');
    });

    it('clamps classification noise to max 0.5', () => {
      const config = makeConfig({ noiseFactor: 0.9 });
      const code = DataGenerator.buildPythonCode(config);

      expect(code).toContain('flip_y=0.5');
    });

    it('uses default noiseFactor 0.1 when not specified', () => {
      const config = makeConfig();
      delete config.noiseFactor;
      const code = DataGenerator.buildPythonCode(config);

      expect(code).toContain('flip_y=0.1');
    });

    it('maps feature names correctly into Python list', () => {
      const config = makeConfig({
        features: makeFeatures(['Alter', 'Vertragslaufzeit_Monate', 'Kosten'], 'Churn'),
      });
      const code = DataGenerator.buildPythonCode(config);

      expect(code).toContain('columns = ["Alter", "Vertragslaufzeit_Monate", "Kosten"]');
    });

    it('pads column names when fewer feature names than n_features', () => {
      // Only 1 named feature but min n_features is 2
      const config = makeConfig({
        features: makeFeatures(['Alter'], 'Churn'),
      });
      const code = DataGenerator.buildPythonCode(config);

      expect(code).toContain('n_features=2');
      expect(code).toContain('while len(columns) < 2');
    });

    it('excludes target feature from input columns', () => {
      const config = makeConfig({
        features: [
          { id: '1', name: 'Alter', type: 'numerisch', description: '' },
          { id: '2', name: 'Churn', type: 'kategorial', description: '', isTarget: true },
        ],
      });
      const code = DataGenerator.buildPythonCode(config);

      // Alter should be in columns, Churn should be target
      expect(code).toContain('columns = ["Alter"]');
      expect(code).toContain('df["Churn"] = y');
    });

    it('uses "target" as fallback when no feature has isTarget', () => {
      const config = makeConfig({
        type: 'klassifikation',
        features: [
          { id: '1', name: 'A', type: 'numerisch', description: '' },
          { id: '2', name: 'B', type: 'numerisch', description: '' },
        ],
      });
      const code = DataGenerator.buildPythonCode(config);

      expect(code).toContain('df["target"] = y');
    });

    it('generates code that returns a JSON-serializable result dict', () => {
      const config = makeConfig();
      const code = DataGenerator.buildPythonCode(config);

      expect(code).toContain('result = {');
      expect(code).toContain('"columns": list(df.columns)');
      expect(code).toContain('"rows": json.loads(df.to_json(orient="records"))');
      expect(code).toContain('"rowCount": len(df)');
      expect(code).toContain('import json');
    });

    it('sanitizes feature names with special characters', () => {
      const config = makeConfig({
        features: makeFeatures(['Preis "EUR"', 'Stra\\u00dfe'], 'Label'),
      });
      const code = DataGenerator.buildPythonCode(config);

      expect(code).toContain('Preis \\"EUR\\"');
      expect(code).toContain('Stra\\\\u00dfe');
    });

    it('ensures minimum 2 features for classification', () => {
      const config = makeConfig({
        features: [
          { id: '1', name: 'X', type: 'numerisch', description: '' },
          { id: '2', name: 'Y', type: 'kategorial', description: '', isTarget: true },
        ],
      });
      const code = DataGenerator.buildPythonCode(config);

      expect(code).toContain('n_features=2');
    });
  });

  // ===========================================
  // generate() tests (async, mocked Pyodide)
  // ===========================================

  describe('generate', () => {
    it('throws when Pyodide is not ready', async () => {
      mockPyodideNotReady();

      await expect(DataGenerator.generate(makeConfig())).rejects.toThrow(
        'Pyodide ist nicht initialisiert',
      );
    });

    it('calls PyodideManager.runPython with generated code', async () => {
      mockPyodideReady();
      mockRunPythonSuccess({
        columns: ['Alter', 'Gehalt', 'Erfahrung', 'Churn'],
        rows: [{ Alter: 1, Gehalt: 2, Erfahrung: 3, Churn: 0 }],
        rowCount: 1,
      });

      await DataGenerator.generate(makeConfig());

      expect(mockRunPython).toHaveBeenCalledOnce();
      const code = mockRunPython.mock.calls[0][0] as string;
      expect(code).toContain('make_classification');
    });

    it('returns GeneratedDataset on success', async () => {
      mockPyodideReady();
      const mockResult = {
        columns: ['A', 'B', 'Target'],
        rows: [
          { A: 1.5, B: 2.3, Target: 1 },
          { A: -0.5, B: 0.1, Target: 0 },
        ],
        rowCount: 2,
      };
      mockRunPythonSuccess(mockResult);

      const config = makeConfig({
        features: makeFeatures(['A', 'B'], 'Target'),
      });
      const result = await DataGenerator.generate(config);

      expect(result.columns).toEqual(['A', 'B', 'Target']);
      expect(result.rows).toHaveLength(2);
      expect(result.rowCount).toBe(2);
      expect(result.description).toContain('Klassifikations-Datensatz');
    });

    it('includes correct description for regression', async () => {
      mockPyodideReady();
      mockRunPythonSuccess({
        columns: ['X', 'Y'],
        rows: [{ X: 1, Y: 2 }],
        rowCount: 1,
      });

      const result = await DataGenerator.generate(
        makeConfig({ type: 'regression', features: makeFeatures(['X'], 'Y') }),
      );
      expect(result.description).toContain('Regressions-Datensatz');
    });

    it('includes correct description for clustering', async () => {
      mockPyodideReady();
      mockRunPythonSuccess({
        columns: ['X', 'Y', 'Cluster'],
        rows: [{ X: 1, Y: 2, Cluster: 0 }],
        rowCount: 1,
      });

      const result = await DataGenerator.generate(
        makeConfig({ type: 'clustering', features: makeFeatures(['X', 'Y']) }),
      );
      expect(result.description).toContain('Clustering-Datensatz');
    });

    it('throws on Python execution error', async () => {
      mockPyodideReady();
      mockRunPythonError('NameError: name "foo" is not defined');

      await expect(DataGenerator.generate(makeConfig())).rejects.toThrow(
        'Datengenerierung fehlgeschlagen',
      );
    });

    it('throws on unexpected result format', async () => {
      mockPyodideReady();
      mockRunPython.mockResolvedValue({
        success: true,
        result: 'not an object',
        stdout: [],
        stderr: [],
      });

      await expect(DataGenerator.generate(makeConfig())).rejects.toThrow(
        'Unerwartetes Ergebnis',
      );
    });

    it('throws on null result', async () => {
      mockPyodideReady();
      mockRunPython.mockResolvedValue({
        success: true,
        result: null,
        stdout: [],
        stderr: [],
      });

      await expect(DataGenerator.generate(makeConfig())).rejects.toThrow(
        'Unerwartetes Ergebnis',
      );
    });
  });

  // ===========================================
  // getPreviewData tests
  // ===========================================

  describe('getPreviewData', () => {
    it('returns classification preview data', () => {
      const result = DataGenerator.getPreviewData('klassifikation');
      expect(result.columns).toContain('Churn');
      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rowCount).toBe(result.rows.length);
      expect(result.description).toContain('Churn');
    });

    it('returns regression preview data', () => {
      const result = DataGenerator.getPreviewData('regression');
      expect(result.columns).toContain('Preis');
      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.description).toContain('Immobilienpreis');
    });

    it('returns clustering preview data', () => {
      const result = DataGenerator.getPreviewData('clustering');
      expect(result.columns).toContain('Jahresumsatz');
      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.description).toContain('Kundensegmentierung');
    });

    it('returns empty dataset for unknown type', () => {
      const result = DataGenerator.getPreviewData('unknown' as ProjectType);
      expect(result.columns).toEqual([]);
      expect(result.rows).toEqual([]);
      expect(result.rowCount).toBe(0);
    });
  });
});
