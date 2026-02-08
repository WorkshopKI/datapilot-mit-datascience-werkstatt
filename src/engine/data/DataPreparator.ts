/**
 * DataPreparator – Data preparation pipeline engine.
 *
 * Builds Python code for each pipeline step, executes it against
 * a DataFrame (`df`) living in the Pyodide worker, and returns
 * step results with summaries.
 *
 * Architecture:
 * - `df` is the working DataFrame in Pyodide (set during DataUnderstanding)
 * - `df_original` is a backup created by `initializePipeline()`
 * - Each step transforms `df` in place
 * - Undo = replay the whole pipeline from `df_original`
 */

import { PyodideManager } from '../pyodide/PyodideManager';
import type {
  PipelineStep,
  PreparedDataSummary,
  MissingValuesConfig,
  OutlierRemovalConfig,
  EncodingConfig,
  ScalingConfig,
  FeatureSelectionConfig,
  TrainTestSplitConfig,
} from '../types';

/** Result returned after executing a single pipeline step */
export interface StepExecutionResult {
  success: boolean;
  summary: string;
  dataSummary: PreparedDataSummary;
  preview: Record<string, unknown>[];
  error?: string;
}

/** Shared Python code appended after every step to build the result dict */
const SUMMARY_CODE = `
import json as _json
_numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
_cat_cols = df.select_dtypes(exclude=['number']).columns.tolist()
_has_split = 'df_train' in dir() and 'df_test' in dir()
_train_rows = len(df_train) if _has_split else None
_test_rows = len(df_test) if _has_split else None
_result = {
    "success": True,
    "summary": _summary,
    "dataSummary": {
        "rowCount": len(df),
        "columnCount": len(df.columns),
        "columnNames": list(df.columns),
        "numericColumns": _numeric_cols,
        "categoricalColumns": _cat_cols,
        "trainRows": _train_rows,
        "testRows": _test_rows,
        "hasSplit": _has_split,
    },
    "preview": _json.loads(df.head(5).to_json(orient="records")),
}
_result
`.trim();

export class DataPreparator {
  /**
   * Back up the current `df` as `df_original` and return the initial summary.
   * Must be called once before the first pipeline step.
   */
  static async initializePipeline(): Promise<PreparedDataSummary> {
    const manager = PyodideManager.getInstance();
    const state = manager.getState();

    if (!state.isReady) {
      throw new Error('Pyodide ist nicht initialisiert. Bitte zuerst die ML-Engine starten.');
    }

    const code = `
import json as _json
df_original = df.copy()
_numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
_cat_cols = df.select_dtypes(exclude=['number']).columns.tolist()
_result = {
    "rowCount": len(df),
    "columnCount": len(df.columns),
    "columnNames": list(df.columns),
    "numericColumns": _numeric_cols,
    "categoricalColumns": _cat_cols,
    "trainRows": None,
    "testRows": None,
    "hasSplit": False,
}
_result
`.trim();

    const execResult = await manager.runPython(code);

    if (!execResult.success) {
      throw new Error(`Pipeline-Initialisierung fehlgeschlagen: ${execResult.error ?? 'Unbekannter Fehler'}`);
    }

    return DataPreparator.parseSummary(execResult.result);
  }

  /**
   * Execute a single pipeline step on `df`.
   */
  static async applyStep(step: PipelineStep): Promise<StepExecutionResult> {
    const manager = PyodideManager.getInstance();
    const state = manager.getState();

    if (!state.isReady) {
      throw new Error('Pyodide ist nicht initialisiert. Bitte zuerst die ML-Engine starten.');
    }

    const stepCode = DataPreparator.buildStepCode(step);
    const fullCode = `${stepCode}\n${SUMMARY_CODE}`;

    const execResult = await manager.runPython(fullCode);

    if (!execResult.success) {
      return {
        success: false,
        summary: '',
        dataSummary: { rowCount: 0, columnCount: 0, columnNames: [], numericColumns: [], categoricalColumns: [], hasSplit: false },
        preview: [],
        error: execResult.error ?? 'Unbekannter Fehler',
      };
    }

    return DataPreparator.parseStepResult(execResult.result);
  }

