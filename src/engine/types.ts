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

export interface ExportData {
  version: string;
  exportedAt: string;
  project: WorkspaceProject;
  hash?: string;
}

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
