import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock PyodideManager before importing ModelDeployer
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
    __mockRunPython: mockRunPython,
    __mockGetState: mockGetState,
  };
});

import { ModelDeployer } from '../ModelDeployer';
import type { PredictionResult } from '../ModelDeployer';
import type {
  WorkspaceProject,
  TrainedModel,
  PipelineStep,
  AlgorithmType,
  ProjectType,
} from '../../types';

const pyodideMock = await import('../../pyodide/PyodideManager');
const mockRunPython = (pyodideMock as Record<string, unknown>).__mockRunPython as ReturnType<typeof vi.fn>;
const mockGetState = (pyodideMock as Record<string, unknown>).__mockGetState as ReturnType<typeof vi.fn>;

// --- Helpers ---

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

function makeModel(overrides?: Partial<TrainedModel>): TrainedModel {
  return {
    id: 'model-1',
    algorithmType: 'random-forest-classifier',
    algorithmLabel: 'Random Forest (Klassifikation)',
    hyperparameters: { n_estimators: 100, max_depth: 10 },
    metrics: { accuracy: 0.85, f1Score: 0.84 },
    featureImportances: [
      { feature: 'Alter', importance: 0.6 },
      { feature: 'Gehalt', importance: 0.4 },
    ],
    trainedAt: '2026-01-01T00:00:00.000Z',
    trainingDurationMs: 1200,
    pythonCode: `from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score

X_train = df_train.drop(columns=["target"])
y_train = df_train["target"]
X_test = df_test.drop(columns=["target"])
y_test = df_test["target"]

model = RandomForestClassifier(n_estimators=100, max_depth=10)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred, average="weighted")`,
    targetColumn: 'target',
    ...overrides,
  };
}

