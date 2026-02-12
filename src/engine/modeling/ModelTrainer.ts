/**
 * ModelTrainer – ML model training and evaluation engine.
 *
 * Builds Python code for training scikit-learn models, executes it
 * in the Pyodide worker, and returns structured results with metrics
 * and feature importances.
 *
 * Architecture:
 * - Expects `df_train` and `df_test` to exist in the Pyodide worker
 *   (created by DataPreparator's train-test-split step)
 * - For clustering, uses `df` directly (no train/test split needed)
 * - Each training run produces a `TrainedModel` with metrics + code
 */

import { ensurePyodideReady } from '../pyodide/ensurePyodide';
import type {
  AlgorithmType,
  AlgorithmConfig,
  TrainedModel,
  ModelMetrics,
  FeatureImportance,
  ProjectType,
} from '../types';

/** Result returned after a training run */
export interface TrainingResult {
  success: boolean;
  model?: TrainedModel;
  error?: string;
  autoEncodedColumns?: string[];
}

/** Metadata about an available algorithm */
export interface AlgorithmInfo {
  type: AlgorithmType;
  label: string;
  description: string;
  category: 'classification' | 'regression' | 'clustering';
}

/** Definition of a single hyperparameter for UI rendering */
export interface HyperparameterDef {
  name: string;
  label: string;
  type: 'number' | 'select';
  min?: number;
  max?: number;
  step?: number;
  default: number | string;
  options?: { value: string; label: string }[];
}

// ============================================================
// Algorithm registry
// ============================================================

const CLASSIFICATION_ALGORITHMS: AlgorithmInfo[] = [
  { type: 'logistic-regression', label: 'Logistic Regression', description: 'Lineares Modell für Klassifikation mit Wahrscheinlichkeiten', category: 'classification' },
  { type: 'decision-tree-classifier', label: 'Decision Tree', description: 'Baumbasierter Algorithmus, leicht interpretierbar', category: 'classification' },
  { type: 'random-forest-classifier', label: 'Random Forest', description: 'Ensemble aus vielen Decision Trees, robust und genau', category: 'classification' },
  { type: 'knn-classifier', label: 'K-Nearest Neighbors', description: 'Klassifiziert anhand der k nächsten Nachbarn', category: 'classification' },
];

const REGRESSION_ALGORITHMS: AlgorithmInfo[] = [
  { type: 'linear-regression', label: 'Linear Regression', description: 'Einfache lineare Regression für stetige Zielwerte', category: 'regression' },
  { type: 'ridge-regression', label: 'Ridge Regression', description: 'Lineare Regression mit L2-Regularisierung', category: 'regression' },
  { type: 'decision-tree-regressor', label: 'Decision Tree', description: 'Baumbasierter Algorithmus für Regression', category: 'regression' },
  { type: 'random-forest-regressor', label: 'Random Forest', description: 'Ensemble aus Decision Trees für Regression', category: 'regression' },
];

const CLUSTERING_ALGORITHMS: AlgorithmInfo[] = [
  { type: 'kmeans', label: 'K-Means', description: 'Partitioniert Daten in k Cluster basierend auf Distanz', category: 'clustering' },
  { type: 'dbscan', label: 'DBSCAN', description: 'Dichtebasiertes Clustering, findet Cluster beliebiger Form', category: 'clustering' },
];

const HYPERPARAMETERS: Record<AlgorithmType, HyperparameterDef[]> = {
  'logistic-regression': [
    { name: 'C', label: 'Regularisierung (C)', type: 'number', min: 0.01, max: 100, step: 0.1, default: 1.0 },
    { name: 'max_iter', label: 'Max Iterationen', type: 'number', min: 100, max: 1000, step: 100, default: 200 },
  ],
  'decision-tree-classifier': [
    { name: 'max_depth', label: 'Max Tiefe', type: 'number', min: 1, max: 20, step: 1, default: 5 },
    { name: 'min_samples_split', label: 'Min Samples Split', type: 'number', min: 2, max: 20, step: 1, default: 2 },
  ],
  'random-forest-classifier': [
    { name: 'n_estimators', label: 'Anzahl Bäume', type: 'number', min: 10, max: 200, step: 10, default: 100 },
    { name: 'max_depth', label: 'Max Tiefe', type: 'number', min: 1, max: 20, step: 1, default: 10 },
  ],
  'knn-classifier': [
    { name: 'n_neighbors', label: 'Anzahl Nachbarn (k)', type: 'number', min: 1, max: 20, step: 1, default: 5 },
  ],
  'linear-regression': [],
  'ridge-regression': [
    { name: 'alpha', label: 'Alpha (Regularisierung)', type: 'number', min: 0.01, max: 100, step: 0.1, default: 1.0 },
  ],
  'decision-tree-regressor': [
    { name: 'max_depth', label: 'Max Tiefe', type: 'number', min: 1, max: 20, step: 1, default: 5 },
    { name: 'min_samples_split', label: 'Min Samples Split', type: 'number', min: 2, max: 20, step: 1, default: 2 },
  ],
  'random-forest-regressor': [
    { name: 'n_estimators', label: 'Anzahl Bäume', type: 'number', min: 10, max: 200, step: 10, default: 100 },
    { name: 'max_depth', label: 'Max Tiefe', type: 'number', min: 1, max: 20, step: 1, default: 10 },
  ],
  'kmeans': [
    { name: 'n_clusters', label: 'Anzahl Cluster', type: 'number', min: 2, max: 10, step: 1, default: 3 },
  ],
  'dbscan': [
    { name: 'eps', label: 'Epsilon (Radius)', type: 'number', min: 0.1, max: 5, step: 0.1, default: 0.5 },
    { name: 'min_samples', label: 'Min Samples', type: 'number', min: 2, max: 20, step: 1, default: 5 },
  ],
};

