import { describe, it, expect, beforeAll } from 'vitest';
import { WorkspaceExporter } from '../WorkspaceExporter';
import { WorkspaceProject, DEFAULT_CRISP_DM_PHASES } from '../../types';

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
  });
});
