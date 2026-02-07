// DS Werkstatt - Core Type Definitions

export type CrispDmPhaseId = 
  | 'business-understanding'
  | 'data-understanding'
  | 'data-preparation'
  | 'modeling'
  | 'evaluation'
  | 'deployment';

export interface CrispDmPhase {
  id: CrispDmPhaseId;
  name: string;
  shortName: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  completedAt?: string;
}

export type ProjectType = 'klassifikation' | 'regression' | 'clustering';

export interface Feature {
  id: string;
  name: string;
  type: 'numerisch' | 'kategorial' | 'text' | 'datum';
  description: string;
  isTarget?: boolean;
}

export interface WorkspaceProject {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  createdAt: string;
  updatedAt: string;
  currentPhase: CrispDmPhaseId;
  phases: CrispDmPhase[];
  features: Feature[];
  // Business Understanding data
  businessGoal?: string;
  successCriteria?: string;
  // Data Understanding
  dataSource?: string;
  rowCount?: number;
  // Mock flags
  hasDemoData?: boolean;
}

export interface WorkspaceState {
  onboardingDone: boolean;
  mode: 'local' | 'sync';
  projects: WorkspaceProject[];
  activeProjectId?: string;
}

/** Mode for exporting project data */
export type ExportMode = 'reference' | 'embedded' | 'synthetic-twin';

export interface ExportData {
  version: string;
  exportedAt: string;
  project: WorkspaceProject;
  hash?: string;
  /** How data is included in the export */
  exportMode: ExportMode;
  /** Whether the export file is encrypted */
  encrypted: boolean;
  /** File manifest for re-import validation */
  fileManifest?: FileManifest;
}

/** Manifest describing the original data source for re-import validation */
export interface FileManifest {
  fileName: string;
  fileSize: number;
  fileHash: string;
  rowCount: number;
  columnCount: number;
  columns: string[];
}

// --- Interfaces below will be added with later features ---
// TODO(pyodide): DataSourceConfig – Feature 2
// TODO(pyodide): PipelineStep – Feature 5
// TODO(pyodide): TrainedModel – Feature 6
// TODO(pyodide): ModelMetrics – Feature 6
// TODO(data): SyntheticTwinConfig – Feature 8

// Default CRISP-DM phases configuration
export const DEFAULT_CRISP_DM_PHASES: CrispDmPhase[] = [
  {
    id: 'business-understanding',
    name: 'Business Understanding',
    shortName: 'Business',
    description: 'Projektziele verstehen und definieren',
    status: 'pending',
  },
  {
    id: 'data-understanding',
    name: 'Data Understanding',
    shortName: 'Daten',
    description: 'Daten erkunden und Qualität prüfen',
    status: 'pending',
  },
  {
    id: 'data-preparation',
    name: 'Data Preparation',
    shortName: 'Vorbereitung',
    description: 'Daten bereinigen und transformieren',
    status: 'pending',
  },
  {
    id: 'modeling',
    name: 'Modeling',
    shortName: 'Modell',
    description: 'ML-Modelle trainieren und optimieren',
    status: 'pending',
  },
  {
    id: 'evaluation',
    name: 'Evaluation',
    shortName: 'Bewertung',
    description: 'Modellperformance bewerten',
    status: 'pending',
  },
  {
    id: 'deployment',
    name: 'Deployment',
    shortName: 'Deployment',
    description: 'Modell in Produktion bringen',
    status: 'pending',
  },
];
