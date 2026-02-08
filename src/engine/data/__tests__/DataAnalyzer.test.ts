import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock PyodideManager before importing DataAnalyzer
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

// Import after mocking
import { DataAnalyzer } from '../DataAnalyzer';
import type { DataAnalysisResult } from '../DataAnalyzer';

// Access the mocks
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

function makeMockResult(overrides?: Partial<DataAnalysisResult>): DataAnalysisResult {
  return {
    rowCount: 3,
    columnCount: 3,
    columns: [
      { name: 'Alter', dtype: 'int64', count: 3, missing: 0, missingPercent: 0, unique: 3, mean: 40, std: 10, min: 25, max: 55, q25: 30, q50: 40, q75: 50 },
      { name: 'Gehalt', dtype: 'float64', count: 3, missing: 0, missingPercent: 0, unique: 3, mean: 50000, std: 10000, min: 35000, max: 65000, q25: 42000, q50: 50000, q75: 58000 },
      { name: 'Abteilung', dtype: 'object', count: 3, missing: 0, missingPercent: 0, unique: 2, topValue: 'IT', topFrequency: 2 },
    ],
    correlations: { Alter: { Alter: 1.0, Gehalt: 0.85 }, Gehalt: { Alter: 0.85, Gehalt: 1.0 } },
    preview: [
      { Alter: 25, Gehalt: 35000, Abteilung: 'IT' },
      { Alter: 40, Gehalt: 50000, Abteilung: 'HR' },
      { Alter: 55, Gehalt: 65000, Abteilung: 'IT' },
    ],
    columnNames: ['Alter', 'Gehalt', 'Abteilung'],
    numericColumns: ['Alter', 'Gehalt'],
    categoricalColumns: ['Abteilung'],
    ...overrides,
  };
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

describe('DataAnalyzer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================
  // buildAnalyzeCSVCode tests
  // ===========================================

  describe('buildAnalyzeCSVCode', () => {
    it('generates code that reads CSV from StringIO', () => {
      const code = DataAnalyzer.buildAnalyzeCSVCode('name,age\nAlice,30');

      expect(code).toContain('import pandas as pd');
      expect(code).toContain('from io import StringIO');
      expect(code).toContain('pd.read_csv(StringIO(csv_data))');
    });

    it('embeds CSV content into the Python code', () => {
      const csv = 'col1,col2\n1,2\n3,4';
      const code = DataAnalyzer.buildAnalyzeCSVCode(csv);

      expect(code).toContain('col1,col2');
      expect(code).toContain('1,2');
      expect(code).toContain('3,4');
    });

    it('escapes backslashes in CSV content', () => {
      const csv = 'path\nC:\\Users\\test';
      const code = DataAnalyzer.buildAnalyzeCSVCode(csv);

      expect(code).toContain('C:\\\\Users\\\\test');
    });

    it('generates analysis code for column statistics', () => {
      const code = DataAnalyzer.buildAnalyzeCSVCode('a,b\n1,2');

      expect(code).toContain('columns_info = []');
      expect(code).toContain('df[col].dtype');
      expect(code).toContain('df[col].count()');
      expect(code).toContain('df[col].isnull().sum()');
      expect(code).toContain('df[col].nunique()');
    });

    it('generates correlation computation', () => {
      const code = DataAnalyzer.buildAnalyzeCSVCode('a,b\n1,2');

      expect(code).toContain('select_dtypes(include=[\'number\'])');
      expect(code).toContain('.corr()');
      expect(code).toContain('corr_df.to_json()');
    });

    it('generates preview with head(10)', () => {
      const code = DataAnalyzer.buildAnalyzeCSVCode('a\n1');

      expect(code).toContain('df.head(10).to_json(orient="records")');
    });

    it('generates code that returns a complete result dict', () => {
      const code = DataAnalyzer.buildAnalyzeCSVCode('a\n1');

      expect(code).toContain('"rowCount": len(df)');
      expect(code).toContain('"columnCount": len(df.columns)');
      expect(code).toContain('"columns": columns_info');
      expect(code).toContain('"correlations": corr');
      expect(code).toContain('"preview": preview');
      expect(code).toContain('"columnNames": list(df.columns)');
      expect(code).toContain('"numericColumns": numeric_cols');
      expect(code).toContain('"categoricalColumns"');
    });
  });

  // ===========================================
  // buildAnalyzeDataFrameCode tests
  // ===========================================

  describe('buildAnalyzeDataFrameCode', () => {
    it('generates code that parses JSON into DataFrame', () => {
      const code = DataAnalyzer.buildAnalyzeDataFrameCode(
        '[{"a":1}]',
        ['a'],
      );

      expect(code).toContain('json.loads');
      expect(code).toContain('pd.DataFrame(data');
    });

    it('includes column names in DataFrame construction', () => {
      const code = DataAnalyzer.buildAnalyzeDataFrameCode(
        '[{"x":1,"y":2}]',
        ['x', 'y'],
      );

      expect(code).toContain('columns=["x","y"]');
    });

    it('escapes single quotes in JSON data', () => {
      const data = JSON.stringify([{ name: "it's a test" }]);
      const code = DataAnalyzer.buildAnalyzeDataFrameCode(data, ['name']);

      expect(code).toContain("\\'");
    });

    it('generates the same analysis code as CSV variant', () => {
      const csvCode = DataAnalyzer.buildAnalyzeCSVCode('a\n1');
      const dfCode = DataAnalyzer.buildAnalyzeDataFrameCode('[{"a":1}]', ['a']);

      // Both should contain the shared analysis code
      expect(csvCode).toContain('"rowCount": len(df)');
      expect(dfCode).toContain('"rowCount": len(df)');
      expect(csvCode).toContain('columns_info = []');
      expect(dfCode).toContain('columns_info = []');
    });
  });

  // ===========================================
  // analyzeCSV tests
  // ===========================================

  describe('analyzeCSV', () => {
    it('throws when Pyodide is not ready', async () => {
      mockPyodideNotReady();

      await expect(DataAnalyzer.analyzeCSV('a,b\n1,2')).rejects.toThrow(
        'Pyodide ist nicht initialisiert',
      );
    });

    it('throws on empty CSV content', async () => {
      mockPyodideReady();

      await expect(DataAnalyzer.analyzeCSV('')).rejects.toThrow(
        'CSV-Inhalt ist leer',
      );
    });

    it('throws on whitespace-only CSV content', async () => {
      mockPyodideReady();

      await expect(DataAnalyzer.analyzeCSV('   \n  ')).rejects.toThrow(
        'CSV-Inhalt ist leer',
      );
    });

    it('returns DataAnalysisResult on success', async () => {
      mockPyodideReady();
      const mockResult = makeMockResult();
      mockRunPythonSuccess(mockResult);

      const result = await DataAnalyzer.analyzeCSV('Alter,Gehalt,Abteilung\n25,35000,IT');

      expect(result.rowCount).toBe(3);
      expect(result.columnCount).toBe(3);
      expect(result.columns).toHaveLength(3);
      expect(result.numericColumns).toEqual(['Alter', 'Gehalt']);
      expect(result.categoricalColumns).toEqual(['Abteilung']);
    });

    it('calls PyodideManager.runPython with CSV code', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeMockResult());

      await DataAnalyzer.analyzeCSV('name,age\nAlice,30');

      expect(mockRunPython).toHaveBeenCalledOnce();
      const code = mockRunPython.mock.calls[0][0] as string;
      expect(code).toContain('pd.read_csv(StringIO(csv_data))');
      expect(code).toContain('name,age');
    });

    it('throws on Python execution error', async () => {
      mockPyodideReady();
      mockRunPythonError('ParserError: Error tokenizing data');

      await expect(DataAnalyzer.analyzeCSV('bad,csv\n')).rejects.toThrow(
        'Analyse fehlgeschlagen',
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

      await expect(DataAnalyzer.analyzeCSV('a\n1')).rejects.toThrow(
        'Unerwartetes Analyse-Ergebnis',
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

      await expect(DataAnalyzer.analyzeCSV('a\n1')).rejects.toThrow(
        'Unerwartetes Analyse-Ergebnis',
      );
    });

    it('passes through correlations correctly', async () => {
      mockPyodideReady();
      const mockResult = makeMockResult({
        correlations: { x: { x: 1.0, y: -0.5 }, y: { x: -0.5, y: 1.0 } },
      });
      mockRunPythonSuccess(mockResult);

      const result = await DataAnalyzer.analyzeCSV('x,y\n1,2');
      expect(result.correlations.x.y).toBe(-0.5);
      expect(result.correlations.y.x).toBe(-0.5);
    });

    it('handles preview with up to 10 rows', async () => {
      mockPyodideReady();
      const preview = Array.from({ length: 10 }, (_, i) => ({ a: i }));
      mockRunPythonSuccess(makeMockResult({ preview }));

      const result = await DataAnalyzer.analyzeCSV('a\n1');
      expect(result.preview).toHaveLength(10);
    });
  });

  // ===========================================
  // analyzeDataFrame tests
  // ===========================================

  describe('analyzeDataFrame', () => {
    it('throws when Pyodide is not ready', async () => {
      mockPyodideNotReady();

      await expect(
        DataAnalyzer.analyzeDataFrame([{ a: 1 }], ['a']),
      ).rejects.toThrow('Pyodide ist nicht initialisiert');
    });

    it('throws on empty rows', async () => {
      mockPyodideReady();

      await expect(
        DataAnalyzer.analyzeDataFrame([], ['a']),
      ).rejects.toThrow('Keine Daten vorhanden');
    });

    it('returns DataAnalysisResult on success', async () => {
      mockPyodideReady();
      const mockResult = makeMockResult();
      mockRunPythonSuccess(mockResult);

      const result = await DataAnalyzer.analyzeDataFrame(
        [{ Alter: 25, Gehalt: 35000 }],
        ['Alter', 'Gehalt'],
      );

      expect(result.rowCount).toBe(3);
      expect(result.columns).toHaveLength(3);
    });

    it('calls PyodideManager.runPython with DataFrame code', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeMockResult());

      await DataAnalyzer.analyzeDataFrame(
        [{ x: 1, y: 2 }],
        ['x', 'y'],
      );

      expect(mockRunPython).toHaveBeenCalledOnce();
      const code = mockRunPython.mock.calls[0][0] as string;
      expect(code).toContain('pd.DataFrame(data');
      expect(code).toContain('json.loads');
    });

    it('throws on Python execution error', async () => {
      mockPyodideReady();
      mockRunPythonError('ValueError: invalid data');

      await expect(
        DataAnalyzer.analyzeDataFrame([{ a: 1 }], ['a']),
      ).rejects.toThrow('Analyse fehlgeschlagen');
    });

    it('distinguishes numeric and categorical columns', async () => {
      mockPyodideReady();
      const mockResult = makeMockResult({
        numericColumns: ['Alter', 'Gehalt'],
        categoricalColumns: ['Abteilung'],
      });
      mockRunPythonSuccess(mockResult);

      const result = await DataAnalyzer.analyzeDataFrame(
        [{ Alter: 25, Gehalt: 35000, Abteilung: 'IT' }],
        ['Alter', 'Gehalt', 'Abteilung'],
      );

      expect(result.numericColumns).toContain('Alter');
      expect(result.numericColumns).toContain('Gehalt');
      expect(result.categoricalColumns).toContain('Abteilung');
    });

    it('handles empty correlations when no numeric columns', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeMockResult({
        correlations: {},
        numericColumns: [],
      }));

      const result = await DataAnalyzer.analyzeDataFrame(
        [{ name: 'Alice' }],
        ['name'],
      );

      expect(result.correlations).toEqual({});
    });
  });
});