/** Human-readable labels for algorithm types */
const ALGORITHM_LABELS: Record<AlgorithmType, string> = {
  'logistic-regression': 'Logistic Regression',
  'decision-tree-classifier': 'Decision Tree (Klassifikation)',
  'random-forest-classifier': 'Random Forest (Klassifikation)',
  'knn-classifier': 'K-Nearest Neighbors',
  'linear-regression': 'Linear Regression',
  'ridge-regression': 'Ridge Regression',
  'decision-tree-regressor': 'Decision Tree (Regression)',
  'random-forest-regressor': 'Random Forest (Regression)',
  'kmeans': 'K-Means',
  'dbscan': 'DBSCAN',
};

/** sklearn class import paths */
const SKLEARN_IMPORTS: Record<AlgorithmType, string> = {
  'logistic-regression': 'from sklearn.linear_model import LogisticRegression',
  'decision-tree-classifier': 'from sklearn.tree import DecisionTreeClassifier',
  'random-forest-classifier': 'from sklearn.ensemble import RandomForestClassifier',
  'knn-classifier': 'from sklearn.neighbors import KNeighborsClassifier',
  'linear-regression': 'from sklearn.linear_model import LinearRegression',
  'ridge-regression': 'from sklearn.linear_model import Ridge',
  'decision-tree-regressor': 'from sklearn.tree import DecisionTreeRegressor',
  'random-forest-regressor': 'from sklearn.ensemble import RandomForestRegressor',
  'kmeans': 'from sklearn.cluster import KMeans',
  'dbscan': 'from sklearn.cluster import DBSCAN',
};

/** sklearn class names */
const SKLEARN_CLASSES: Record<AlgorithmType, string> = {
  'logistic-regression': 'LogisticRegression',
  'decision-tree-classifier': 'DecisionTreeClassifier',
  'random-forest-classifier': 'RandomForestClassifier',
  'knn-classifier': 'KNeighborsClassifier',
  'linear-regression': 'LinearRegression',
  'ridge-regression': 'Ridge',
  'decision-tree-regressor': 'DecisionTreeRegressor',
  'random-forest-regressor': 'RandomForestRegressor',
  'kmeans': 'KMeans',
  'dbscan': 'DBSCAN',
};

// ============================================================
// ModelTrainer
// ============================================================

