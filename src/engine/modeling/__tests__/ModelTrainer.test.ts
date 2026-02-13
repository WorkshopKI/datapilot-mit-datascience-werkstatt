import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  mockRunPython,
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

import { ModelTrainer } from '../ModelTrainer';
import type { TrainingResult, AlgorithmInfo, HyperparameterDef } from '../ModelTrainer';
import type { AlgorithmConfig, AlgorithmType, ModelMetrics, FeatureImportance } from '../../types';

// --- Helpers ---

function makeClassificationResult(): Record<string, unknown> {
  return {
    metrics: {
      accuracy: 0.85,
      precision: 0.84,
      recall: 0.83,
      f1Score: 0.835,
      confusionMatrix: [[40, 5], [10, 45]],
      classLabels: ['0', '1'],
      rocAuc: 0.9,
    } as ModelMetrics,
    featureImportances: [
      { feature: 'Alter', importance: 0.4 },
      { feature: 'Gehalt', importance: 0.6 },
    ] as FeatureImportance[],
  };
}

function makeRegressionResult(): Record<string, unknown> {
  return {
    metrics: {
      r2: 0.92,
      rmse: 1.5,
      mae: 1.2,
    } as ModelMetrics,
    featureImportances: [
      { feature: 'Erfahrung', importance: 0.7 },
      { feature: 'Alter', importance: 0.3 },
    ] as FeatureImportance[],
  };
}

function makeClusteringResult(): Record<string, unknown> {
  return {
    metrics: {
      silhouetteScore: 0.65,
      inertia: 150.5,
      nClusters: 3,
    } as ModelMetrics,
    featureImportances: null,
  };
}

// --- Tests ---

