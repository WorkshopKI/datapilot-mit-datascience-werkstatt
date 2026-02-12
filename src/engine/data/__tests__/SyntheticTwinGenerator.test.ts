import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { SyntheticTwinConfig } from '../../types';
import {
  mockRunPython,
  mockLoadPackages,
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

// Import after mocking
import { SyntheticTwinGenerator } from '../SyntheticTwinGenerator';

// --- Helpers ---

function makeConfig(overrides?: Partial<SyntheticTwinConfig>): SyntheticTwinConfig {
  return {
    rowCount: 100,
    randomSeed: 42,
    preserveCorrelations: true,
    ...overrides,
  };
}

function makeSyntheticResult() {
  return {
    rows: [
      { Alter: 25, Gehalt: 3000, Kategorie: 'A' },
      { Alter: 30, Gehalt: 4000, Kategorie: 'B' },
    ],
    rowCount: 2,
    columnNames: ['Alter', 'Gehalt', 'Kategorie'],
    validation: {
      ksTests: {
        Alter: { statistic: 0.1, pValue: 0.85 },
        Gehalt: { statistic: 0.15, pValue: 0.72 },
      },
      correlationDeviation: 0.03,
      passed: true,
    },
  };
}

// --- Tests ---

describe('SyntheticTwinGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================
  // buildGenerationCode tests
  // ===========================================

  describe('buildGenerationCode', () => {
    it('contains Gaussian Copula (Cholesky) when preserveCorrelations=true', () => {
      const code = SyntheticTwinGenerator.buildGenerationCode(makeConfig({ preserveCorrelations: true }));

      expect(code).toContain('cholesky');
      expect(code).toContain('norm.cdf');
      expect(code).toContain('corr_matrix');
    });

    it('uses simple resampling when preserveCorrelations=false', () => {
      const code = SyntheticTwinGenerator.buildGenerationCode(makeConfig({ preserveCorrelations: false }));

      expect(code).not.toContain('cholesky');
      expect(code).not.toContain('norm.cdf');
      expect(code).toContain('rng.uniform');
    });

    it('uses the correct randomSeed', () => {
      const code = SyntheticTwinGenerator.buildGenerationCode(makeConfig({ randomSeed: 123 }));

      expect(code).toContain('default_rng(123)');
    });

    it('handles numeric columns with quantile mapping', () => {
      const code = SyntheticTwinGenerator.buildGenerationCode(makeConfig());

      expect(code).toContain('numeric_cols');
      expect(code).toContain('sorted_vals');
      expect(code).toContain('np.sort');
    });

    it('handles categorical columns with proportional resampling', () => {
      const code = SyntheticTwinGenerator.buildGenerationCode(makeConfig());

      expect(code).toContain('categorical_cols');
      expect(code).toContain('value_counts(normalize=True)');
      expect(code).toContain('rng.choice');
    });

    it('handles mixed columns (numeric + categorical)', () => {
      const code = SyntheticTwinGenerator.buildGenerationCode(makeConfig());

      expect(code).toContain('numeric_cols');
      expect(code).toContain('categorical_cols');
      expect(code).toContain('df_synthetic');
    });

    it('uses the correct rowCount', () => {
      const code = SyntheticTwinGenerator.buildGenerationCode(makeConfig({ rowCount: 500 }));

      expect(code).toContain('n_synthetic = 500');
    });

    it('includes KS-test validation', () => {
      const code = SyntheticTwinGenerator.buildGenerationCode(makeConfig());

      expect(code).toContain('ks_2samp');
      expect(code).toContain('ksTests');
      expect(code).toContain('pValue');
    });

    it('computes correlationDeviation', () => {
      const code = SyntheticTwinGenerator.buildGenerationCode(makeConfig());

      expect(code).toContain('correlationDeviation');
      expect(code).toContain('np.max(np.abs(corr_orig - corr_syn))');
    });

    it('single numeric column skips copula even with preserveCorrelations=true', () => {
      const code = SyntheticTwinGenerator.buildGenerationCode(makeConfig({ preserveCorrelations: true }));

      // When there's only 1 numeric column, it falls back to simple quantile mapping
      expect(code).toContain('if len(numeric_cols) > 1:');
      expect(code).toContain('else:');
    });
  });

  // ===========================================
  // buildValidationCode tests
  // ===========================================

  describe('buildValidationCode', () => {
    it('contains ks_2samp', () => {
      const code = SyntheticTwinGenerator.buildValidationCode();

      expect(code).toContain('ks_2samp');
    });

    it('computes correlationDeviation', () => {
      const code = SyntheticTwinGenerator.buildValidationCode();

      expect(code).toContain('correlationDeviation');
    });

    it('returns passed flag', () => {
      const code = SyntheticTwinGenerator.buildValidationCode();

      expect(code).toContain('"passed"');
    });
  });

  // ===========================================
  // generate() tests
  // ===========================================

  describe('generate', () => {
    it('throws when Pyodide is not ready', async () => {
      mockPyodideNotReady();

      await expect(SyntheticTwinGenerator.generate(makeConfig())).rejects.toThrow(
        'Pyodide ist nicht initialisiert'
      );
    });

    it('calls loadPackages for scipy', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeSyntheticResult());

      await SyntheticTwinGenerator.generate(makeConfig());

      expect(mockLoadPackages).toHaveBeenCalledWith(['scipy']);
    });

    it('returns correct rowCount', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeSyntheticResult());

      const result = await SyntheticTwinGenerator.generate(makeConfig());

      expect(result.rowCount).toBe(2);
    });

    it('returns all columnNames', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeSyntheticResult());

      const result = await SyntheticTwinGenerator.generate(makeConfig());

      expect(result.columnNames).toEqual(['Alter', 'Gehalt', 'Kategorie']);
    });

    it('returns validation with ksTests', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeSyntheticResult());

      const result = await SyntheticTwinGenerator.generate(makeConfig());

      expect(result.validation.ksTests).toHaveProperty('Alter');
      expect(result.validation.ksTests.Alter.statistic).toBe(0.1);
      expect(result.validation.ksTests.Alter.pValue).toBe(0.85);
    });

    it('returns error on Python failure', async () => {
      mockPyodideReady();
      mockRunPythonError('NameError: df not defined');

      await expect(SyntheticTwinGenerator.generate(makeConfig())).rejects.toThrow(
        'Synthetischer Zwilling fehlgeschlagen'
      );
    });

    it('returns complete SyntheticTwinData', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeSyntheticResult());

      const config = makeConfig();
      const result = await SyntheticTwinGenerator.generate(config);

      expect(result.rows).toHaveLength(2);
      expect(result.rowCount).toBe(2);
      expect(result.columnNames).toEqual(['Alter', 'Gehalt', 'Kategorie']);
      expect(result.generatedAt).toBeTruthy();
      expect(result.config).toEqual(config);
      expect(result.validation.passed).toBe(true);
      expect(result.validation.correlationDeviation).toBe(0.03);
    });

    it('throws on unexpected result format', async () => {
      mockPyodideReady();
      mockRunPython.mockResolvedValue({
        success: true,
        result: 'not an object',
        stdout: [],
        stderr: [],
      });

      await expect(SyntheticTwinGenerator.generate(makeConfig())).rejects.toThrow(
        'Unerwartetes Ergebnis'
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

      await expect(SyntheticTwinGenerator.generate(makeConfig())).rejects.toThrow(
        'Unerwartetes Ergebnis'
      );
    });

    it('sets generatedAt as ISO string', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeSyntheticResult());

      const result = await SyntheticTwinGenerator.generate(makeConfig());

      // Check ISO date format
      expect(new Date(result.generatedAt).toISOString()).toBe(result.generatedAt);
    });

    it('stores config in result', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeSyntheticResult());

      const config = makeConfig({ rowCount: 200, randomSeed: 99, preserveCorrelations: false });
      const result = await SyntheticTwinGenerator.generate(config);

      expect(result.config.rowCount).toBe(200);
      expect(result.config.randomSeed).toBe(99);
      expect(result.config.preserveCorrelations).toBe(false);
    });
  });

  // ===========================================
  // extractProfile() tests
  // ===========================================

  describe('extractProfile', () => {
    it('throws when Pyodide is not ready', async () => {
      mockPyodideNotReady();

      await expect(SyntheticTwinGenerator.extractProfile()).rejects.toThrow(
        'Pyodide ist nicht initialisiert'
      );
    });

    it('returns correct structure on success', async () => {
      mockPyodideReady();
      const profileResult = {
        numericColumns: ['Alter', 'Gehalt'],
        categoricalColumns: ['Kategorie'],
        rowCount: 100,
        correlationMatrix: [[1, 0.5], [0.5, 1]],
        columnProfiles: {
          Alter: { dtype: 'numeric', mean: 35, std: 10, min: 18, max: 65 },
          Gehalt: { dtype: 'numeric', mean: 4000, std: 1500, min: 1500, max: 8000 },
          Kategorie: { dtype: 'categorical', categories: ['A', 'B'], frequencies: [60, 40] },
        },
      };
      mockRunPythonSuccess(profileResult);

      const result = await SyntheticTwinGenerator.extractProfile();

      expect(result.numericColumns).toEqual(['Alter', 'Gehalt']);
      expect(result.categoricalColumns).toEqual(['Kategorie']);
      expect(result.rowCount).toBe(100);
      expect(result.correlationMatrix).toHaveLength(2);
      expect(result.columnProfiles.Alter.dtype).toBe('numeric');
    });

    it('returns error on Python failure', async () => {
      mockPyodideReady();
      mockRunPythonError('NameError: df is not defined');

      await expect(SyntheticTwinGenerator.extractProfile()).rejects.toThrow(
        'Profil-Extraktion fehlgeschlagen'
      );
    });

    it('includes correlation matrix only for multiple numeric columns', async () => {
      mockPyodideReady();
      const profileResult = {
        numericColumns: ['Alter'],
        categoricalColumns: [],
        rowCount: 50,
        correlationMatrix: [],
        columnProfiles: {
          Alter: { dtype: 'numeric', mean: 30, std: 5, min: 20, max: 40 },
        },
      };
      mockRunPythonSuccess(profileResult);

      const result = await SyntheticTwinGenerator.extractProfile();

      expect(result.correlationMatrix).toEqual([]);
    });
  });
});
