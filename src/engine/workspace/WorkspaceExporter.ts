// Export/Import functionality for DS Werkstatt projects
import { WorkspaceProject, ExportData } from '../types';
import { generateHash } from './hashUtils';

const EXPORT_VERSION = '1.0.0';

export class WorkspaceExporter {
  static async exportProject(project: WorkspaceProject): Promise<ExportData> {
    const exportData: ExportData = {
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      project,
    };

    // Generate hash for integrity check
    exportData.hash = await generateHash(JSON.stringify(project));

    return exportData;
  }

  static async exportToFile(project: WorkspaceProject): Promise<void> {
    const exportData = await this.exportProject(project);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static async importFromFile(file: File): Promise<WorkspaceProject> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const data: ExportData = JSON.parse(content);
          
          // Validate version
          if (!data.version || !data.project) {
            throw new Error('Ungültiges Dateiformat');
          }

          // Verify hash if present
          if (data.hash) {
            const expectedHash = await generateHash(JSON.stringify(data.project));
            if (expectedHash !== data.hash) {
              console.warn('Hash mismatch - Daten wurden möglicherweise verändert');
            }
          }

          // Generate new ID to avoid conflicts
          const importedProject: WorkspaceProject = {
            ...data.project,
            id: `imported-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          resolve(importedProject);
        } catch (error) {
          reject(new Error('Fehler beim Importieren der Datei'));
        }
      };

      reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'));
      reader.readAsText(file);
    });
  }
}