export class ModelTrainer {
  /**
   * Train a supervised model (classification or regression) on df_train/df_test.
   */
  static async trainModel(
    config: AlgorithmConfig,
    targetColumn: string,
    projectType: ProjectType,
  ): Promise<TrainingResult> {
    const manager = ensurePyodideReady();

    const code = ModelTrainer.buildTrainingCode(config, targetColumn, projectType);
    const startTime = Date.now();
    const execResult = await manager.runPython(code);
    const durationMs = Date.now() - startTime;

    if (!execResult.success) {
      return { success: false, error: execResult.error ?? 'Training fehlgeschlagen' };
    }

    const raw = execResult.result as Record<string, unknown>;
    if (!raw || typeof raw !== 'object') {
      return { success: false, error: 'Unerwartetes Ergebnis vom Training' };
    }

    const autoEncodedColumns = raw.autoEncodedColumns as string[] | undefined;

    const model: TrainedModel = {
      id: `model-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      algorithmType: config.type,
      algorithmLabel: ALGORITHM_LABELS[config.type],
      hyperparameters: config.hyperparameters,
      metrics: raw.metrics as ModelMetrics,
      featureImportances: raw.featureImportances as FeatureImportance[] | undefined,
      trainedAt: new Date().toISOString(),
      trainingDurationMs: durationMs,
      pythonCode: ModelTrainer.buildReadableCode(config, targetColumn, projectType),
      targetColumn,
    };

    return {
      success: true,
      model,
      autoEncodedColumns: autoEncodedColumns?.length ? autoEncodedColumns : undefined,
    };
  }

  /**
   * Train a clustering model on `df` (no train/test split needed).
   */
  static async trainClusteringModel(config: AlgorithmConfig): Promise<TrainingResult> {
    const manager = ensurePyodideReady();

    const code = ModelTrainer.buildClusteringCode(config);
    const startTime = Date.now();
    const execResult = await manager.runPython(code);
    const durationMs = Date.now() - startTime;

    if (!execResult.success) {
      return { success: false, error: execResult.error ?? 'Training fehlgeschlagen' };
    }

    const raw = execResult.result as Record<string, unknown>;
    if (!raw || typeof raw !== 'object') {
      return { success: false, error: 'Unerwartetes Ergebnis vom Training' };
    }

    const autoEncodedColumns = raw.autoEncodedColumns as string[] | undefined;

    const model: TrainedModel = {
      id: `model-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      algorithmType: config.type,
      algorithmLabel: ALGORITHM_LABELS[config.type],
      hyperparameters: config.hyperparameters,
      metrics: raw.metrics as ModelMetrics,
      featureImportances: undefined,
      trainedAt: new Date().toISOString(),
      trainingDurationMs: durationMs,
      pythonCode: ModelTrainer.buildReadableClusteringCode(config),
      targetColumn: '',
    };

    return {
      success: true,
      model,
      autoEncodedColumns: autoEncodedColumns?.length ? autoEncodedColumns : undefined,
    };
  }

  /**
   * Get available algorithms for a project type.
   */
  static getAvailableAlgorithms(projectType: ProjectType): AlgorithmInfo[] {
    switch (projectType) {
      case 'klassifikation': return CLASSIFICATION_ALGORITHMS;
      case 'regression': return REGRESSION_ALGORITHMS;
      case 'clustering': return CLUSTERING_ALGORITHMS;
      default: return [];
    }
  }

  /**
   * Get hyperparameter definitions for an algorithm type.
   */
  static getDefaultHyperparameters(algorithmType: AlgorithmType): HyperparameterDef[] {
    return HYPERPARAMETERS[algorithmType] ?? [];
  }

  /**
   * Get the algorithm label.
   */
  static getAlgorithmLabel(algorithmType: AlgorithmType): string {
    return ALGORITHM_LABELS[algorithmType] ?? algorithmType;
  }

  // ============================================================
  // Code Builders (exposed for tests)
  // ============================================================

  /**
   * Build Python code for training a supervised model.
   * Returns a dict with metrics and featureImportances.
   */
  static buildTrainingCode(
    config: AlgorithmConfig,
    targetColumn: string,
    projectType: ProjectType,
  ): string {
    const importLine = SKLEARN_IMPORTS[config.type];
    const className = SKLEARN_CLASSES[config.type];
    const hyperparamStr = ModelTrainer.buildHyperparamString(config.hyperparameters);
    const isClassification = projectType === 'klassifikation';

    const metricsImports = isClassification
      ? 'from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_auc_score'
      : 'from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error';

    const metricsCode = isClassification
      ? ModelTrainer.buildClassificationMetricsCode(config.type)
      : ModelTrainer.buildRegressionMetricsCode();

    const featureImportanceCode = ModelTrainer.buildFeatureImportanceCode(config.type);

    return `
import json as _json
import numpy as _np
${importLine}
${metricsImports}

_target = "${targetColumn}"

# Fallback: if df_train/df_test don't exist, split df automatically
if 'df_train' not in dir() or 'df_test' not in dir():
    from sklearn.model_selection import train_test_split as _tts
    df_train, df_test = _tts(df, test_size=0.2, random_state=42)

X_train = df_train.drop(columns=[_target])
y_train = df_train[_target]
X_test = df_test.drop(columns=[_target])
y_test = df_test[_target]

_non_numeric = X_train.select_dtypes(exclude=['number']).columns.tolist()
_auto_encoded_cols = []
if _non_numeric:
    import pandas as _pd
    _auto_encoded_cols = _non_numeric.copy()
    X_train = _pd.get_dummies(X_train, columns=_non_numeric, drop_first=True)
    X_test = _pd.get_dummies(X_test, columns=_non_numeric, drop_first=True)
    X_test = X_test.reindex(columns=X_train.columns, fill_value=0)

# Drop rows with NaN (safety net for datasets with missing values)
_pre_drop = len(X_train)
_mask_train = X_train.notna().all(axis=1) & y_train.notna()
X_train = X_train[_mask_train]
y_train = y_train[_mask_train]
_mask_test = X_test.notna().all(axis=1) & y_test.notna()
X_test = X_test[_mask_test]
y_test = y_test[_mask_test]
_rows_dropped = _pre_drop - len(X_train)

_model = ${className}(${hyperparamStr})
_model.fit(X_train, y_train)
y_pred = _model.predict(X_test)

${metricsCode}

${featureImportanceCode}

_result = {
    "metrics": _metrics,
    "featureImportances": _feat_imp,
    "autoEncodedColumns": _auto_encoded_cols,
    "rowsDropped": int(_rows_dropped),
}
_result
`.trim();
  }