describe('ModelTrainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================
  // getAvailableAlgorithms
  // ===========================================

  describe('getAvailableAlgorithms', () => {
    it('returns classification algorithms for klassifikation', () => {
      const algos = ModelTrainer.getAvailableAlgorithms('klassifikation');
      expect(algos.length).toBe(4);
      expect(algos.every(a => a.category === 'classification')).toBe(true);
      expect(algos.map(a => a.type)).toContain('logistic-regression');
      expect(algos.map(a => a.type)).toContain('random-forest-classifier');
    });

    it('returns regression algorithms for regression', () => {
      const algos = ModelTrainer.getAvailableAlgorithms('regression');
      expect(algos.length).toBe(4);
      expect(algos.every(a => a.category === 'regression')).toBe(true);
      expect(algos.map(a => a.type)).toContain('linear-regression');
      expect(algos.map(a => a.type)).toContain('ridge-regression');
    });

    it('returns clustering algorithms for clustering', () => {
      const algos = ModelTrainer.getAvailableAlgorithms('clustering');
      expect(algos.length).toBe(2);
      expect(algos.every(a => a.category === 'clustering')).toBe(true);
      expect(algos.map(a => a.type)).toContain('kmeans');
      expect(algos.map(a => a.type)).toContain('dbscan');
    });

    it('each algorithm has type, label, description, and category', () => {
      const algos = ModelTrainer.getAvailableAlgorithms('klassifikation');
      for (const algo of algos) {
        expect(algo.type).toBeTruthy();
        expect(algo.label).toBeTruthy();
        expect(algo.description).toBeTruthy();
        expect(algo.category).toBe('classification');
      }
    });
  });

  // ===========================================
  // getDefaultHyperparameters
  // ===========================================

  describe('getDefaultHyperparameters', () => {
    it('returns hyperparameters for logistic regression', () => {
      const params = ModelTrainer.getDefaultHyperparameters('logistic-regression');
      expect(params.length).toBeGreaterThan(0);
      const cParam = params.find(p => p.name === 'C');
      expect(cParam).toBeDefined();
      expect(cParam!.default).toBe(1.0);
      expect(cParam!.min).toBe(0.01);
      expect(cParam!.max).toBe(100);
    });

    it('returns hyperparameters for random forest', () => {
      const params = ModelTrainer.getDefaultHyperparameters('random-forest-classifier');
      expect(params.length).toBe(2);
      expect(params.map(p => p.name)).toContain('n_estimators');
      expect(params.map(p => p.name)).toContain('max_depth');
    });

    it('returns empty array for linear regression (no hyperparameters)', () => {
      const params = ModelTrainer.getDefaultHyperparameters('linear-regression');
      expect(params).toHaveLength(0);
    });

    it('returns hyperparameters for kmeans', () => {
      const params = ModelTrainer.getDefaultHyperparameters('kmeans');
      expect(params.length).toBe(1);
      expect(params[0].name).toBe('n_clusters');
      expect(params[0].default).toBe(3);
    });

    it('returns hyperparameters for dbscan', () => {
      const params = ModelTrainer.getDefaultHyperparameters('dbscan');
      expect(params.length).toBe(2);
      expect(params.map(p => p.name)).toContain('eps');
      expect(params.map(p => p.name)).toContain('min_samples');
    });

    it('returns hyperparameters for knn', () => {
      const params = ModelTrainer.getDefaultHyperparameters('knn-classifier');
      expect(params.length).toBe(1);
      expect(params[0].name).toBe('n_neighbors');
      expect(params[0].default).toBe(5);
    });

    it('each hyperparameter has required fields', () => {
      const params = ModelTrainer.getDefaultHyperparameters('decision-tree-classifier');
      for (const p of params) {
        expect(p.name).toBeTruthy();
        expect(p.label).toBeTruthy();
        expect(p.type).toBeTruthy();
        expect(p.default).toBeDefined();
      }
    });

    it('returns empty for unknown algorithm type', () => {
      const params = ModelTrainer.getDefaultHyperparameters('unknown' as AlgorithmType);
      expect(params).toHaveLength(0);
    });
  });

  // ===========================================
  // buildTrainingCode - Classification
  // ===========================================

  describe('buildTrainingCode - Classification', () => {
    it('generates logistic regression code', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'logistic-regression', hyperparameters: { C: 1.0, max_iter: 200 } },
        'Ziel', 'klassifikation',
      );
      expect(code).toContain('LogisticRegression');
      expect(code).toContain('C=1');
      expect(code).toContain('max_iter=200');
      expect(code).toContain('accuracy_score');
      expect(code).toContain('confusion_matrix');
      expect(code).toContain('"Ziel"');
    });

    it('generates decision tree classifier code', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'decision-tree-classifier', hyperparameters: { max_depth: 5 } },
        'Label', 'klassifikation',
      );
      expect(code).toContain('DecisionTreeClassifier');
      expect(code).toContain('max_depth=5');
      expect(code).toContain('feature_importances_');
    });

    it('generates random forest classifier code', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'random-forest-classifier', hyperparameters: { n_estimators: 100, max_depth: 10 } },
        'Target', 'klassifikation',
      );
      expect(code).toContain('RandomForestClassifier');
      expect(code).toContain('n_estimators=100');
      expect(code).toContain('feature_importances_');
      expect(code).toContain('roc_auc_score');
    });

    it('generates KNN classifier code', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'knn-classifier', hyperparameters: { n_neighbors: 5 } },
        'Klasse', 'klassifikation',
      );
      expect(code).toContain('KNeighborsClassifier');
      expect(code).toContain('n_neighbors=5');
      expect(code).toContain('_feat_imp = None');
    });

    it('includes train-test split preparation', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'logistic-regression', hyperparameters: {} },
        'Ziel', 'klassifikation',
      );
      expect(code).toContain('X_train = df_train.drop(columns=[_target])');
      expect(code).toContain('y_train = df_train[_target]');
      expect(code).toContain('X_test = df_test.drop(columns=[_target])');
      expect(code).toContain('y_test = df_test[_target]');
    });

    it('includes classification metrics', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'logistic-regression', hyperparameters: {} },
        'Ziel', 'klassifikation',
      );
      expect(code).toContain('accuracy_score');
      expect(code).toContain('precision_score');
      expect(code).toContain('recall_score');
      expect(code).toContain('f1_score');
      expect(code).toContain('confusion_matrix');
    });
  });

  // ===========================================
  // buildTrainingCode - Regression
  // ===========================================

  describe('buildTrainingCode - Regression', () => {
    it('generates linear regression code', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'linear-regression', hyperparameters: {} },
        'Preis', 'regression',
      );
      expect(code).toContain('LinearRegression');
      expect(code).toContain('r2_score');
      expect(code).toContain('mean_squared_error');
      expect(code).toContain('mean_absolute_error');
      expect(code).toContain('"Preis"');
    });

    it('generates ridge regression code with alpha', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'ridge-regression', hyperparameters: { alpha: 0.5 } },
        'Wert', 'regression',
      );
      expect(code).toContain('Ridge');
      expect(code).toContain('alpha=0.5');
    });

    it('generates decision tree regressor code', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'decision-tree-regressor', hyperparameters: { max_depth: 8 } },
        'Umsatz', 'regression',
      );
      expect(code).toContain('DecisionTreeRegressor');
      expect(code).toContain('max_depth=8');
      expect(code).toContain('feature_importances_');
    });

    it('generates random forest regressor code', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'random-forest-regressor', hyperparameters: { n_estimators: 50, max_depth: 15 } },
        'Score', 'regression',
      );
      expect(code).toContain('RandomForestRegressor');
      expect(code).toContain('n_estimators=50');
      expect(code).toContain('max_depth=15');
    });

    it('includes regression metrics', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'linear-regression', hyperparameters: {} },
        'Ziel', 'regression',
      );
      expect(code).toContain('"r2"');
      expect(code).toContain('"rmse"');
      expect(code).toContain('"mae"');
    });

    it('uses coef_ for linear model feature importance', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'linear-regression', hyperparameters: {} },
        'Ziel', 'regression',
      );
      expect(code).toContain('_model.coef_');
      expect(code).toContain('_np.abs');
    });
  });

  // ===========================================
  // buildTrainingCode - df_train fallback guard
  // ===========================================

  describe('buildTrainingCode - df_train fallback', () => {
    it('includes fallback split when df_train is not defined', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'random-forest-classifier', hyperparameters: { n_estimators: 100 } },
        'target',
        'klassifikation',
      );
      expect(code).toContain("if 'df_train' not in dir() or 'df_test' not in dir():");
      expect(code).toContain('train_test_split as _tts');
      expect(code).toContain('df_train, df_test = _tts(df, test_size=0.2, random_state=42)');
    });
  });

  // ===========================================
  // buildClusteringCode
  // ===========================================

  describe('buildClusteringCode', () => {
    it('generates kmeans code', () => {
      const code = ModelTrainer.buildClusteringCode(
        { type: 'kmeans', hyperparameters: { n_clusters: 3 } },
      );
      expect(code).toContain('KMeans');
      expect(code).toContain('n_clusters=3');
      expect(code).toContain('silhouette_score');
      expect(code).toContain('inertia_');
      expect(code).toContain('fit_predict');
    });

    it('generates dbscan code', () => {
      const code = ModelTrainer.buildClusteringCode(
        { type: 'dbscan', hyperparameters: { eps: 0.5, min_samples: 5 } },
      );
      expect(code).toContain('DBSCAN');
      expect(code).toContain('eps=0.5');
      expect(code).toContain('min_samples=5');
      expect(code).toContain('silhouette_score');
    });

    it('counts clusters excluding noise label (-1)', () => {
      const code = ModelTrainer.buildClusteringCode(
        { type: 'dbscan', hyperparameters: { eps: 0.5 } },
      );
      expect(code).toContain('-1 in _labels');
    });

    it('guards silhouette score with cluster count check', () => {
      const code = ModelTrainer.buildClusteringCode(
        { type: 'kmeans', hyperparameters: { n_clusters: 3 } },
      );
      expect(code).toContain('_n_clusters >= 2');
    });
  });

  // ===========================================
  // trainModel - Execution
  // ===========================================

  describe('trainModel', () => {
    it('throws when Pyodide is not ready', async () => {
      mockPyodideNotReady();
      await expect(
        ModelTrainer.trainModel({ type: 'logistic-regression', hyperparameters: {} }, 'Ziel', 'klassifikation'),
      ).rejects.toThrow('Pyodide ist nicht initialisiert');
    });

    it('returns success with TrainedModel on successful classification', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeClassificationResult());

      const result = await ModelTrainer.trainModel(
        { type: 'logistic-regression', hyperparameters: { C: 1.0 } },
        'Ziel', 'klassifikation',
      );

      expect(result.success).toBe(true);
      expect(result.model).toBeDefined();
      expect(result.model!.algorithmType).toBe('logistic-regression');
      expect(result.model!.metrics.accuracy).toBe(0.85);
      expect(result.model!.metrics.f1Score).toBe(0.835);
      expect(result.model!.targetColumn).toBe('Ziel');
      expect(result.model!.hyperparameters).toEqual({ C: 1.0 });
    });

    it('returns success with TrainedModel on successful regression', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeRegressionResult());

      const result = await ModelTrainer.trainModel(
        { type: 'linear-regression', hyperparameters: {} },
        'Preis', 'regression',
      );

      expect(result.success).toBe(true);
      expect(result.model!.metrics.r2).toBe(0.92);
      expect(result.model!.metrics.rmse).toBe(1.5);
      expect(result.model!.targetColumn).toBe('Preis');
    });

    it('returns error on Python failure', async () => {
      mockPyodideReady();
      mockRunPythonError('KeyError: target column not found');

      const result = await ModelTrainer.trainModel(
        { type: 'logistic-regression', hyperparameters: {} },
        'Missing', 'klassifikation',
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('target column not found');
    });

    it('returns error on unexpected result format', async () => {
      mockPyodideReady();
      mockRunPythonSuccess('not an object');

      const result = await ModelTrainer.trainModel(
        { type: 'logistic-regression', hyperparameters: {} },
        'Ziel', 'klassifikation',
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unerwartetes Ergebnis');
    });

    it('generates a unique model ID', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeClassificationResult());

      const result = await ModelTrainer.trainModel(
        { type: 'logistic-regression', hyperparameters: {} },
        'Ziel', 'klassifikation',
      );

      expect(result.model!.id).toMatch(/^model-\d+-[a-z0-9]+$/);
    });

    it('records training timestamp', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeClassificationResult());

      const before = new Date().toISOString();
      const result = await ModelTrainer.trainModel(
        { type: 'logistic-regression', hyperparameters: {} },
        'Ziel', 'klassifikation',
      );
      const after = new Date().toISOString();

      expect(result.model!.trainedAt >= before).toBe(true);
      expect(result.model!.trainedAt <= after).toBe(true);
    });

    it('records training duration', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeClassificationResult());

      const result = await ModelTrainer.trainModel(
        { type: 'logistic-regression', hyperparameters: {} },
        'Ziel', 'klassifikation',
      );

      expect(result.model!.trainingDurationMs).toBeGreaterThanOrEqual(0);
    });

    it('includes feature importances when available', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeClassificationResult());

      const result = await ModelTrainer.trainModel(
        { type: 'random-forest-classifier', hyperparameters: { n_estimators: 100 } },
        'Ziel', 'klassifikation',
      );

      expect(result.model!.featureImportances).toHaveLength(2);
      expect(result.model!.featureImportances![0].feature).toBe('Alter');
    });

    it('includes generated Python code for display', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeClassificationResult());

      const result = await ModelTrainer.trainModel(
        { type: 'logistic-regression', hyperparameters: { C: 1.0 } },
        'Ziel', 'klassifikation',
      );

      expect(result.model!.pythonCode).toContain('LogisticRegression');
      expect(result.model!.pythonCode).toContain('"Ziel"');
    });

    it('sets algorithmLabel correctly', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeClassificationResult());

      const result = await ModelTrainer.trainModel(
        { type: 'random-forest-classifier', hyperparameters: {} },
        'Ziel', 'klassifikation',
      );

      expect(result.model!.algorithmLabel).toBe('Random Forest (Klassifikation)');
    });
  });

  // ===========================================
  // trainClusteringModel
  // ===========================================

  describe('trainClusteringModel', () => {
    it('throws when Pyodide is not ready', async () => {
      mockPyodideNotReady();
      await expect(
        ModelTrainer.trainClusteringModel({ type: 'kmeans', hyperparameters: { n_clusters: 3 } }),
      ).rejects.toThrow('Pyodide ist nicht initialisiert');
    });

    it('returns success with clustering metrics', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeClusteringResult());

      const result = await ModelTrainer.trainClusteringModel(
        { type: 'kmeans', hyperparameters: { n_clusters: 3 } },
      );

      expect(result.success).toBe(true);
      expect(result.model!.metrics.silhouetteScore).toBe(0.65);
      expect(result.model!.metrics.nClusters).toBe(3);
      expect(result.model!.metrics.inertia).toBe(150.5);
    });

    it('returns error on Python failure', async () => {
      mockPyodideReady();
      mockRunPythonError('ValueError: invalid data');

      const result = await ModelTrainer.trainClusteringModel(
        { type: 'kmeans', hyperparameters: { n_clusters: 3 } },
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('invalid data');
    });

    it('does not include feature importances for clustering', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeClusteringResult());

      const result = await ModelTrainer.trainClusteringModel(
        { type: 'kmeans', hyperparameters: { n_clusters: 3 } },
      );

      expect(result.model!.featureImportances).toBeUndefined();
    });

    it('sets empty targetColumn for clustering', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeClusteringResult());

      const result = await ModelTrainer.trainClusteringModel(
        { type: 'kmeans', hyperparameters: { n_clusters: 3 } },
      );

      expect(result.model!.targetColumn).toBe('');
    });

    it('includes readable python code', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeClusteringResult());

      const result = await ModelTrainer.trainClusteringModel(
        { type: 'kmeans', hyperparameters: { n_clusters: 3 } },
      );

      expect(result.model!.pythonCode).toContain('KMeans');
      expect(result.model!.pythonCode).toContain('silhouette_score');
    });
  });

  // ===========================================
  // Non-numeric column guard
  // ===========================================

  describe('auto-encoding of categorical columns', () => {
    it('buildTrainingCode auto-encodes non-numeric columns with get_dummies', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'logistic-regression', hyperparameters: {} },
        'Ziel', 'klassifikation',
      );
      expect(code).toContain('_non_numeric = X_train.select_dtypes(exclude=[\'number\']).columns.tolist()');
      expect(code).toContain('_auto_encoded_cols = []');
      expect(code).toContain('if _non_numeric:');
      expect(code).toContain('get_dummies(X_train');
      expect(code).toContain('get_dummies(X_test');
      expect(code).toContain('X_test = X_test.reindex(columns=X_train.columns, fill_value=0)');
      expect(code).not.toContain('raise ValueError');
    });

    it('buildClusteringCode auto-encodes non-numeric columns with get_dummies', () => {
      const code = ModelTrainer.buildClusteringCode(
        { type: 'kmeans', hyperparameters: { n_clusters: 3 } },
      );
      expect(code).toContain('_non_numeric = df.select_dtypes(exclude=[\'number\']).columns.tolist()');
      expect(code).toContain('_auto_encoded_cols = []');
      expect(code).toContain('if _non_numeric:');
      expect(code).toContain('get_dummies(df');
      expect(code).not.toContain('raise ValueError');
    });

    it('auto-encoding comes before model creation in training code', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'logistic-regression', hyperparameters: {} },
        'Ziel', 'klassifikation',
      );
      const guardIdx = code.indexOf('_non_numeric');
      const modelIdx = code.indexOf('_model = ');
      expect(guardIdx).toBeGreaterThan(-1);
      expect(modelIdx).toBeGreaterThan(-1);
      expect(guardIdx).toBeLessThan(modelIdx);
    });

    it('auto-encoding comes before fit_predict in clustering code', () => {
      const code = ModelTrainer.buildClusteringCode(
        { type: 'dbscan', hyperparameters: { eps: 0.5 } },
      );
      const guardIdx = code.indexOf('_non_numeric');
      const fitIdx = code.indexOf('fit_predict');
      expect(guardIdx).toBeGreaterThan(-1);
      expect(fitIdx).toBeGreaterThan(-1);
      expect(guardIdx).toBeLessThan(fitIdx);
    });

    it('buildTrainingCode includes autoEncodedColumns in result dict', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'logistic-regression', hyperparameters: {} },
        'Ziel', 'klassifikation',
      );
      expect(code).toContain('"autoEncodedColumns": _auto_encoded_cols');
    });

    it('buildClusteringCode includes autoEncodedColumns in result dict', () => {
      const code = ModelTrainer.buildClusteringCode(
        { type: 'kmeans', hyperparameters: { n_clusters: 3 } },
      );
      expect(code).toContain('"autoEncodedColumns": _auto_encoded_cols');
    });

    it('trainModel returns autoEncodedColumns when present', async () => {
      mockPyodideReady();
      mockRunPythonSuccess({
        ...makeClassificationResult(),
        autoEncodedColumns: ['Sex', 'Embarked'],
      });

      const result = await ModelTrainer.trainModel(
        { type: 'logistic-regression', hyperparameters: {} },
        'Survived', 'klassifikation',
      );

      expect(result.success).toBe(true);
      expect(result.autoEncodedColumns).toEqual(['Sex', 'Embarked']);
    });

    it('trainModel omits autoEncodedColumns when empty', async () => {
      mockPyodideReady();
      mockRunPythonSuccess({
        ...makeClassificationResult(),
        autoEncodedColumns: [],
      });

      const result = await ModelTrainer.trainModel(
        { type: 'logistic-regression', hyperparameters: {} },
        'Ziel', 'klassifikation',
      );

      expect(result.success).toBe(true);
      expect(result.autoEncodedColumns).toBeUndefined();
    });

    it('trainClusteringModel returns autoEncodedColumns when present', async () => {
      mockPyodideReady();
      mockRunPythonSuccess({
        ...makeClusteringResult(),
        autoEncodedColumns: ['Farbe'],
      });

      const result = await ModelTrainer.trainClusteringModel(
        { type: 'kmeans', hyperparameters: { n_clusters: 3 } },
      );

      expect(result.success).toBe(true);
      expect(result.autoEncodedColumns).toEqual(['Farbe']);
    });

    it('trainClusteringModel omits autoEncodedColumns when empty', async () => {
      mockPyodideReady();
      mockRunPythonSuccess({
        ...makeClusteringResult(),
        autoEncodedColumns: [],
      });

      const result = await ModelTrainer.trainClusteringModel(
        { type: 'kmeans', hyperparameters: { n_clusters: 3 } },
      );

      expect(result.success).toBe(true);
      expect(result.autoEncodedColumns).toBeUndefined();
    });

    it('readable training code includes auto-encoding section', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'logistic-regression', hyperparameters: {} },
        'Ziel', 'klassifikation',
      );
      // The readable code is inside buildReadableCode (called internally for pythonCode)
      // but we test buildTrainingCode's execution code here
      expect(code).toContain('_auto_encoded_cols = _non_numeric.copy()');
    });

    it('readable clustering code includes auto-encoding section', () => {
      const code = ModelTrainer.buildClusteringCode(
        { type: 'kmeans', hyperparameters: { n_clusters: 3 } },
      );
      expect(code).toContain('_auto_encoded_cols = _non_numeric.copy()');
    });
  });

  // ===========================================
  // NaN safety net (dropna)
  // ===========================================

  describe('NaN safety net', () => {
    it('buildTrainingCode drops NaN rows before model.fit', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'logistic-regression', hyperparameters: {} },
        'Ziel', 'klassifikation',
      );
      expect(code).toContain('X_train.notna().all(axis=1)');
      expect(code).toContain('y_train.notna()');
      expect(code).toContain('X_test.notna().all(axis=1)');
      expect(code).toContain('y_test.notna()');
      expect(code).toContain('_rows_dropped');
    });

    it('buildTrainingCode NaN drop comes after auto-encoding and before fit', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'decision-tree-classifier', hyperparameters: { max_depth: 5 } },
        'Label', 'klassifikation',
      );
      const encodingIdx = code.indexOf('get_dummies');
      const dropIdx = code.indexOf('_rows_dropped');
      const fitIdx = code.indexOf('_model.fit');
      expect(encodingIdx).toBeGreaterThan(-1);
      expect(dropIdx).toBeGreaterThan(encodingIdx);
      expect(fitIdx).toBeGreaterThan(dropIdx);
    });

    it('buildTrainingCode includes rowsDropped in result dict', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'logistic-regression', hyperparameters: {} },
        'Ziel', 'klassifikation',
      );
      expect(code).toContain('"rowsDropped": int(_rows_dropped)');
    });

    it('buildClusteringCode drops NaN rows before fit_predict', () => {
      const code = ModelTrainer.buildClusteringCode(
        { type: 'kmeans', hyperparameters: { n_clusters: 3 } },
      );
      expect(code).toContain('df = df.dropna()');
      expect(code).toContain('_rows_dropped');
    });

    it('buildClusteringCode NaN drop comes after auto-encoding and before fit_predict', () => {
      const code = ModelTrainer.buildClusteringCode(
        { type: 'kmeans', hyperparameters: { n_clusters: 3 } },
      );
      const encodingIdx = code.indexOf('get_dummies');
      const dropIdx = code.indexOf('df = df.dropna()');
      const fitIdx = code.indexOf('fit_predict');
      expect(encodingIdx).toBeGreaterThan(-1);
      expect(dropIdx).toBeGreaterThan(encodingIdx);
      expect(fitIdx).toBeGreaterThan(dropIdx);
    });

    it('buildClusteringCode includes rowsDropped in result dict', () => {
      const code = ModelTrainer.buildClusteringCode(
        { type: 'dbscan', hyperparameters: { eps: 0.5 } },
      );
      expect(code).toContain('"rowsDropped": int(_rows_dropped)');
    });
  });

  // ===========================================
  // getAlgorithmLabel
  // ===========================================

  describe('getAlgorithmLabel', () => {
    it('returns correct labels', () => {
      expect(ModelTrainer.getAlgorithmLabel('logistic-regression')).toBe('Logistic Regression');
      expect(ModelTrainer.getAlgorithmLabel('random-forest-classifier')).toBe('Random Forest (Klassifikation)');
      expect(ModelTrainer.getAlgorithmLabel('kmeans')).toBe('K-Means');
    });
  });

  // ===========================================
  // getSmartDefaults
  // ===========================================

  describe('getSmartDefaults', () => {
    it('returns null for small datasets (<= 10k rows)', () => {
      expect(ModelTrainer.getSmartDefaults('random-forest-classifier', 5000)).toBeNull();
      expect(ModelTrainer.getSmartDefaults('random-forest-classifier', 10000)).toBeNull();
    });

    it('returns adjusted params for random forest on large datasets', () => {
      const defaults = ModelTrainer.getSmartDefaults('random-forest-classifier', 20000);
      expect(defaults).toEqual({ n_estimators: 50, max_depth: 8 });
    });

    it('returns adjusted params for random forest regressor on large datasets', () => {
      const defaults = ModelTrainer.getSmartDefaults('random-forest-regressor', 15000);
      expect(defaults).toEqual({ n_estimators: 50, max_depth: 8 });
    });

    it('returns adjusted params for decision tree on large datasets', () => {
      const defaults = ModelTrainer.getSmartDefaults('decision-tree-classifier', 15000);
      expect(defaults).toEqual({ max_depth: 8 });
    });

    it('returns adjusted params for decision tree regressor on large datasets', () => {
      const defaults = ModelTrainer.getSmartDefaults('decision-tree-regressor', 15000);
      expect(defaults).toEqual({ max_depth: 8 });
    });

    it('returns adjusted params for KNN on large datasets', () => {
      const defaults = ModelTrainer.getSmartDefaults('knn-classifier', 15000);
      expect(defaults).toEqual({ n_neighbors: 7 });
    });

    it('returns null for algorithms without adjustments', () => {
      expect(ModelTrainer.getSmartDefaults('logistic-regression', 20000)).toBeNull();
      expect(ModelTrainer.getSmartDefaults('linear-regression', 20000)).toBeNull();
      expect(ModelTrainer.getSmartDefaults('kmeans', 20000)).toBeNull();
    });
  });

  // ===========================================
  // getRecommendedSampleSize
  // ===========================================

  describe('getRecommendedSampleSize', () => {
    it('returns null for small datasets (<= 10k)', () => {
      expect(ModelTrainer.getRecommendedSampleSize(5000)).toBeNull();
      expect(ModelTrainer.getRecommendedSampleSize(10000)).toBeNull();
    });

    it('returns 5000 for datasets up to 25k', () => {
      expect(ModelTrainer.getRecommendedSampleSize(15000)).toBe(5000);
      expect(ModelTrainer.getRecommendedSampleSize(25000)).toBe(5000);
    });

    it('returns 8000 for datasets up to 50k', () => {
      expect(ModelTrainer.getRecommendedSampleSize(30000)).toBe(8000);
      expect(ModelTrainer.getRecommendedSampleSize(50000)).toBe(8000);
    });

    it('returns 10000 for datasets over 50k', () => {
      expect(ModelTrainer.getRecommendedSampleSize(60000)).toBe(10000);
      expect(ModelTrainer.getRecommendedSampleSize(100000)).toBe(10000);
    });
  });

  // ===========================================
  // Sampling in code builders
  // ===========================================

  describe('sampling in buildTrainingCode', () => {
    it('includes sampling block when sampleSize is provided', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'random-forest-classifier', hyperparameters: { n_estimators: 50 } },
        'Ziel', 'klassifikation', 5000,
      );
      expect(code).toContain('if len(df_train) > 5000');
      expect(code).toContain('df_train = df_train.sample(n=5000, random_state=42)');
      expect(code).toContain('_sampling_applied = True');
      expect(code).toContain('_sampled_row_count = 5000');
    });

    it('does not include sampling block when sampleSize is undefined', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'logistic-regression', hyperparameters: {} },
        'Ziel', 'klassifikation',
      );
      expect(code).not.toContain('df_train.sample(n=');
      expect(code).toContain('_sampling_applied = False');
    });

    it('includes sampling info in result dict', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'logistic-regression', hyperparameters: {} },
        'Ziel', 'klassifikation', 3000,
      );
      expect(code).toContain('"samplingApplied": _sampling_applied');
      expect(code).toContain('"originalRowCount": int(_original_row_count)');
      expect(code).toContain('"sampledRowCount": int(_sampled_row_count)');
    });

    it('sampling comes before feature/target split', () => {
      const code = ModelTrainer.buildTrainingCode(
        { type: 'random-forest-classifier', hyperparameters: {} },
        'Ziel', 'klassifikation', 5000,
      );
      const samplingIdx = code.indexOf('df_train.sample(n=5000');
      const splitIdx = code.indexOf('X_train = df_train.drop');
      expect(samplingIdx).toBeGreaterThan(-1);
      expect(splitIdx).toBeGreaterThan(samplingIdx);
    });
  });

  describe('sampling in buildClusteringCode', () => {
    it('includes sampling block when sampleSize is provided', () => {
      const code = ModelTrainer.buildClusteringCode(
        { type: 'kmeans', hyperparameters: { n_clusters: 3 } }, 5000,
      );
      expect(code).toContain('if len(df) > 5000');
      expect(code).toContain('df = df.sample(n=5000, random_state=42)');
      expect(code).toContain('_sampling_applied = True');
    });

    it('does not include sampling block when sampleSize is undefined', () => {
      const code = ModelTrainer.buildClusteringCode(
        { type: 'kmeans', hyperparameters: { n_clusters: 3 } },
      );
      expect(code).not.toContain('df.sample(n=');
      expect(code).toContain('_sampling_applied = False');
    });

    it('sampling comes after NaN drop and before fit_predict', () => {
      const code = ModelTrainer.buildClusteringCode(
        { type: 'kmeans', hyperparameters: { n_clusters: 3 } }, 5000,
      );
      const dropIdx = code.indexOf('df = df.dropna()');
      const samplingIdx = code.indexOf('df = df.sample(n=5000');
      const fitIdx = code.indexOf('fit_predict');
      expect(dropIdx).toBeGreaterThan(-1);
      expect(samplingIdx).toBeGreaterThan(dropIdx);
      expect(fitIdx).toBeGreaterThan(samplingIdx);
    });
  });

  // ===========================================
  // Sampling in trainModel / trainClusteringModel
  // ===========================================

  describe('trainModel with sampling', () => {
    it('passes sampling info in result when sampling applied', async () => {
      mockPyodideReady();
      mockRunPythonSuccess({
        ...makeClassificationResult(),
        samplingApplied: true,
        originalRowCount: 20000,
        sampledRowCount: 5000,
      });

      const result = await ModelTrainer.trainModel(
        { type: 'random-forest-classifier', hyperparameters: { n_estimators: 50 } },
        'Ziel', 'klassifikation', 5000,
      );

      expect(result.success).toBe(true);
      expect(result.samplingApplied).toBe(true);
      expect(result.originalRowCount).toBe(20000);
      expect(result.sampledRowCount).toBe(5000);
    });

    it('includes sampling in readable code when sampleSize provided', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeClassificationResult());

      const result = await ModelTrainer.trainModel(
        { type: 'logistic-regression', hyperparameters: {} },
        'Ziel', 'klassifikation', 5000,
      );

      expect(result.model!.pythonCode).toContain('df_train = df_train.sample(n=5000');
      expect(result.model!.pythonCode).toContain('Sampling');
    });
  });

  describe('trainClusteringModel with sampling', () => {
    it('passes sampling info in result when sampling applied', async () => {
      mockPyodideReady();
      mockRunPythonSuccess({
        ...makeClusteringResult(),
        samplingApplied: true,
        originalRowCount: 15000,
        sampledRowCount: 5000,
      });

      const result = await ModelTrainer.trainClusteringModel(
        { type: 'kmeans', hyperparameters: { n_clusters: 3 } }, 5000,
      );

      expect(result.success).toBe(true);
      expect(result.samplingApplied).toBe(true);
      expect(result.originalRowCount).toBe(15000);
      expect(result.sampledRowCount).toBe(5000);
    });

    it('includes sampling in readable code when sampleSize provided', async () => {
      mockPyodideReady();
      mockRunPythonSuccess(makeClusteringResult());

      const result = await ModelTrainer.trainClusteringModel(
        { type: 'kmeans', hyperparameters: { n_clusters: 3 } }, 5000,
      );

      expect(result.model!.pythonCode).toContain('df = df.sample(n=5000');
      expect(result.model!.pythonCode).toContain('Sampling');
    });
  });
});