  /**
   * Replay the entire pipeline from `df_original`.
   * Used for undo (remove a step and replay remaining ones).
   */
  static async replayPipeline(steps: PipelineStep[]): Promise<StepExecutionResult> {
    const manager = PyodideManager.getInstance();
    const state = manager.getState();

    if (!state.isReady) {
      throw new Error('Pyodide ist nicht initialisiert. Bitte zuerst die ML-Engine starten.');
    }

    // Reset df to df_original
    let code = 'df = df_original.copy()\n';

    // Clean up any previous split variables
    code += "if 'df_train' in dir(): del df_train\n";
    code += "if 'df_test' in dir(): del df_test\n";

    // Append each step
    if (steps.length === 0) {
      code += '_summary = "Pipeline zurückgesetzt"\n';
    } else {
      for (const step of steps) {
        code += DataPreparator.buildStepCode(step) + '\n';
      }
    }

    code += SUMMARY_CODE;

    const execResult = await manager.runPython(code);

    if (!execResult.success) {
      return {
        success: false,
        summary: '',
        dataSummary: { rowCount: 0, columnCount: 0, columnNames: [], numericColumns: [], categoricalColumns: [], hasSplit: false },
        preview: [],
        error: execResult.error ?? 'Unbekannter Fehler',
      };
    }

    return DataPreparator.parseStepResult(execResult.result);
  }

  /**
   * Query the current DataFrame summary without modifying it.
   */
  static async getDataSummary(): Promise<PreparedDataSummary> {
    const manager = PyodideManager.getInstance();
    const state = manager.getState();

    if (!state.isReady) {
      throw new Error('Pyodide ist nicht initialisiert. Bitte zuerst die ML-Engine starten.');
    }

    const code = `
import json as _json
_numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
_cat_cols = df.select_dtypes(exclude=['number']).columns.tolist()
_has_split = 'df_train' in dir() and 'df_test' in dir()
_result = {
    "rowCount": len(df),
    "columnCount": len(df.columns),
    "columnNames": list(df.columns),
    "numericColumns": _numeric_cols,
    "categoricalColumns": _cat_cols,
    "trainRows": len(df_train) if _has_split else None,
    "testRows": len(df_test) if _has_split else None,
    "hasSplit": _has_split,
}
_result
`.trim();

    const execResult = await manager.runPython(code);

    if (!execResult.success) {
      throw new Error(`Datenzusammenfassung fehlgeschlagen: ${execResult.error ?? 'Unbekannter Fehler'}`);
    }

    return DataPreparator.parseSummary(execResult.result);
  }

  // ============================
  // Code Builders (one per step type)
  // ============================

  /** @internal */
  static buildStepCode(step: PipelineStep): string {
    switch (step.type) {
      case 'missing-values':
        return DataPreparator.buildMissingValuesCode(step.config as MissingValuesConfig);
      case 'outlier-removal':
        return DataPreparator.buildOutlierRemovalCode(step.config as OutlierRemovalConfig);
      case 'encoding':
        return DataPreparator.buildEncodingCode(step.config as EncodingConfig);
      case 'scaling':
        return DataPreparator.buildScalingCode(step.config as ScalingConfig);
      case 'feature-selection':
        return DataPreparator.buildFeatureSelectionCode(step.config as FeatureSelectionConfig);
      case 'train-test-split':
        return DataPreparator.buildTrainTestSplitCode(step.config as TrainTestSplitConfig);
      default:
        throw new Error(`Unbekannter Step-Typ: ${step.type}`);
    }
  }

  /** @internal */
  static buildMissingValuesCode(config: MissingValuesConfig): string {
    const cols = config.columns.length > 0
      ? `[${config.columns.map(c => `"${c}"`).join(', ')}]`
      : 'df.columns[df.isnull().any()].tolist()';

    switch (config.strategy) {
      case 'drop-rows':
        return `_cols = ${cols}
_before = len(df)
df = df.dropna(subset=_cols)
_after = len(df)
_summary = f"{_before - _after} Zeilen mit fehlenden Werten entfernt"`;

      case 'fill-mean':
        return `_cols = ${cols}
_count = df[_cols].isnull().sum().sum()
for _c in _cols:
    if df[_c].dtype in ['int64', 'float64', 'float32', 'int32']:
        df[_c] = df[_c].fillna(df[_c].mean())
_summary = f"{int(_count)} fehlende Werte mit Mittelwert gefüllt"`;

      case 'fill-median':
        return `_cols = ${cols}
_count = df[_cols].isnull().sum().sum()
for _c in _cols:
    if df[_c].dtype in ['int64', 'float64', 'float32', 'int32']:
        df[_c] = df[_c].fillna(df[_c].median())
_summary = f"{int(_count)} fehlende Werte mit Median gefüllt"`;

      case 'fill-mode':
        return `_cols = ${cols}
_count = df[_cols].isnull().sum().sum()
for _c in _cols:
    _mode = df[_c].mode()
    if len(_mode) > 0:
        df[_c] = df[_c].fillna(_mode.iloc[0])
_summary = f"{int(_count)} fehlende Werte mit häufigstem Wert gefüllt"`;

      case 'fill-constant':
        return `_cols = ${cols}
_count = df[_cols].isnull().sum().sum()
df[_cols] = df[_cols].fillna("${config.fillValue ?? ''}")
_summary = f"{int(_count)} fehlende Werte mit Konstante gefüllt"`;

      default:
        throw new Error(`Unbekannte Missing-Values-Strategie: ${config.strategy}`);
    }
  }