  /**
   * Build Python code for training a clustering model.
   */
  static buildClusteringCode(config: AlgorithmConfig): string {
    const importLine = SKLEARN_IMPORTS[config.type];
    const className = SKLEARN_CLASSES[config.type];
    const hyperparamStr = ModelTrainer.buildHyperparamString(config.hyperparameters);

    return `
import json as _json
import numpy as _np
${importLine}
from sklearn.metrics import silhouette_score

_non_numeric = df.select_dtypes(exclude=['number']).columns.tolist()
_auto_encoded_cols = []
if _non_numeric:
    import pandas as _pd
    _auto_encoded_cols = _non_numeric.copy()
    df = _pd.get_dummies(df, columns=_non_numeric, drop_first=True)

# Drop rows with NaN (safety net for datasets with missing values)
_pre_drop = len(df)
df = df.dropna()
_rows_dropped = _pre_drop - len(df)

_model = ${className}(${hyperparamStr})
_labels = _model.fit_predict(df)
_n_clusters = len(set(_labels)) - (1 if -1 in _labels else 0)

_metrics = {}
_metrics["nClusters"] = int(_n_clusters)
if _n_clusters >= 2 and _n_clusters < len(df):
    _metrics["silhouetteScore"] = float(silhouette_score(df, _labels))
if hasattr(_model, 'inertia_'):
    _metrics["inertia"] = float(_model.inertia_)

_result = {
    "metrics": _metrics,
    "featureImportances": None,
    "autoEncodedColumns": _auto_encoded_cols,
    "rowsDropped": int(_rows_dropped),
}
_result
`.trim();
  }

  // ============================================================
  // Private helpers
  // ============================================================

  private static buildHyperparamString(params: Record<string, number | string | boolean>): string {
    const entries = Object.entries(params);
    if (entries.length === 0) return '';
    return entries.map(([key, value]) => {
      if (typeof value === 'string') return `${key}="${value}"`;
      if (typeof value === 'boolean') return `${key}=${value ? 'True' : 'False'}`;
      return `${key}=${value}`;
    }).join(', ');
  }

  private static buildClassificationMetricsCode(algorithmType: AlgorithmType): string {
    // Check if the algorithm supports predict_proba for ROC AUC
    const supportsProba = ['logistic-regression', 'random-forest-classifier', 'knn-classifier'].includes(algorithmType);

    const rocAucPart = supportsProba
      ? `
try:
    if len(_unique_classes) == 2:
        _proba = _model.predict_proba(X_test)[:, 1]
        _metrics["rocAuc"] = float(roc_auc_score(y_test, _proba))
    else:
        _proba = _model.predict_proba(X_test)
        _metrics["rocAuc"] = float(roc_auc_score(y_test, _proba, multi_class="ovr", average="weighted"))
except Exception:
    pass`
      : '';

    return `
_unique_classes = sorted([str(c) for c in _np.unique(y_test)])
_cm = confusion_matrix(y_test, y_pred).tolist()
_average = "binary" if len(_unique_classes) == 2 else "weighted"
_metrics = {
    "accuracy": float(accuracy_score(y_test, y_pred)),
    "precision": float(precision_score(y_test, y_pred, average=_average, zero_division=0)),
    "recall": float(recall_score(y_test, y_pred, average=_average, zero_division=0)),
    "f1Score": float(f1_score(y_test, y_pred, average=_average, zero_division=0)),
    "confusionMatrix": _cm,
    "classLabels": _unique_classes,
}
${rocAucPart}`.trim();
  }

  private static buildRegressionMetricsCode(): string {
    return `
_metrics = {
    "r2": float(r2_score(y_test, y_pred)),
    "rmse": float(_np.sqrt(mean_squared_error(y_test, y_pred))),
    "mae": float(mean_absolute_error(y_test, y_pred)),
}`.trim();
  }

