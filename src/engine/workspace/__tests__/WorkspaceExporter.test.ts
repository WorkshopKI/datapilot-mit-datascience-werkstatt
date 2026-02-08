import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { WorkspaceExporter } from '../WorkspaceExporter';
import { WorkspaceProject, DEFAULT_CRISP_DM_PHASES } from '../../types';

// Mock SyntheticTwinGenerator to avoid Pyodide dependency
const mockGenerate = vi.fn();
vi.mock('../../data/SyntheticTwinGenerator', () => ({
  SyntheticTwinGenerator: {
    generate: (...args: unknown[]) => mockGenerate(...args),
  },
}));

// jsdom File does not have .text() – polyfill for tests
beforeAll(() => {
  if (!File.prototype.text) {
    File.prototype.text = function () {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(this);
      });
    };
  }
});

function createTestProject(): WorkspaceProject {
  return {
    id: 'test-123',
    name: 'Test Projekt',
    description: 'Ein Testprojekt',
    type: 'klassifikation',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    currentPhase: 'business-understanding',
    phases: DEFAULT_CRISP_DM_PHASES.map(p => ({ ...p })),
    features: [
      { id: 'f1', name: 'Alter', type: 'numerisch', description: 'Alter' },
    ],
  };
}

describe('WorkspaceExporter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('exportProject', () => {
    it('should produce valid ExportData', async () => {
      const project = createTestProject();
      const exported = await WorkspaceExporter.exportProject(project);

      expect(exported.version).toBe('1.0.0');
      expect(exported.exportedAt).toBeTruthy();
      expect(exported.project).toEqual(project);
      expect(exported.hash).toBeTruthy();
      expect(exported.exportMode).toBe('reference');
      expect(exported.encrypted).toBe(false);
    });

    it('should accept custom exportMode', async () => {
      const project = createTestProject();
      const exported = await WorkspaceExporter.exportProject(project, 'embedded');
      expect(exported.exportMode).toBe('embedded');
    });
  });

  describe('importFromFile', () => {
    it('should import a valid .datapilot file', async () => {
      const project = createTestProject();
      const exported = await WorkspaceExporter.exportProject(project);
      const json = JSON.stringify(exported);
      const file = new File([json], 'test.datapilot', { type: 'application/json' });

      const imported = await WorkspaceExporter.importFromFile(file);

      expect(imported.name).toBe('Test Projekt');
      expect(imported.id).toContain('imported-');
      expect(imported.id).not.toBe('test-123');
    });

    it('should reject invalid JSON', async () => {
      const file = new File(['not json {{{'], 'bad.datapilot');
      await expect(WorkspaceExporter.importFromFile(file)).rejects.toThrow('kein gültiges JSON');
    });

    it('should reject missing project data', async () => {
      const file = new File([JSON.stringify({ version: '1.0.0' })], 'bad.datapilot');
      await expect(WorkspaceExporter.importFromFile(file)).rejects.toThrow('Import fehlgeschlagen');
    });

    it('should reject unsupported version', async () => {
      const data = {
        version: '99.0.0',
        exportedAt: new Date().toISOString(),
        project: createTestProject(),
        exportMode: 'reference',
        encrypted: false,
      };
      const file = new File([JSON.stringify(data)], 'future.datapilot');
      await expect(WorkspaceExporter.importFromFile(file)).rejects.toThrow('wird nicht unterstützt');
    });
  });

  describe('validateFile', () => {
    it('should validate a correct file', async () => {
      const project = createTestProject();
      const exported = await WorkspaceExporter.exportProject(project);
      const file = new File([JSON.stringify(exported)], 'valid.datapilot');

      const result = await WorkspaceExporter.validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-JSON files', async () => {
      const file = new File(['hello world'], 'text.txt');
      const result = await WorkspaceExporter.validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should report missing required fields', async () => {
      const incomplete = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        project: { id: 'x', name: 'X' },
      };
      const file = new File([JSON.stringify(incomplete)], 'incomplete.datapilot');
      const result = await WorkspaceExporter.validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Pflichtfeld'))).toBe(true);
    });

    it('should warn when synthetic-twin mode has no syntheticData', async () => {
      const data = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        project: createTestProject(),
        exportMode: 'synthetic-twin',
        encrypted: false,
      };
      const file = new File([JSON.stringify(data)], 'no-twin.datapilot');
      const result = await WorkspaceExporter.validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.includes('synthetic-twin'))).toBe(true);
    });
  });

  describe('exportProject with synthetic-twin', () => {
    it('should call SyntheticTwinGenerator when exportMode is synthetic-twin', async () => {
      const syntheticData = {
        rows: [{ Alter: 25 }],
        rowCount: 1,
        columnNames: ['Alter'],
        generatedAt: new Date().toISOString(),
        config: { rowCount: 100, randomSeed: 42, preserveCorrelations: true },
        validation: { ksTests: {}, correlationDeviation: 0, passed: true },
      };
      mockGenerate.mockResolvedValue(syntheticData);

      const project = createTestProject();
      const exported = await WorkspaceExporter.exportProject(project, 'synthetic-twin');

      expect(mockGenerate).toHaveBeenCalledOnce();
      expect(exported.syntheticData).toEqual(syntheticData);
      expect(exported.exportMode).toBe('synthetic-twin');
    });

    it('should include syntheticData in the result', async () => {
      const syntheticData = {
        rows: [{ A: 1 }, { A: 2 }],
        rowCount: 2,
        columnNames: ['A'],
        generatedAt: new Date().toISOString(),
        config: { rowCount: 2, randomSeed: 42, preserveCorrelations: true },
        validation: { ksTests: { A: { statistic: 0.1, pValue: 0.9 } }, correlationDeviation: 0, passed: true },
      };
      mockGenerate.mockResolvedValue(syntheticData);

      const exported = await WorkspaceExporter.exportProject(createTestProject(), 'synthetic-twin');

      expect(exported.syntheticData).toBeDefined();
      expect(exported.syntheticData!.rows).toHaveLength(2);
      expect(exported.syntheticData!.validation.passed).toBe(true);
    });

    it('should not include syntheticData with reference mode', async () => {
      const project = createTestProject();
      const exported = await WorkspaceExporter.exportProject(project, 'reference');

      expect(mockGenerate).not.toHaveBeenCalled();
      expect(exported.syntheticData).toBeUndefined();
    });

    it('should produce valid ExportData structure with syntheticData', async () => {
      const syntheticData = {
        rows: [{ X: 1 }],
        rowCount: 1,
        columnNames: ['X'],
        generatedAt: new Date().toISOString(),
        config: { rowCount: 1, randomSeed: 42, preserveCorrelations: true },
        validation: { ksTests: {}, correlationDeviation: 0, passed: true },
      };
      mockGenerate.mockResolvedValue(syntheticData);

      const exported = await WorkspaceExporter.exportProject(createTestProject(), 'synthetic-twin');

      expect(exported.version).toBe('1.0.0');
      expect(exported.exportedAt).toBeTruthy();
      expect(exported.hash).toBeTruthy();
      expect(exported.exportMode).toBe('synthetic-twin');
      expect(exported.encrypted).toBe(false);
      expect(exported.syntheticData).toBeDefined();
    });

    it('should use default config when no syntheticTwinConfig provided', async () => {
      mockGenerate.mockResolvedValue({
        rows: [],
        rowCount: 0,
        columnNames: [],
        generatedAt: new Date().toISOString(),
        config: { rowCount: 100, randomSeed: 42, preserveCorrelations: true },
        validation: { ksTests: {}, correlationDeviation: 0, passed: true },
      });

      await WorkspaceExporter.exportProject(createTestProject(), 'synthetic-twin');

      const callArgs = mockGenerate.mock.calls[0][0];
      expect(callArgs.randomSeed).toBe(42);
      expect(callArgs.preserveCorrelations).toBe(true);
    });
  });
});