  /** @internal */
  static buildOutlierRemovalCode(config: OutlierRemovalConfig): string {
    const cols = `[${config.columns.map(c => `"${c}"`).join(', ')}]`;

    if (config.method === 'zscore') {
      return `_cols = ${cols}
_threshold = ${config.threshold}
_before = len(df)
for _c in _cols:
    _mean = df[_c].mean()
    _std = df[_c].std()
    if _std > 0:
        df = df[(((df[_c] - _mean) / _std).abs()) <= _threshold]
_after = len(df)
_summary = f"{_before - _after} Ausreißer entfernt (Z-Score > {_threshold})"`;
    }

    // IQR method
    return `_cols = ${cols}
_factor = ${config.threshold}
_before = len(df)
for _c in _cols:
    _q1 = df[_c].quantile(0.25)
    _q3 = df[_c].quantile(0.75)
    _iqr = _q3 - _q1
    _lower = _q1 - _factor * _iqr
    _upper = _q3 + _factor * _iqr
    df = df[(df[_c] >= _lower) & (df[_c] <= _upper)]
_after = len(df)
_summary = f"{_before - _after} Ausreißer entfernt (IQR-Faktor {_factor})"`;
  }

  /** @internal */
  static buildEncodingCode(config: EncodingConfig): string {
    const cols = `[${config.columns.map(c => `"${c}"`).join(', ')}]`;

    if (config.method === 'one-hot') {
      const dropFirst = config.dropFirst ? 'True' : 'False';
      return `_cols = ${cols}
_before_cols = len(df.columns)
df = pd.get_dummies(df, columns=_cols, drop_first=${dropFirst})
_after_cols = len(df.columns)
_summary = f"One-Hot-Encoding: {_before_cols} → {_after_cols} Spalten"`;
    }

    // Label encoding
    return `_cols = ${cols}
from sklearn.preprocessing import LabelEncoder as _LE
_le = _LE()
for _c in _cols:
    df[_c] = _le.fit_transform(df[_c].astype(str))
_summary = f"Label-Encoding auf {len(_cols)} Spalte(n) angewendet"`;
  }

  /** @internal */
  static buildScalingCode(config: ScalingConfig): string {
    const cols = `[${config.columns.map(c => `"${c}"`).join(', ')}]`;

    if (config.method === 'standard') {
      return `_cols = ${cols}
from sklearn.preprocessing import StandardScaler as _SS
_scaler = _SS()
df[_cols] = _scaler.fit_transform(df[_cols])
_summary = f"StandardScaler auf {len(_cols)} Spalte(n) angewendet"`;
    }

    // MinMax
    return `_cols = ${cols}
from sklearn.preprocessing import MinMaxScaler as _MMS
_scaler = _MMS()
df[_cols] = _scaler.fit_transform(df[_cols])
_summary = f"MinMaxScaler auf {len(_cols)} Spalte(n) angewendet"`;
  }

  /** @internal */
  static buildFeatureSelectionCode(config: FeatureSelectionConfig): string {
    const cols = `[${config.columns.map(c => `"${c}"`).join(', ')}]`;

    if (config.method === 'drop-columns') {
      return `_cols = ${cols}
_before = len(df.columns)
df = df.drop(columns=_cols)
_after = len(df.columns)
_summary = f"{_before - _after} Spalte(n) entfernt"`;
    }

    // keep-columns
    return `_cols = ${cols}
_before = len(df.columns)
df = df[_cols]
_after = len(df.columns)
_summary = f"{_before - _after} Spalte(n) entfernt, {_after} behalten"`;
  }

  /** @internal */
  static buildTrainTestSplitCode(config: TrainTestSplitConfig): string {
    const stratifyPart = config.stratify
      ? `, stratify=df["${config.stratify}"]`
      : '';

    return `from sklearn.model_selection import train_test_split as _tts
_before = len(df)
df_train, df_test = _tts(df, test_size=${config.testSize}, random_state=${config.randomState}${stratifyPart})
_summary = f"Train-Test-Split: {len(df_train)} Train / {len(df_test)} Test"`;
  }

  // ============================
  // Private helpers
  // ============================

  private static parseSummary(raw: unknown): PreparedDataSummary {
    const result = raw as PreparedDataSummary | null;

    if (!result || typeof result.rowCount !== 'number' || !Array.isArray(result.columnNames)) {
      throw new Error('Unerwartetes Ergebnis bei Datenzusammenfassung');
    }

    return result;
  }

  private static parseStepResult(raw: unknown): StepExecutionResult {
    const result = raw as StepExecutionResult | null;

    if (!result || typeof result.success !== 'boolean') {
      throw new Error('Unerwartetes Step-Ergebnis');
    }

    return result;
  }
}