  private static buildFeatureImportanceCode(algorithmType: AlgorithmType): string {
    // Trees have feature_importances_, linear models have coef_
    const hasFeatureImportances = [
      'decision-tree-classifier', 'random-forest-classifier',
      'decision-tree-regressor', 'random-forest-regressor',
    ].includes(algorithmType);

    const hasCoef = [
      'logistic-regression', 'linear-regression', 'ridge-regression',
    ].includes(algorithmType);

    if (hasFeatureImportances) {
      return `
_feat_names = list(X_train.columns)
_importances = _model.feature_importances_
_feat_imp = [{"feature": _feat_names[i], "importance": float(_importances[i])} for i in range(len(_feat_names))]
_feat_imp.sort(key=lambda x: x["importance"], reverse=True)`.trim();
    }

    if (hasCoef) {
      return `
_feat_names = list(X_train.columns)
_coefs = _np.abs(_model.coef_).flatten() if _model.coef_.ndim > 1 else _np.abs(_model.coef_)
_feat_imp = [{"feature": _feat_names[i], "importance": float(_coefs[i])} for i in range(len(_feat_names))]
_feat_imp.sort(key=lambda x: x["importance"], reverse=True)`.trim();
    }

    // KNN and others don't have feature importance
    return '_feat_imp = None';
  }

  /**
   * Build human-readable Python code (for display, not execution).
   */
  private static buildReadableCode(
    config: AlgorithmConfig,
    targetColumn: string,
    projectType: ProjectType,
  ): string {
    const importLine = SKLEARN_IMPORTS[config.type];
    const className = SKLEARN_CLASSES[config.type];
    const hyperparamStr = ModelTrainer.buildHyperparamString(config.hyperparameters);
    const isClassification = projectType === 'klassifikation';

    const metricsImports = isClassification
      ? 'from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score'
      : 'from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error';

    const metricsCode = isClassification
      ? `accuracy = accuracy_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred, average="weighted")
print(f"Accuracy: {accuracy:.4f}")
print(f"F1-Score: {f1:.4f}")`
      : `r2 = r2_score(y_test, y_pred)
rmse = mean_squared_error(y_test, y_pred) ** 0.5
print(f"R²: {r2:.4f}")
print(f"RMSE: {rmse:.4f}")`;

    return `${importLine}
${metricsImports}

# Falls kein Train-Test-Split: automatisch 80/20 aufteilen
if 'df_train' not in dir():
    from sklearn.model_selection import train_test_split
    df_train, df_test = train_test_split(df, test_size=0.2, random_state=42)

# Features und Zielvariable trennen
X_train = df_train.drop(columns=["${targetColumn}"])
y_train = df_train["${targetColumn}"]
X_test = df_test.drop(columns=["${targetColumn}"])
y_test = df_test["${targetColumn}"]

# Kategoriale Spalten automatisch encodieren (One-Hot)
non_numeric = X_train.select_dtypes(exclude=['number']).columns.tolist()
if non_numeric:
    X_train = pd.get_dummies(X_train, columns=non_numeric, drop_first=True)
    X_test = pd.get_dummies(X_test, columns=non_numeric, drop_first=True)
    X_test = X_test.reindex(columns=X_train.columns, fill_value=0)

# Modell erstellen und trainieren
model = ${className}(${hyperparamStr})
model.fit(X_train, y_train)

# Vorhersagen auf Testdaten
y_pred = model.predict(X_test)

# Metriken berechnen
${metricsCode}`;
  }

  /**
   * Build human-readable clustering code (for display).
   */
  private static buildReadableClusteringCode(config: AlgorithmConfig): string {
    const importLine = SKLEARN_IMPORTS[config.type];
    const className = SKLEARN_CLASSES[config.type];
    const hyperparamStr = ModelTrainer.buildHyperparamString(config.hyperparameters);

    return `${importLine}
from sklearn.metrics import silhouette_score

# Kategoriale Spalten automatisch encodieren (One-Hot)
non_numeric = df.select_dtypes(exclude=['number']).columns.tolist()
if non_numeric:
    df = pd.get_dummies(df, columns=non_numeric, drop_first=True)

# Clustering-Modell erstellen und anwenden
model = ${className}(${hyperparamStr})
labels = model.fit_predict(df)

# Metriken berechnen
n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
if n_clusters >= 2:
    sil_score = silhouette_score(df, labels)
    print(f"Silhouette Score: {sil_score:.4f}")
print(f"Anzahl Cluster: {n_clusters}")`;
  }
}
