// Export/Import functionality for DS Werkstatt projects
// Produces .mltutor files (JSON) with versioning, integrity hashing, and validation.

import { WorkspaceProject, ExportData, ExportMode } from '../types';
import { generateHash, verifyHash } from './hashUtils';

const EXPORT_VERSION = '1.0.0';

/** Supported export versions for import compatibility */
const SUPPORTED_VERSIONS = ['1.0.0'];

/** Result of an import validation */
export interface ImportValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

/**
 * Validate the structure of an imported ExportData object.
 * Checks version compatibility, required fields, and data integrity.
 */
function validateExportData(data: unknown): ImportValidationResult {
  const result: ImportValidationResult = { valid: true, warnings: [], errors: [] };

  if (typeof data !== 'object' || data === null) {
    result.valid = false;
    result.errors.push('Datei enthält kein gültiges JSON-Objekt.');
    return result;
  }

  const obj = data as Record<string, unknown>;

  // Version check
  if (typeof obj.version !== 'string') {
    result.valid = false;
    result.errors.push('Fehlende oder ungültige Versionsnummer.');
    return result;
  }

  if (!SUPPORTED_VERSIONS.includes(obj.version)) {
    result.valid = false;
    result.errors.push(
      `Version "${obj.version}" wird nicht unterstützt. Unterstützte Versionen: ${SUPPORTED_VERSIONS.join(', ')}.`
    );
    return result;
  }

  // exportedAt check
  if (typeof obj.exportedAt !== 'string') {
    result.warnings.push('Fehlender Exportzeitpunkt.');
  }

  // Project check
  if (typeof obj.project !== 'object' || obj.project === null) {
    result.valid = false;
    result.errors.push('Fehlende Projektdaten.');
    return result;
  }

  const project = obj.project as Record<string, unknown>;

  // Required project fields
  const requiredFields = ['id', 'name', 'type', 'currentPhase', 'phases', 'features'] as const;
  for (const field of requiredFields) {
    if (project[field] === undefined || project[field] === null) {
      result.valid = false;
      result.errors.push(`Pflichtfeld "${field}" fehlt in den Projektdaten.`);
    }
  }

  // Validate phases is an array
  if (!Array.isArray(project.phases)) {
    result.valid = false;
    result.errors.push('Phasen-Daten sind kein Array.');
  } else if (project.phases.length !== 6) {
    result.warnings.push(`Erwartete 6 CRISP-DM-Phasen, aber ${project.phases.length} gefunden.`);
  }

  // Validate features is an array
  if (!Array.isArray(project.features)) {
    result.valid = false;
    result.errors.push('Features-Daten sind kein Array.');
  }

  // exportMode check
  if (obj.exportMode !== undefined) {
    const validModes: ExportMode[] = ['reference', 'embedded', 'synthetic-twin'];
    if (!validModes.includes(obj.exportMode as ExportMode)) {
      result.warnings.push(`Unbekannter Export-Modus: "${obj.exportMode}".`);
    }
  }

  return result;
}

export class WorkspaceExporter {
  /**
   * Export a project to an ExportData object with integrity hash.
   */
  static async exportProject(
    project: WorkspaceProject,
    exportMode: ExportMode = 'reference'
  ): Promise<ExportData> {
    const exportData: ExportData = {
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      project,
      exportMode,
      encrypted: false,
    };

    // Generate integrity hash over the project data
    exportData.hash = await generateHash(JSON.stringify(project));

    return exportData;
  }

  /**
   * Export a project and trigger a .mltutor file download.
   */
  static async exportToFile(
    project: WorkspaceProject,
    exportMode: ExportMode = 'reference'
  ): Promise<void> {
    const exportData = await this.exportProject(project, exportMode);
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const sanitizedName = project.name
      .replace(/[^a-zA-Z0-9äöüÄÖÜß\-_\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 60);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizedName}.mltutor`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Import a project from a .mltutor (or .json) file.
   * Validates structure, version, and integrity hash.
   * Returns the imported project with a fresh ID.
   *
   * @throws Error with a German message if validation fails.
   */
  static async importFromFile(file: File): Promise<WorkspaceProject> {
    const content = await file.text();

    let data: unknown;
    try {
      data = JSON.parse(content);
    } catch {
      throw new Error('Die Datei enthält kein gültiges JSON.');
    }

    // Validate structure
    const validation = validateExportData(data);
    if (!validation.valid) {
      throw new Error(
        `Import fehlgeschlagen:\n${validation.errors.join('\n')}`
      );
    }

    if (validation.warnings.length > 0) {
      console.warn('[WorkspaceExporter] Import-Warnungen:', validation.warnings);
    }

    const exportData = data as ExportData;

    // Verify integrity hash if present
    if (exportData.hash) {
      const isIntact = await verifyHash(
        JSON.stringify(exportData.project),
        exportData.hash
      );
      if (!isIntact) {
        console.warn(
          '[WorkspaceExporter] Hash-Prüfung fehlgeschlagen – Daten wurden möglicherweise verändert.'
        );
      }
    }

    // Generate new ID to avoid conflicts
    const importedProject: WorkspaceProject = {
      ...exportData.project,
      id: `imported-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };

    return importedProject;
  }

  /**
   * Validate a file without importing it.
   * Useful for previewing whether an import will succeed.
   */
  static async validateFile(file: File): Promise<ImportValidationResult> {
    let content: string;
    try {
      content = await file.text();
    } catch {
      return { valid: false, warnings: [], errors: ['Datei konnte nicht gelesen werden.'] };
    }

    let data: unknown;
    try {
      data = JSON.parse(content);
    } catch {
      return { valid: false, warnings: [], errors: ['Die Datei enthält kein gültiges JSON.'] };
    }

    return validateExportData(data);
  }
}
