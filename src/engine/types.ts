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
  // Data Preparation (Feature 5)
  pipelineSteps?: PipelineStep[];
  preparedDataSummary?: PreparedDataSummary;
  // Modeling + Evaluation (Feature 6)
  trainedModels?: TrainedModel[];
  selectedModelId?: string;
  targetColumn?: string;
  /** ID of the selected sample dataset (from openDataRegistry) */
  selectedDataset?: string;
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
  /** Synthetic twin data for privacy-preserving export */
  syntheticData?: SyntheticTwinData;
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

// --- Data Preparation Pipeline (Feature 5) ---

export type PipelineStepType =
  | 'missing-values'
  | 'outlier-removal'
  | 'encoding'
  | 'scaling'
  | 'feature-selection'
  | 'train-test-split';

export interface MissingValuesConfig {
  strategy: 'drop-rows' | 'fill-mean' | 'fill-median' | 'fill-mode' | 'fill-constant';
  columns: string[];
  fillValue?: string;
}

export interface OutlierRemovalConfig {
  method: 'zscore' | 'iqr';
  threshold: number;
  columns: string[];
}

export interface EncodingConfig {
  method: 'one-hot' | 'label';
  columns: string[];
  dropFirst?: boolean;
}

export interface ScalingConfig {
  method: 'standard' | 'minmax';
  columns: string[];
}

export interface FeatureSelectionConfig {
  method: 'drop-columns' | 'keep-columns';
  columns: string[];
}

export interface TrainTestSplitConfig {
  testSize: number;
  randomState: number;
  stratify?: string;
}

export type PipelineStepConfig =
  | MissingValuesConfig
  | OutlierRemovalConfig
  | EncodingConfig
  | ScalingConfig
  | FeatureSelectionConfig
  | TrainTestSplitConfig;

export interface PipelineStep {
  id: string;
  type: PipelineStepType;
  label: string;
  config: PipelineStepConfig;
  pythonCode: string;
  appliedAt?: string;
  resultSummary?: string;
}

export interface PreparedDataSummary {
  rowCount: number;
  columnCount: number;
  columnNames: string[];
  numericColumns: string[];
  categoricalColumns: string[];
  missingValueCount: number;
  trainRows?: number;
  testRows?: number;
  hasSplit: boolean;
}

// --- Modeling + Evaluation (Feature 6) ---

export type AlgorithmType =
  | 'logistic-regression' | 'decision-tree-classifier'
  | 'random-forest-classifier' | 'knn-classifier'
  | 'gradient-boosting-classifier' | 'naive-bayes' | 'svm-classifier'
  | 'linear-regression' | 'ridge-regression'
  | 'decision-tree-regressor' | 'random-forest-regressor'
  | 'gradient-boosting-regressor' | 'lasso-regression'
  | 'kmeans' | 'dbscan';

export interface AlgorithmConfig {
  type: AlgorithmType;
  hyperparameters: Record<string, number | string | boolean>;
}

export interface ModelMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  rocAuc?: number;
  confusionMatrix?: number[][];
  classLabels?: string[];
  r2?: number;
  rmse?: number;
  mae?: number;
  silhouetteScore?: number;
  inertia?: number;
  nClusters?: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface TrainedModel {
  id: string;
  algorithmType: AlgorithmType;
  algorithmLabel: string;
  hyperparameters: Record<string, number | string | boolean>;
  metrics: ModelMetrics;
  featureImportances?: FeatureImportance[];
  trainedAt: string;
  trainingDurationMs: number;
  pythonCode: string;
  targetColumn: string;
}

// --- Synthetischer Zwilling (Feature 8) ---

export interface SyntheticTwinConfig {
  rowCount: number;
  randomSeed: number;
  preserveCorrelations: boolean;
}

export interface SyntheticTwinValidation {
  ksTests: Record<string, { statistic: number; pValue: number }>;
  correlationDeviation: number;
  passed: boolean;
}

export interface SyntheticTwinData {
  rows: Record<string, unknown>[];
  rowCount: number;
  columnNames: string[];
  generatedAt: string;
  config: SyntheticTwinConfig;
  validation: SyntheticTwinValidation;
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
