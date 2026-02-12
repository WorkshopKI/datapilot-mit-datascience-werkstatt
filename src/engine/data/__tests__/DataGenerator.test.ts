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

    it('generates Titanic-specific code when features contain Pclass', () => {
      const config = makeConfig({
        rowCount: 891,
        features: [
          { id: 'f1', name: 'Pclass', type: 'kategorial', description: '' },
          { id: 'f2', name: 'Sex', type: 'kategorial', description: '' },
          { id: 'f3', name: 'Age', type: 'numerisch', description: '' },
          { id: 'f4', name: 'SibSp', type: 'numerisch', description: '' },
          { id: 'f5', name: 'Parch', type: 'numerisch', description: '' },
          { id: 'f6', name: 'Fare', type: 'numerisch', description: '' },
          { id: 'f7', name: 'Embarked', type: 'kategorial', description: '' },
          { id: 'f8', name: 'Survived', type: 'kategorial', description: '', isTarget: true },
        ],
      });
      // Pass a dummy CSV string (in generate(), this comes from fetch on main thread)
      const dummyCsv = 'PassengerId,Survived,Pclass\n1,0,3\n2,1,1';
      const code = DataGenerator.buildPythonCode(config, dummyCsv);

      expect(code).not.toContain('make_classification');
      expect(code).not.toContain('open_url');
      expect(code).toContain('base64.b64decode');
      expect(code).toContain('pd.read_csv(StringIO(csv_data))');
      expect(code).toContain('df.head(891)');
      expect(code).toContain('random_state=42');
    });

    it('generates Titanic code when features contain Survived', () => {
      const config = makeConfig({
        features: [
          { id: 'f1', name: 'Age', type: 'numerisch', description: '' },
          { id: 'f2', name: 'Survived', type: 'kategorial', description: '', isTarget: true },
        ],
      });
      const code = DataGenerator.buildPythonCode(config, 'col1\nval1');

      expect(code).toContain('base64.b64decode');
      expect(code).not.toContain('make_classification');
      expect(code).not.toContain('open_url');
    });

    it('generates Titanic code when features contain Embarked', () => {
      const config = makeConfig({
        features: [
          { id: 'f1', name: 'Age', type: 'numerisch', description: '' },
          { id: 'f2', name: 'Embarked', type: 'kategorial', description: '' },
          { id: 'f3', name: 'Target', type: 'kategorial', description: '', isTarget: true },
        ],
      });
      const code = DataGenerator.buildPythonCode(config, 'col1\nval1');

      expect(code).toContain('base64.b64decode');
      expect(code).not.toContain('open_url');
    });

    it('generates Iris-specific code when features contain Sepal', () => {
      const config = makeConfig({
        rowCount: 150,
        features: [
          { id: 'f1', name: 'SepalLength', type: 'numerisch', description: '' },
          { id: 'f2', name: 'SepalWidth', type: 'numerisch', description: '' },
          { id: 'f3', name: 'PetalLength', type: 'numerisch', description: '' },
          { id: 'f4', name: 'PetalWidth', type: 'numerisch', description: '' },
          { id: 'f5', name: 'Species', type: 'kategorial', description: '', isTarget: true },
        ],
      });
      const code = DataGenerator.buildPythonCode(config);

      expect(code).not.toContain('make_classification');
      expect(code).toContain('load_iris');
      expect(code).toContain("'SepalLength'");
      expect(code).toContain("'setosa'");
      expect(code).toContain('df.head(150)');
      expect(code).toContain('random_state=42');
    });

    it('generates Iris code when features contain Petal', () => {
      const config = makeConfig({
        features: [
          { id: 'f1', name: 'PetalLength', type: 'numerisch', description: '' },
          { id: 'f2', name: 'PetalWidth', type: 'numerisch', description: '' },
          { id: 'f3', name: 'Species', type: 'kategorial', description: '', isTarget: true },
        ],
      });
      const code = DataGenerator.buildPythonCode(config);

      expect(code).toContain('load_iris');
      expect(code).not.toContain('make_classification');
    });

    it('uses generic make_classification for non-Titanic/Iris features', () => {
      const config = makeConfig({
        features: makeFeatures(['Alter', 'Gehalt', 'Erfahrung'], 'Churn'),
      });
      const code = DataGenerator.buildPythonCode(config);

      expect(code).toContain('make_classification');
      expect(code).not.toContain('base64.b64decode');
      expect(code).not.toContain('load_iris');
    });

    it('uses custom seed for Titanic code', () => {
      const config = makeConfig({
        randomSeed: 99,
        features: [
          { id: 'f1', name: 'Pclass', type: 'kategorial', description: '' },
          { id: 'f2', name: 'Survived', type: 'kategorial', description: '', isTarget: true },
        ],
      });
      const code = DataGenerator.buildPythonCode(config, 'col1\nval1');

      expect(code).toContain('random_state=99');
    });

    it('uses custom seed for Iris code', () => {
      const config = makeConfig({
        randomSeed: 77,
        features: [
          { id: 'f1', name: 'SepalLength', type: 'numerisch', description: '' },
          { id: 'f2', name: 'Species', type: 'kategorial', description: '', isTarget: true },
        ],
      });
      const code = DataGenerator.buildPythonCode(config);

      expect(code).toContain('random_state=77');
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

    it('fetches Titanic CSV on main thread and embeds it in Python code', async () => {
      mockPyodideReady();
      const fakeCsv = 'PassengerId,Survived,Pclass\n1,0,3\n2,1,1';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(fakeCsv),
      }));

      mockRunPythonSuccess({
        columns: ['PassengerId', 'Survived', 'Pclass'],
        rows: [{ PassengerId: 1, Survived: 0, Pclass: 3 }],
        rowCount: 1,
      });

      const config = makeConfig({
        type: 'klassifikation',
        features: [
          { id: 'f1', name: 'Pclass', type: 'kategorial', description: '' },
          { id: 'f2', name: 'Survived', type: 'kategorial', description: '', isTarget: true },
        ],
      });

      await DataGenerator.generate(config);

      // Verify fetch was called for the CSV
      expect(fetch).toHaveBeenCalledWith('/data/titanic.csv');

      // Verify the Python code uses base64-encoded CSV, not open_url
      const code = mockRunPython.mock.calls[0][0] as string;
      expect(code).toContain('base64.b64decode');
      expect(code).toContain('pd.read_csv(StringIO(csv_data))');
      expect(code).not.toContain('open_url');

      vi.unstubAllGlobals();
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

  // ===========================================
  // hasRealDataset tests
  // ===========================================

  describe('detectDatasetId', () => {
    it('detects Titanic by Pclass', () => {
      const features = makeFeatures(['Age', 'Fare'], 'Survived');
      features.push({ id: '99', name: 'Pclass', type: 'kategorial', description: '' });
      expect(DataGenerator.detectDatasetId(features)).toBe('titanic');
    });

    it('detects Iris by Sepal features', () => {
      const features = makeFeatures(['SepalLength', 'SepalWidth']);
      expect(DataGenerator.detectDatasetId(features)).toBe('iris');
    });

    it('detects Kfz-Diebstahl by VERSUCH', () => {
      const features = makeFeatures(['TATZEIT_ANFANG_STUNDE', 'BEZIRK'], 'VERSUCH');
      expect(DataGenerator.detectDatasetId(features)).toBe('berlin-kfz-diebstahl');
    });

    it('detects Kfz-Diebstahl by EINDRINGEN_IN_KFZ', () => {
      const features = makeFeatures(['EINDRINGEN_IN_KFZ', 'ERLANGTES_GUT']);
      expect(DataGenerator.detectDatasetId(features)).toBe('berlin-kfz-diebstahl');
    });

    it('detects Kriminalitätsatlas by Straftaten_insgesamt', () => {
      const features = makeFeatures(['Straftaten_insgesamt', 'Raub', 'Brandstiftung']);
      expect(DataGenerator.detectDatasetId(features)).toBe('berlin-kriminalitaetsatlas');
    });

    it('detects Radzähldaten by Zaehlstelle + Anzahl', () => {
      const features: Feature[] = [
        { id: '1', name: 'Zaehlstelle', type: 'kategorial', description: '' },
        { id: '2', name: 'Ist_Wochenende', type: 'kategorial', description: '' },
        { id: '3', name: 'Anzahl', type: 'numerisch', description: '', isTarget: true },
      ];
      expect(DataGenerator.detectDatasetId(features)).toBe('berlin-radzaehldaten');
    });

    it('detects Abwasser by Viruslast', () => {
      const features = makeFeatures(['Temperatur', 'pH'], 'Viruslast_Influenza_A');
      expect(DataGenerator.detectDatasetId(features)).toBe('berlin-abwasser-viruslast');
    });

    it('detects Abwasser by Klaerwerk', () => {
      const features = makeFeatures(['Klaerwerk', 'Durchfluss', 'Temperatur']);
      expect(DataGenerator.detectDatasetId(features)).toBe('berlin-abwasser-viruslast');
    });

    it('returns undefined for generic features', () => {
      const features = makeFeatures(['Alter', 'Gehalt'], 'Churn');
      expect(DataGenerator.detectDatasetId(features)).toBeUndefined();
    });
  });

  describe('hasRealDataset', () => {
    it('returns true for Titanic features', () => {
      const features = [
        { id: 'f1', name: 'Pclass', type: 'kategorial' as const, description: '' },
        { id: 'f2', name: 'Age', type: 'numerisch' as const, description: '' },
        { id: 'f3', name: 'Survived', type: 'kategorial' as const, description: '', isTarget: true },
      ];
      expect(DataGenerator.hasRealDataset(features)).toBe(true);
    });

    it('returns true for Iris features', () => {
      const features = [
        { id: 'f1', name: 'SepalLength', type: 'numerisch' as const, description: '' },
        { id: 'f2', name: 'PetalWidth', type: 'numerisch' as const, description: '' },
        { id: 'f3', name: 'Species', type: 'kategorial' as const, description: '', isTarget: true },
      ];
      expect(DataGenerator.hasRealDataset(features)).toBe(true);
    });

    it('returns true for Berlin Kfz-Diebstahl features', () => {
      const features = makeFeatures(['TATZEIT_ANFANG_STUNDE', 'BEZIRK'], 'VERSUCH');
      expect(DataGenerator.hasRealDataset(features)).toBe(true);
    });

    it('returns false for generic features', () => {
      const features = makeFeatures(['Alter', 'Gehalt', 'Erfahrung'], 'Churn');
      expect(DataGenerator.hasRealDataset(features)).toBe(false);
    });
  });

  // ===========================================
  // getRealDatasetLabel tests
  // ===========================================

  describe('getRealDatasetLabel', () => {
    it('returns Titanic label for Titanic features', () => {
      const features = [
        { id: 'f1', name: 'Pclass', type: 'kategorial' as const, description: '' },
        { id: 'f2', name: 'Survived', type: 'kategorial' as const, description: '', isTarget: true },
      ];
      const label = DataGenerator.getRealDatasetLabel(features)!;
      expect(label).toContain('Titanic');
      expect(label).toContain('echte Daten');
    });

    it('returns Iris label for Iris features', () => {
      const features = [
        { id: 'f1', name: 'SepalLength', type: 'numerisch' as const, description: '' },
        { id: 'f2', name: 'Species', type: 'kategorial' as const, description: '', isTarget: true },
      ];
      const label = DataGenerator.getRealDatasetLabel(features)!;
      expect(label).toContain('Iris');
      expect(label).toContain('echte Daten');
    });

    it('returns label for Berlin Kfz-Diebstahl features', () => {
      const features = makeFeatures(['TATZEIT_ANFANG_STUNDE', 'BEZIRK', 'SCHADENSHOEHE'], 'VERSUCH');
      const label = DataGenerator.getRealDatasetLabel(features)!;
      expect(label).toContain('Kfz-Diebstahl');
      expect(label).toContain('echte Daten');
    });

    it('returns label for Berlin Kriminalitätsatlas features', () => {
      const features = makeFeatures(['Straftaten_insgesamt', 'Raub', 'Brandstiftung']);
      const label = DataGenerator.getRealDatasetLabel(features)!;
      expect(label).toContain('Kriminalitätsatlas');
      expect(label).toContain('echte Daten');
    });

    it('returns label for Berlin Radzähldaten features', () => {
      const features: Feature[] = [
        { id: '1', name: 'Zaehlstelle', type: 'kategorial', description: '' },
        { id: '2', name: 'Ist_Wochenende', type: 'kategorial', description: '' },
        { id: '3', name: 'Anzahl', type: 'numerisch', description: '', isTarget: true },
      ];
      const label = DataGenerator.getRealDatasetLabel(features)!;
      expect(label).toContain('Radzähldaten');
      expect(label).toContain('echte Daten');
    });

    it('returns label for Berlin Abwasser features', () => {
      const features = makeFeatures(['Durchfluss', 'Temperatur'], 'Viruslast_Influenza_A');
      const label = DataGenerator.getRealDatasetLabel(features)!;
      expect(label).toContain('Viruslast');
      expect(label).toContain('echte Daten');
    });

    it('returns undefined for generic features', () => {
      const features = makeFeatures(['Alter', 'Gehalt'], 'Churn');
      expect(DataGenerator.getRealDatasetLabel(features)).toBeUndefined();
    });
  });

  // ===========================================
  // generate() description for real datasets
  // ===========================================

  describe('generate description for real datasets', () => {
    it('returns real dataset description for Titanic features', async () => {
      mockPyodideReady();
      const fakeCsv = 'PassengerId,Survived,Pclass\n1,0,3\n2,1,1';
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(fakeCsv),
      }));
      mockRunPythonSuccess({
        columns: ['PassengerId', 'Survived', 'Pclass'],
        rows: [{ PassengerId: 1, Survived: 0, Pclass: 3 }],
        rowCount: 891,
      });

      const config = makeConfig({
        type: 'klassifikation',
        features: [
          { id: 'f1', name: 'Pclass', type: 'kategorial', description: '' },
          { id: 'f2', name: 'Survived', type: 'kategorial', description: '', isTarget: true },
        ],
      });

      const result = await DataGenerator.generate(config);
      expect(result.description).toContain('Titanic');
      expect(result.description).toContain('echte Daten');
      expect(result.description).toContain('891 Zeilen');

      vi.unstubAllGlobals();
    });

    it('returns real dataset description for Iris features', async () => {
      mockPyodideReady();
      mockRunPythonSuccess({
        columns: ['SepalLength', 'SepalWidth', 'PetalLength', 'PetalWidth', 'Species'],
        rows: [{ SepalLength: 5.1, SepalWidth: 3.5, PetalLength: 1.4, PetalWidth: 0.2, Species: 'setosa' }],
        rowCount: 150,
      });

      const config = makeConfig({
        type: 'klassifikation',
        features: [
          { id: 'f1', name: 'SepalLength', type: 'numerisch', description: '' },
          { id: 'f2', name: 'SepalWidth', type: 'numerisch', description: '' },
          { id: 'f3', name: 'PetalLength', type: 'numerisch', description: '' },
          { id: 'f4', name: 'PetalWidth', type: 'numerisch', description: '' },
          { id: 'f5', name: 'Species', type: 'kategorial', description: '', isTarget: true },
        ],
      });

      const result = await DataGenerator.generate(config);
      expect(result.description).toContain('Iris');
      expect(result.description).toContain('echte Daten');
      expect(result.description).toContain('150 Zeilen');
    });

    it('returns synthetic description for generic features', async () => {
      mockPyodideReady();
      mockRunPythonSuccess({
        columns: ['Alter', 'Gehalt', 'Erfahrung', 'Churn'],
        rows: [{ Alter: 1, Gehalt: 2, Erfahrung: 3, Churn: 0 }],
        rowCount: 100,
      });

      const result = await DataGenerator.generate(makeConfig());
      expect(result.description).toContain('Synthetischer Klassifikations-Datensatz');
      expect(result.description).not.toContain('echte Daten');
    });
  });

  // ===========================================
  // buildPythonCode with bundled CSV (generalized)
  // ===========================================

  describe('buildPythonCode with bundled CSV', () => {
    it('generates bundled CSV code for any dataset with csvContent', () => {
      const config = makeConfig({
        features: makeFeatures(['TATZEIT_ANFANG_STUNDE', 'BEZIRK'], 'VERSUCH'),
      });
      const csvContent = 'VERSUCH,BEZIRK,SCHADENSHOEHE\nNein,Mitte,500\nJa,Pankow,0';
      const code = DataGenerator.buildPythonCode(config, csvContent, 'berlin-kfz-diebstahl');

      expect(code).toContain('base64.b64decode');
      expect(code).toContain('pd.read_csv(StringIO(csv_data))');
      // CSV content is base64-encoded, verify the base64 string is present
      expect(code).toContain(btoa('VERSUCH,BEZIRK,SCHADENSHOEHE\nNein,Mitte,500\nJa,Pankow,0'));
      expect(code).not.toContain('make_classification');
      expect(code).not.toContain('load_iris');
    });

    it('generates Iris code without csvContent (uses sklearn)', () => {
      const config = makeConfig({
        features: [
          { id: 'f1', name: 'SepalLength', type: 'numerisch', description: '' },
          { id: 'f2', name: 'Species', type: 'kategorial', description: '', isTarget: true },
        ],
      });
      const code = DataGenerator.buildPythonCode(config, undefined, 'iris');

      expect(code).toContain('load_iris');
      expect(code).not.toContain('csv_data');
    });
  });
});
