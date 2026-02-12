import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  mockRunPython,
  mockPyodideReady,
  mockPyodideNotReady,
  mockRunPythonSuccess,
  mockRunPythonError,
} from '@/test/mocks/pyodideMock';

// Mock PyodideManager (async factory avoids hoisting issues)
vi.mock('../../pyodide/PyodideManager', async () => {
  const m = await import('@/test/mocks/pyodideMock');
  return m.pyodideMockFactory();
});

import { DataPreparator } from '../DataPreparator';
import type { StepExecutionResult } from '../DataPreparator';
import type {
  PipelineStep,
  PreparedDataSummary,
  MissingValuesConfig,
  OutlierRemovalConfig,
  EncodingConfig,
  ScalingConfig,
  FeatureSelectionConfig,
  TrainTestSplitConfig,
} from '../../types';

// --- Helpers ---

function makeMockSummary(overrides?: Partial<PreparedDataSummary>): PreparedDataSummary {
  return {
    rowCount: 100,
    columnCount: 5,
    columnNames: ['Alter', 'Gehalt', 'Erfahrung', 'Abteilung', 'Ziel'],
    numericColumns: ['Alter', 'Gehalt', 'Erfahrung'],
    categoricalColumns: ['Abteilung', 'Ziel'],
    missingValueCount: 0,
    trainRows: undefined,
    testRows: undefined,
    hasSplit: false,
    ...overrides,
  };
}

function makeMockStepResult(overrides?: Partial<StepExecutionResult>): StepExecutionResult {
  return {
    success: true,
    summary: '5 Zeilen entfernt',
    dataSummary: makeMockSummary({ rowCount: 95 }),
    preview: [{ Alter: 25, Gehalt: 50000 }],
    ...overrides,
  };
}

function makeStep(type: PipelineStep['type'], config: PipelineStep['config']): PipelineStep {
  return {
    id: 'step-1',
    type,
    label: 'Test Step',
    config,
    pythonCode: '',
  };
}

// --- Tests ---

