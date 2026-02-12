/**
 * Shared test fixtures for WorkspaceProject, TrainedModel, and PipelineStep.
 *
 * Used by ModelDeployer.test.ts and KnimeExporter.test.ts to avoid duplication.
 */

import type {
  WorkspaceProject,
  TrainedModel,
  PipelineStep,
  AlgorithmType,
} from '@/engine/types';

export function createMockModel(overrides?: Partial<TrainedModel>): TrainedModel {
  return {
    id: 'model-1',
    algorithmType: 'random-forest-classifier',
    algorithmLabel: 'Random Forest (Klassifikation)',
    hyperparameters: { n_estimators: 100, max_depth: 10 },
    metrics: { accuracy: 0.85, f1Score: 0.84 },
    featureImportances: [
      { feature: 'Alter', importance: 0.6 },
      { feature: 'Gehalt', importance: 0.4 },
    ],
    trainedAt: '2026-01-01T00:00:00.000Z',
    trainingDurationMs: 1200,
    pythonCode: `from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score

X_train = df_train.drop(columns=["target"])
y_train = df_train["target"]
X_test = df_test.drop(columns=["target"])
y_test = df_test["target"]

model = RandomForestClassifier(n_estimators=100, max_depth=10)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred, average="weighted")`,
    targetColumn: 'target',
    ...overrides,
  };
}

export function createMockProject(overrides?: Partial<WorkspaceProject>): WorkspaceProject {
  return {
    id: 'proj-1',
    name: 'Testprojekt',
    description: 'Ein Testprojekt',
    type: 'klassifikation',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    currentPhase: 'deployment',
    phases: [],
    features: [],
    businessGoal: 'Kundenabwanderung vorhersagen',
    pipelineSteps: [
      {
        id: 'step-1',
        type: 'missing-values',
        label: 'Fehlende Werte füllen (Mean)',
        config: { strategy: 'fill-mean', columns: ['Alter'] },
        pythonCode: 'df["Alter"] = df["Alter"].fillna(df["Alter"].mean())',
      } as PipelineStep,
      {
        id: 'step-2',
        type: 'scaling',
        label: 'StandardScaler anwenden',
        config: { method: 'standard', columns: ['Alter', 'Gehalt'] },
        pythonCode: 'from sklearn.preprocessing import StandardScaler\nscaler = StandardScaler()\ndf[["Alter", "Gehalt"]] = scaler.fit_transform(df[["Alter", "Gehalt"]])',
      } as PipelineStep,
      {
        id: 'step-3',
        type: 'train-test-split',
        label: 'Train-Test-Split (80/20)',
        config: { testSize: 0.2, randomState: 42 },
        pythonCode: 'df_train, df_test = train_test_split(df, test_size=0.2, random_state=42)',
      } as PipelineStep,
    ],
    trainedModels: [createMockModel()],
    selectedModelId: 'model-1',
    targetColumn: 'target',
    ...overrides,
  };
}

export function createMockPipelineStep(
  type: PipelineStep['type'],
  overrides?: Partial<PipelineStep>,
): PipelineStep {
  return {
    id: 'step-1',
    type,
    label: `Test ${type} Step`,
    config: {},
    pythonCode: '',
    ...overrides,
  } as PipelineStep;
}