function makeProject(overrides?: Partial<WorkspaceProject>): WorkspaceProject {
  return {
    id: 'proj-1',
    name: 'Testprojekt',
    description: 'Ein Testprojekt',
    type: 'klassifikation',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    currentPhase: 'deployment',
    phases: [],
    features: [],
    businessGoal: 'Kundenabwanderung vorhersagen',
    successCriteria: 'Accuracy > 80%',
    dataSource: 'csv',
    rowCount: 1000,
    pipelineSteps: [
      {
        id: 'step-1',
        type: 'missing-values',
        label: 'Fehlende Werte füllen',
        config: { strategy: 'fill-mean', columns: ['Alter'] },
        pythonCode: 'df["Alter"] = df["Alter"].fillna(df["Alter"].mean())',
      } as PipelineStep,
      {
        id: 'step-2',
        type: 'train-test-split',
        label: 'Train-Test-Split',
        config: { testSize: 0.2, randomState: 42 },
        pythonCode: 'df_train, df_test = train_test_split(df, test_size=0.2, random_state=42)',
      } as PipelineStep,
    ],
    trainedModels: [makeModel()],
    selectedModelId: 'model-1',
    targetColumn: 'target',
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ============================================================
// Prediction Tests
// ============================================================

describe('ModelDeployer.predict', () => {
  it('throws when Pyodide is not ready', async () => {
    mockPyodideNotReady();

    await expect(
      ModelDeployer.predict({ Alter: 30, Gehalt: 50000 }, 'target', 'klassifikation'),
    ).rejects.toThrow('Pyodide ist nicht initialisiert');
  });

  it('returns prediction for classification', async () => {
    mockPyodideReady();
    mockRunPythonSuccess({ prediction: '1' });

    const result = await ModelDeployer.predict(
      { Alter: 30, Gehalt: 50000 },
      'target',
      'klassifikation',
    );

    expect(result.success).toBe(true);
    expect(result.prediction).toBe('1');
  });

  it('returns prediction with probabilities for classification', async () => {
    mockPyodideReady();
    mockRunPythonSuccess({
      prediction: '1',
      probabilities: { '0': 0.3, '1': 0.7 },
    });

    const result = await ModelDeployer.predict(
      { Alter: 30, Gehalt: 50000 },
      'target',
      'klassifikation',
    );

    expect(result.success).toBe(true);
    expect(result.probabilities).toEqual({ '0': 0.3, '1': 0.7 });
  });

  it('returns prediction for regression', async () => {
    mockPyodideReady();
    mockRunPythonSuccess({ prediction: 42.5 });

    const result = await ModelDeployer.predict(
      { Alter: 30, Gehalt: 50000 },
      'target',
      'regression',
    );

    expect(result.success).toBe(true);
    expect(result.prediction).toBe(42.5);
  });

  it('returns prediction for clustering', async () => {
    mockPyodideReady();
    mockRunPythonSuccess({ prediction: 2, clusterLabel: 2 });

    const result = await ModelDeployer.predict(
      { Alter: 30, Gehalt: 50000 },
      '',
      'clustering',
    );

    expect(result.success).toBe(true);
    expect(result.prediction).toBe(2);
    expect(result.clusterLabel).toBe(2);
  });

  it('returns error on Python failure', async () => {
    mockPyodideReady();
    mockRunPythonError('NameError: name X_train is not defined');

    const result = await ModelDeployer.predict(
      { Alter: 30, Gehalt: 50000 },
      'target',
      'klassifikation',
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('NameError');
  });

  it('returns error on unexpected result shape', async () => {
    mockPyodideReady();
    mockRunPythonSuccess(null);

    const result = await ModelDeployer.predict(
      { Alter: 30, Gehalt: 50000 },
      'target',
      'klassifikation',
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unerwartetes Ergebnis');
  });

  it('calls runPython with the correct code', async () => {
    mockPyodideReady();
    mockRunPythonSuccess({ prediction: '1' });

    await ModelDeployer.predict(
      { Alter: 30, Gehalt: 50000 },
      'target',
      'klassifikation',
    );

    expect(mockRunPython).toHaveBeenCalledTimes(1);
    const code = mockRunPython.mock.calls[0][0] as string;
    expect(code).toContain('"Alter": 30');
    expect(code).toContain('"Gehalt": 50000');
    expect(code).toContain('X_train.columns');
  });
});

// ============================================================
// Prediction Code Builder Tests
// ============================================================

describe('ModelDeployer.buildPredictionCode', () => {
  it('builds correct input dict for numeric values', () => {
    const code = ModelDeployer.buildPredictionCode(
      { Alter: 30, Gehalt: 50000 },
      'target',
      'klassifikation',
    );

    expect(code).toContain('"Alter": 30');
    expect(code).toContain('"Gehalt": 50000');
  });

  it('builds correct input dict for string values', () => {
    const code = ModelDeployer.buildPredictionCode(
      { Stadt: 'Berlin' },
      'target',
      'klassifikation',
    );

    expect(code).toContain('"Stadt": "Berlin"');
  });

  it('uses X_train.columns for supervised models', () => {
    const code = ModelDeployer.buildPredictionCode(
      { Alter: 30 },
      'target',
      'klassifikation',
    );

    expect(code).toContain('X_train.columns');
  });

  it('uses df.columns for clustering', () => {
    const code = ModelDeployer.buildPredictionCode(
      { Alter: 30 },
      '',
      'clustering',
    );

    expect(code).toContain('df.columns');
    expect(code).not.toContain('X_train');
  });

  it('includes predict_proba for classification', () => {
    const code = ModelDeployer.buildPredictionCode(
      { Alter: 30 },
      'target',
      'klassifikation',
    );

    expect(code).toContain('predict_proba');
  });

  it('includes clusterLabel for clustering', () => {
    const code = ModelDeployer.buildPredictionCode(
      { Alter: 30 },
      '',
      'clustering',
    );

    expect(code).toContain('clusterLabel');
  });

  it('includes auto-encoding with get_dummies for supervised prediction', () => {
    const code = ModelDeployer.buildPredictionCode(
      { Alter: 30, Sex: 'male' },
      'Survived',
      'klassifikation',
    );

    expect(code).toContain('_non_numeric_pred');
    expect(code).toContain('get_dummies(_df_input');
    expect(code).toContain('reindex(columns=X_train.columns, fill_value=0)');
  });

  it('includes auto-encoding with get_dummies for clustering prediction', () => {
    const code = ModelDeployer.buildPredictionCode(
      { Alter: 30, Farbe: 'rot' },
      '',
      'clustering',
    );

    expect(code).toContain('_non_numeric_pred');
    expect(code).toContain('get_dummies(_df_input');
    expect(code).toContain('reindex(columns=df.columns, fill_value=0)');
  });
});

// ============================================================
// Python Script Export Tests
// ============================================================

describe('ModelDeployer.buildPythonScript', () => {
  it('contains project name as comment', () => {
    const project = makeProject();
    const model = makeModel();
    const script = ModelDeployer.buildPythonScript(project, model);

    expect(script).toContain('# Testprojekt');
  });

  it('contains import statements', () => {
    const project = makeProject();
    const model = makeModel();
    const script = ModelDeployer.buildPythonScript(project, model);

    expect(script).toContain('import pandas as pd');
    expect(script).toContain('import numpy as np');
  });

  it('contains data loading placeholder', () => {
    const project = makeProject();
    const model = makeModel();
    const script = ModelDeployer.buildPythonScript(project, model);

    expect(script).toContain('pd.read_csv("daten.csv")');
  });

  it('contains pipeline steps', () => {
    const project = makeProject();
    const model = makeModel();
    const script = ModelDeployer.buildPythonScript(project, model);

    expect(script).toContain('Fehlende Werte füllen');
    expect(script).toContain('Train-Test-Split');
  });

  it('contains training code', () => {
    const project = makeProject();
    const model = makeModel();
    const script = ModelDeployer.buildPythonScript(project, model);

    expect(script).toContain('RandomForestClassifier');
  });

  it('contains prediction function for supervised models', () => {
    const project = makeProject();
    const model = makeModel();
    const script = ModelDeployer.buildPythonScript(project, model);

    expect(script).toContain('def predict(');
    expect(script).toContain('predict_proba');
  });

  it('omits prediction function for clustering', () => {
    const project = makeProject({ type: 'clustering' });
    const model = makeModel({ algorithmType: 'kmeans', algorithmLabel: 'K-Means' });
    const script = ModelDeployer.buildPythonScript(project, model);

    expect(script).not.toContain('def predict(');
  });

  it('handles empty pipeline', () => {
    const project = makeProject({ pipelineSteps: [] });
    const model = makeModel();
    const script = ModelDeployer.buildPythonScript(project, model);

    expect(script).not.toContain('Datenvorbereitung');
    expect(script).toContain('RandomForestClassifier');
  });

  it('contains project type label', () => {
    const project = makeProject();
    const model = makeModel();
    const script = ModelDeployer.buildPythonScript(project, model);

    expect(script).toContain('Klassifikation');
  });

  it('contains business goal if set', () => {
    const project = makeProject({ businessGoal: 'Kundenabwanderung vorhersagen' });
    const model = makeModel();
    const script = ModelDeployer.buildPythonScript(project, model);

    expect(script).toContain('Kundenabwanderung vorhersagen');
  });

  it('handles missing business goal gracefully', () => {
    const project = makeProject({ businessGoal: undefined });
    const model = makeModel();
    const script = ModelDeployer.buildPythonScript(project, model);

    // Should not crash
    expect(script).toContain('Testprojekt');
  });
});

// ============================================================
// Notebook Export Tests
// ============================================================

describe('ModelDeployer.buildNotebook', () => {
  it('produces valid JSON', () => {
    const project = makeProject();
    const model = makeModel();
    const nbStr = ModelDeployer.buildNotebook(project, model);

    expect(() => JSON.parse(nbStr)).not.toThrow();
  });

  it('has nbformat 4', () => {
    const project = makeProject();
    const model = makeModel();
    const nb = JSON.parse(ModelDeployer.buildNotebook(project, model));

    expect(nb.nbformat).toBe(4);
    expect(nb.nbformat_minor).toBe(5);
  });

  it('has correct metadata with kernelspec', () => {
    const project = makeProject();
    const model = makeModel();
    const nb = JSON.parse(ModelDeployer.buildNotebook(project, model));

    expect(nb.metadata.kernelspec.display_name).toBe('Python 3');
    expect(nb.metadata.kernelspec.language).toBe('python');
    expect(nb.metadata.language_info.name).toBe('python');
  });

  it('contains project title in first cell', () => {
    const project = makeProject();
    const model = makeModel();
    const nb = JSON.parse(ModelDeployer.buildNotebook(project, model));

    const firstCell = nb.cells[0];
    expect(firstCell.cell_type).toBe('markdown');
    expect(firstCell.source.join('')).toContain('Testprojekt');
  });

  it('has alternating markdown and code cells', () => {
    const project = makeProject();
    const model = makeModel();
    const nb = JSON.parse(ModelDeployer.buildNotebook(project, model));

    // First cell is markdown (title), then code (imports), then markdown, etc.
    expect(nb.cells[0].cell_type).toBe('markdown');
    expect(nb.cells[1].cell_type).toBe('code');
    expect(nb.cells[2].cell_type).toBe('markdown');
    expect(nb.cells[3].cell_type).toBe('code');
  });

  it('contains pipeline code when steps exist', () => {
    const project = makeProject();
    const model = makeModel();
    const nb = JSON.parse(ModelDeployer.buildNotebook(project, model));

    const allSource = nb.cells.map((c: { source: string[] }) => c.source.join('')).join('\n');
    expect(allSource).toContain('Datenvorbereitung');
    expect(allSource).toContain('Fehlende Werte füllen');
  });

  it('contains training code', () => {
    const project = makeProject();
    const model = makeModel();
    const nb = JSON.parse(ModelDeployer.buildNotebook(project, model));

    const allSource = nb.cells.map((c: { source: string[] }) => c.source.join('')).join('\n');
    expect(allSource).toContain('RandomForestClassifier');
  });

  it('contains prediction cell for supervised models', () => {
    const project = makeProject();
    const model = makeModel();
    const nb = JSON.parse(ModelDeployer.buildNotebook(project, model));

    const allSource = nb.cells.map((c: { source: string[] }) => c.source.join('')).join('\n');
    expect(allSource).toContain('def predict(');
  });

  it('omits prediction cell for clustering', () => {
    const project = makeProject({ type: 'clustering' });
    const model = makeModel({ algorithmType: 'kmeans' });
    const nb = JSON.parse(ModelDeployer.buildNotebook(project, model));

    const allSource = nb.cells.map((c: { source: string[] }) => c.source.join('')).join('\n');
    expect(allSource).not.toContain('def predict(');
  });

  it('has correct number of cells with pipeline', () => {
    const project = makeProject(); // has pipeline steps
    const model = makeModel();
    const nb = JSON.parse(ModelDeployer.buildNotebook(project, model));

    // title, imports, data-md, data-code, prep-md, prep-code, model-md, model-code, pred-md, pred-code
    expect(nb.cells.length).toBe(10);
  });

  it('has correct number of cells without pipeline', () => {
    const project = makeProject({ pipelineSteps: [] });
    const model = makeModel();
    const nb = JSON.parse(ModelDeployer.buildNotebook(project, model));

    // title, imports, data-md, data-code, model-md, model-code, pred-md, pred-code
    expect(nb.cells.length).toBe(8);
  });
});

// ============================================================
// Download Tests
// ============================================================

describe('ModelDeployer.downloadFile', () => {
  let createObjectURLMock: ReturnType<typeof vi.fn>;
  let revokeObjectURLMock: ReturnType<typeof vi.fn>;
  let clickSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    createObjectURLMock = vi.fn().mockReturnValue('blob:test-url');
    revokeObjectURLMock = vi.fn();
    clickSpy = vi.fn();

    globalThis.URL.createObjectURL = createObjectURLMock;
    globalThis.URL.revokeObjectURL = revokeObjectURLMock;

    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: clickSpy,
      style: {},
    } as unknown as HTMLAnchorElement);

    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a Blob with correct content and MIME type', () => {
    ModelDeployer.downloadFile('test content', 'test.py', 'text/x-python');

    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    const blob = createObjectURLMock.mock.calls[0][0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('text/x-python');
  });

  it('triggers a download click', () => {
    ModelDeployer.downloadFile('test content', 'test.py', 'text/x-python');

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('revokes the object URL after download', () => {
    ModelDeployer.downloadFile('test content', 'test.py', 'text/x-python');

    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:test-url');
  });

  it('sets the correct filename', () => {
    const mockAnchor = {
      href: '',
      download: '',
      click: clickSpy,
      style: {},
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLAnchorElement);

    ModelDeployer.downloadFile('content', 'notebook.ipynb', 'application/json');

    expect(mockAnchor.download).toBe('notebook.ipynb');
  });
});

// ============================================================
// Integration / Edge Case Tests
// ============================================================

describe('ModelDeployer integration', () => {
  it('prediction input is correctly serialized with mixed types', async () => {
    mockPyodideReady();
    mockRunPythonSuccess({ prediction: '1' });

    await ModelDeployer.predict(
      { Alter: 30, Stadt: 'Berlin', Score: 0.85 },
      'target',
      'klassifikation',
    );

    const code = mockRunPython.mock.calls[0][0] as string;
    expect(code).toContain('"Alter": 30');
    expect(code).toContain('"Stadt": "Berlin"');
    expect(code).toContain('"Score": 0.85');
  });

  it('script contains algorithm label', () => {
    const project = makeProject();
    const model = makeModel();
    const script = ModelDeployer.buildPythonScript(project, model);

    expect(script).toContain('Random Forest (Klassifikation)');
  });

  it('notebook contains algorithm label in title', () => {
    const project = makeProject();
    const model = makeModel();
    const nb = JSON.parse(ModelDeployer.buildNotebook(project, model));
    const titleSource = nb.cells[0].source.join('');

    expect(titleSource).toContain('Random Forest (Klassifikation)');
  });

  it('handles project with no trainedModels gracefully in script export', () => {
    const project = makeProject({ trainedModels: [] });
    const model = makeModel();

    // Should not throw
    const script = ModelDeployer.buildPythonScript(project, model);
    expect(script).toContain('Testprojekt');
  });

  it('regression script contains correct project type', () => {
    const project = makeProject({ type: 'regression' });
    const model = makeModel({
      algorithmType: 'linear-regression',
      algorithmLabel: 'Linear Regression',
    });
    const script = ModelDeployer.buildPythonScript(project, model);

    expect(script).toContain('Regression');
  });
});