describe('DataPreparator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================
  // buildMissingValuesCode
  // ===========================================

  describe('buildMissingValuesCode', () => {
    it('generates drop-rows code', () => {
      const code = DataPreparator.buildMissingValuesCode({
        strategy: 'drop-rows',
        columns: ['Alter', 'Gehalt'],
      });

      expect(code).toContain('df.dropna(subset=_cols)');
      expect(code).toContain('"Alter"');
      expect(code).toContain('"Gehalt"');
      expect(code).toContain('Zeilen mit fehlenden Werten entfernt');
    });

    it('generates drop-rows code for all affected columns when none specified', () => {
      const code = DataPreparator.buildMissingValuesCode({
        strategy: 'drop-rows',
        columns: [],
      });

      expect(code).toContain('df.columns[df.isnull().any()].tolist()');
    });

    it('generates fill-mean code', () => {
      const code = DataPreparator.buildMissingValuesCode({
        strategy: 'fill-mean',
        columns: ['Alter'],
      });

      expect(code).toContain('df[_c].fillna(df[_c].mean())');
      expect(code).toContain('Mittelwert gefüllt');
    });

    it('generates fill-median code', () => {
      const code = DataPreparator.buildMissingValuesCode({
        strategy: 'fill-median',
        columns: ['Gehalt'],
      });

      expect(code).toContain('df[_c].fillna(df[_c].median())');
      expect(code).toContain('Median gefüllt');
    });

    it('generates fill-mode code', () => {
      const code = DataPreparator.buildMissingValuesCode({
        strategy: 'fill-mode',
        columns: ['Abteilung'],
      });

      expect(code).toContain('df[_c].mode()');
      expect(code).toContain('häufigstem Wert gefüllt');
    });

    it('generates fill-constant code with custom value', () => {
      const code = DataPreparator.buildMissingValuesCode({
        strategy: 'fill-constant',
        columns: ['Name'],
        fillValue: 'Unbekannt',
      });

      expect(code).toContain('df[_cols].fillna("Unbekannt")');
      expect(code).toContain('Konstante gefüllt');
    });

    it('generates fill-constant code with empty value when none specified', () => {
      const code = DataPreparator.buildMissingValuesCode({
        strategy: 'fill-constant',
        columns: ['Name'],
      });

      expect(code).toContain('df[_cols].fillna("")');
    });
  });

  // ===========================================
  // buildOutlierRemovalCode
  // ===========================================

  describe('buildOutlierRemovalCode', () => {
    it('generates Z-Score code with threshold', () => {
      const code = DataPreparator.buildOutlierRemovalCode({
        method: 'zscore',
        threshold: 3,
        columns: ['Alter', 'Gehalt'],
      });

      expect(code).toContain('_threshold = 3');
      expect(code).toContain('df[_c].mean()');
      expect(code).toContain('df[_c].std()');
      expect(code).toContain('Ausreißer entfernt (Z-Score');
    });

    it('generates IQR code with custom factor', () => {
      const code = DataPreparator.buildOutlierRemovalCode({
        method: 'iqr',
        threshold: 1.5,
        columns: ['Gehalt'],
      });

      expect(code).toContain('_factor = 1.5');
      expect(code).toContain('quantile(0.25)');
      expect(code).toContain('quantile(0.75)');
      expect(code).toContain('_iqr = _q3 - _q1');
      expect(code).toContain('IQR-Faktor');
    });

    it('includes specified columns', () => {
      const code = DataPreparator.buildOutlierRemovalCode({
        method: 'zscore',
        threshold: 2,
        columns: ['A', 'B'],
      });

      expect(code).toContain('"A"');
      expect(code).toContain('"B"');
    });
  });

  // ===========================================
  // buildEncodingCode
  // ===========================================

  describe('buildEncodingCode', () => {
    it('generates One-Hot Encoding code', () => {
      const code = DataPreparator.buildEncodingCode({
        method: 'one-hot',
        columns: ['Abteilung'],
      });

      expect(code).toContain('pd.get_dummies');
      expect(code).toContain('drop_first=False');
      expect(code).toContain('One-Hot-Encoding');
    });

    it('generates One-Hot with dropFirst=True', () => {
      const code = DataPreparator.buildEncodingCode({
        method: 'one-hot',
        columns: ['Farbe'],
        dropFirst: true,
      });

      expect(code).toContain('drop_first=True');
    });

    it('generates Label Encoding code', () => {
      const code = DataPreparator.buildEncodingCode({
        method: 'label',
        columns: ['Abteilung', 'Geschlecht'],
      });

      expect(code).toContain('LabelEncoder');
      expect(code).toContain('fit_transform');
      expect(code).toContain('Label-Encoding');
    });
  });

  // ===========================================
  // buildScalingCode
  // ===========================================

  describe('buildScalingCode', () => {
    it('generates StandardScaler code', () => {
      const code = DataPreparator.buildScalingCode({
        method: 'standard',
        columns: ['Alter', 'Gehalt'],
      });

      expect(code).toContain('StandardScaler');
      expect(code).toContain('fit_transform');
      expect(code).toContain('"Alter"');
      expect(code).toContain('"Gehalt"');
    });

    it('generates MinMaxScaler code', () => {
      const code = DataPreparator.buildScalingCode({
        method: 'minmax',
        columns: ['Erfahrung'],
      });

      expect(code).toContain('MinMaxScaler');
      expect(code).toContain('fit_transform');
    });
  });

  // ===========================================
  // buildFeatureSelectionCode
  // ===========================================

  describe('buildFeatureSelectionCode', () => {
    it('generates drop-columns code', () => {
      const code = DataPreparator.buildFeatureSelectionCode({
        method: 'drop-columns',
        columns: ['ID', 'Name'],
      });

      expect(code).toContain('df.drop(columns=_cols)');
      expect(code).toContain('Spalte(n) entfernt');
    });

    it('generates keep-columns code', () => {
      const code = DataPreparator.buildFeatureSelectionCode({
        method: 'keep-columns',
        columns: ['Alter', 'Gehalt', 'Ziel'],
      });

      expect(code).toContain('df = df[_cols]');
      expect(code).toContain('behalten');
    });
  });

  // ===========================================
  // buildTrainTestSplitCode
  // ===========================================

  describe('buildTrainTestSplitCode', () => {
    it('generates train_test_split code with defaults', () => {
      const code = DataPreparator.buildTrainTestSplitCode({
        testSize: 0.2,
        randomState: 42,
      });

      expect(code).toContain('train_test_split');
      expect(code).toContain('test_size=0.2');
      expect(code).toContain('random_state=42');
      expect(code).toContain('df_train, df_test');
      expect(code).toContain('Train-Test-Split');
    });

    it('generates code with stratify parameter', () => {
      const code = DataPreparator.buildTrainTestSplitCode({
        testSize: 0.3,
        randomState: 123,
        stratify: 'Ziel',
      });

      expect(code).toContain('stratify=df["Ziel"]');
      expect(code).toContain('test_size=0.3');
      expect(code).toContain('random_state=123');
    });

    it('generates code without stratify when not specified', () => {
      const code = DataPreparator.buildTrainTestSplitCode({
        testSize: 0.2,
        randomState: 42,
      });

      expect(code).not.toContain('stratify');
    });
  });

  // ===========================================
  // buildStepCode (dispatch)
  // ===========================================

  describe('buildStepCode', () => {
    it('dispatches to missing-values builder', () => {
      const step = makeStep('missing-values', { strategy: 'drop-rows', columns: [] } as MissingValuesConfig);
      const code = DataPreparator.buildStepCode(step);
      expect(code).toContain('dropna');
    });

    it('dispatches to outlier-removal builder', () => {
      const step = makeStep('outlier-removal', { method: 'zscore', threshold: 3, columns: ['A'] } as OutlierRemovalConfig);
      const code = DataPreparator.buildStepCode(step);
      expect(code).toContain('_std');
    });

    it('dispatches to encoding builder', () => {
      const step = makeStep('encoding', { method: 'one-hot', columns: ['B'] } as EncodingConfig);
      const code = DataPreparator.buildStepCode(step);
      expect(code).toContain('get_dummies');
    });

    it('dispatches to scaling builder', () => {
      const step = makeStep('scaling', { method: 'standard', columns: ['C'] } as ScalingConfig);
      const code = DataPreparator.buildStepCode(step);
      expect(code).toContain('StandardScaler');
    });

    it('dispatches to feature-selection builder', () => {
      const step = makeStep('feature-selection', { method: 'drop-columns', columns: ['D'] } as FeatureSelectionConfig);
      const code = DataPreparator.buildStepCode(step);
      expect(code).toContain('df.drop');
    });

    it('dispatches to train-test-split builder', () => {
      const step = makeStep('train-test-split', { testSize: 0.2, randomState: 42 } as TrainTestSplitConfig);
      const code = DataPreparator.buildStepCode(step);
      expect(code).toContain('train_test_split');
    });

    it('throws on unknown step type', () => {
      const step = makeStep('unknown' as PipelineStep['type'], {} as MissingValuesConfig);
      expect(() => DataPreparator.buildStepCode(step)).toThrow('Unbekannter Step-Typ');
    });
  });

  // ===========================================
  // initializePipeline
  // ===========================================

  describe('initializePipeline', () => {
    it('throws when Pyodide is not ready', async () => {
      mockPyodideNotReady();
      await expect(DataPreparator.initializePipeline()).rejects.toThrow('Pyodide ist nicht initialisiert');
    });

    it('returns PreparedDataSummary on success', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeMockSummary());

      const result = await DataPreparator.initializePipeline();
      expect(result.rowCount).toBe(100);
      expect(result.columnCount).toBe(5);
      expect(result.columnNames).toHaveLength(5);
      expect(result.hasSplit).toBe(false);
    });

    it('sends code that backs up df as df_original', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeMockSummary());

      await DataPreparator.initializePipeline();

      const code = mockRunPython.mock.calls[0][0] as string;
      expect(code).toContain('df_original = df.copy()');
    });

    it('throws on Python error', async () => {
      mockPyodideReady();
      mockRunPythonError('NameError: name "df" is not defined');

      await expect(DataPreparator.initializePipeline()).rejects.toThrow('Pipeline-Initialisierung fehlgeschlagen');
    });

    it('throws on unexpected result format', async () => {
      mockPyodideReady();
      mockRunPythonSuccess('not an object');

      await expect(DataPreparator.initializePipeline()).rejects.toThrow('Unerwartetes Ergebnis');
    });
  });

  // ===========================================
  // applyStep
  // ===========================================

  describe('applyStep', () => {
    it('throws when Pyodide is not ready', async () => {
      mockPyodideNotReady();
      const step = makeStep('missing-values', { strategy: 'drop-rows', columns: [] } as MissingValuesConfig);
      await expect(DataPreparator.applyStep(step)).rejects.toThrow('Pyodide ist nicht initialisiert');
    });

    it('returns StepExecutionResult on success', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeMockStepResult());

      const step = makeStep('missing-values', { strategy: 'drop-rows', columns: ['Alter'] } as MissingValuesConfig);
      const result = await DataPreparator.applyStep(step);

      expect(result.success).toBe(true);
      expect(result.summary).toBe('5 Zeilen entfernt');
      expect(result.dataSummary.rowCount).toBe(95);
      expect(result.preview).toHaveLength(1);
    });

    it('returns error result on Python failure', async () => {
      mockPyodideReady();
      mockRunPythonError('KeyError: column not found');

      const step = makeStep('missing-values', { strategy: 'fill-mean', columns: ['X'] } as MissingValuesConfig);
      const result = await DataPreparator.applyStep(step);

      expect(result.success).toBe(false);
      expect(result.error).toContain('column not found');
    });

    it('sends step code + summary code to Pyodide', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeMockStepResult());

      const step = makeStep('scaling', { method: 'standard', columns: ['Alter'] } as ScalingConfig);
      await DataPreparator.applyStep(step);

      const code = mockRunPython.mock.calls[0][0] as string;
      expect(code).toContain('StandardScaler');
      expect(code).toContain('_result');
      expect(code).toContain('"success": True');
    });
  });

  // ===========================================
  // replayPipeline
  // ===========================================

  describe('replayPipeline', () => {
    it('throws when Pyodide is not ready', async () => {
      mockPyodideNotReady();
      await expect(DataPreparator.replayPipeline([])).rejects.toThrow('Pyodide ist nicht initialisiert');
    });

    it('resets df from df_original for empty pipeline', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeMockStepResult({ summary: 'Pipeline zurückgesetzt' }));

      const result = await DataPreparator.replayPipeline([]);

      const code = mockRunPython.mock.calls[0][0] as string;
      expect(code).toContain('df = df_original.copy()');
      expect(code).toContain('Pipeline zurückgesetzt');
      expect(result.success).toBe(true);
    });

    it('replays multiple steps sequentially', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeMockStepResult());

      const steps: PipelineStep[] = [
        makeStep('missing-values', { strategy: 'drop-rows', columns: [] } as MissingValuesConfig),
        makeStep('scaling', { method: 'standard', columns: ['Alter'] } as ScalingConfig),
      ];
      steps[1].id = 'step-2';

      await DataPreparator.replayPipeline(steps);

      const code = mockRunPython.mock.calls[0][0] as string;
      expect(code).toContain('df = df_original.copy()');
      expect(code).toContain('dropna');
      expect(code).toContain('StandardScaler');
    });

    it('returns error result on Python failure', async () => {
      mockPyodideReady();
      mockRunPythonError('replay error');

      const result = await DataPreparator.replayPipeline([]);

      expect(result.success).toBe(false);
      expect(result.error).toContain('replay error');
    });

    it('cleans up split variables on replay', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeMockStepResult());

      await DataPreparator.replayPipeline([]);

      const code = mockRunPython.mock.calls[0][0] as string;
      expect(code).toContain("if 'df_train' in dir(): del df_train");
      expect(code).toContain("if 'df_test' in dir(): del df_test");
    });
  });

  // ===========================================
  // getPreviewRows
  // ===========================================

  describe('getPreviewRows', () => {
    it('throws when Pyodide is not ready', async () => {
      mockPyodideNotReady();
      await expect(DataPreparator.getPreviewRows()).rejects.toThrow('Pyodide ist nicht initialisiert');
    });

    it('returns array of records on success', async () => {
      mockPyodideReady();
      const mockRows = [
        { Alter: 25, Gehalt: 50000, Abteilung: 'IT' },
        { Alter: 30, Gehalt: 60000, Abteilung: 'HR' },
      ];
      mockRunPythonSuccess(mockRows);

      const result = await DataPreparator.getPreviewRows();
      expect(result).toEqual(mockRows);
      expect(result).toHaveLength(2);
    });

    it('sends code with df.head(N) when rowCount is provided', async () => {
      mockPyodideReady();
      mockRunPythonSuccess([{ Alter: 25 }]);

      await DataPreparator.getPreviewRows(10);

      const code = mockRunPython.mock.calls[0][0] as string;
      expect(code).toContain('df.head(10)');
    });

    it('sends code without head() when no rowCount is provided', async () => {
      mockPyodideReady();
      mockRunPythonSuccess([{ Alter: 25 }]);

      await DataPreparator.getPreviewRows();

      const code = mockRunPython.mock.calls[0][0] as string;
      expect(code).not.toContain('head(');
    });

    it('throws on Python error', async () => {
      mockPyodideReady();
      mockRunPythonError('NameError: name "df" is not defined');

      await expect(DataPreparator.getPreviewRows()).rejects.toThrow('Vorschau-Daten konnten nicht geladen werden');
    });

    it('throws on unexpected result format', async () => {
      mockPyodideReady();
      mockRunPythonSuccess('not an array');

      await expect(DataPreparator.getPreviewRows()).rejects.toThrow('Unerwartetes Ergebnis');
    });
  });

  // ===========================================
  // getDataSummary
  // ===========================================

  describe('getDataSummary', () => {
    it('throws when Pyodide is not ready', async () => {
      mockPyodideNotReady();
      await expect(DataPreparator.getDataSummary()).rejects.toThrow('Pyodide ist nicht initialisiert');
    });

    it('returns PreparedDataSummary on success', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeMockSummary({ hasSplit: true, trainRows: 80, testRows: 20 }));

      const result = await DataPreparator.getDataSummary();

      expect(result.rowCount).toBe(100);
      expect(result.hasSplit).toBe(true);
      expect(result.trainRows).toBe(80);
      expect(result.testRows).toBe(20);
    });

    it('throws on Python error', async () => {
      mockPyodideReady();
      mockRunPythonError('NameError');

      await expect(DataPreparator.getDataSummary()).rejects.toThrow('Datenzusammenfassung fehlgeschlagen');
    });

    it('throws on unexpected result format', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(null);

      await expect(DataPreparator.getDataSummary()).rejects.toThrow('Unerwartetes Ergebnis');
    });
  });
});
