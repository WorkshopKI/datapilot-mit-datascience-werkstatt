/**
 * DataAnalyzer – CSV parsing and data analysis via Pyodide (pandas).
 *
 * Runs all analysis in a single Pyodide call for efficiency.
 * Produces descriptive statistics, correlations, preview rows,
 * and column type classification.
 */

import { PyodideManager } from '../pyodide/PyodideManager';

/** Statistics for a single column */
export interface ColumnStatistics {
  name: string;
  dtype: string;
  count: number;
  missing: number;
  missingPercent: number;
  unique: number;
  // Numeric only
  mean?: number;
  std?: number;
  min?: number;
  max?: number;
  q25?: number;
  q50?: number;
  q75?: number;
  // Categorical only
  topValue?: string;
  topFrequency?: number;
}

/** Complete analysis result for a dataset */
export interface DataAnalysisResult {
  rowCount: number;
  columnCount: number;
  columns: ColumnStatistics[];
  correlations: Record<string, Record<string, number>>;
  preview: Record<string, unknown>[];
  columnNames: string[];
  numericColumns: string[];
  categoricalColumns: string[];
}

export class DataAnalyzer {
  /**
   * Parse CSV content and run full analysis in one Pyodide call.
   */
  static async analyzeCSV(csvContent: string): Promise<DataAnalysisResult> {
    const manager = PyodideManager.getInstance();
    const state = manager.getState();

    if (!state.isReady) {
      throw new Error(
        'Pyodide ist nicht initialisiert. Bitte zuerst die ML-Engine starten.',
      );
    }

    if (!csvContent.trim()) {
      throw new Error('CSV-Inhalt ist leer.');
    }

    const code = DataAnalyzer.buildAnalyzeCSVCode(csvContent);
    const execResult = await manager.runPython(code);

    if (!execResult.success) {
      throw new Error(
        `Analyse fehlgeschlagen: ${execResult.error ?? 'Unbekannter Fehler'}`,
      );
    }

    return DataAnalyzer.parseResult(execResult.result);
  }

  /**
   * Run analysis on already-loaded data (e.g. from DataGenerator).
   */
  static async analyzeDataFrame(
    rows: Record<string, unknown>[],
    columns: string[],
  ): Promise<DataAnalysisResult> {
    const manager = PyodideManager.getInstance();
    const state = manager.getState();

    if (!state.isReady) {
      throw new Error(
        'Pyodide ist nicht initialisiert. Bitte zuerst die ML-Engine starten.',
      );
    }

    if (!rows.length) {
      throw new Error('Keine Daten vorhanden.');
    }

    const dataJson = JSON.stringify(rows);
    const code = DataAnalyzer.buildAnalyzeDataFrameCode(dataJson, columns);
    const execResult = await manager.runPython(code);

    if (!execResult.success) {
      throw new Error(
        `Analyse fehlgeschlagen: ${execResult.error ?? 'Unbekannter Fehler'}`,
      );
    }

    return DataAnalyzer.parseResult(execResult.result);
  }

  /**
   * Build Python code for CSV analysis.
   * @internal Exposed for testing.
   */
  static buildAnalyzeCSVCode(csvContent: string): string {
    // Escape backslashes and triple-quotes in CSV content
    const escaped = csvContent
      .replace(/\\/g, '\\\\')
      .replace(/"""/g, '\\"\\"\\"');

    return `
import pandas as pd
import json
from io import StringIO

csv_data = """${escaped}"""
df = pd.read_csv(StringIO(csv_data))

${DataAnalyzer.ANALYSIS_CODE}
`.trim();
  }

  /**
   * Build Python code for DataFrame analysis from JSON rows.
   * @internal Exposed for testing.
   */
  static buildAnalyzeDataFrameCode(dataJson: string, columns: string[]): string {
    // Escape backslashes and quotes in JSON string
    const escaped = dataJson
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'");

    return `
import pandas as pd
import json

data = json.loads('${escaped}')
df = pd.DataFrame(data, columns=${JSON.stringify(columns)})

${DataAnalyzer.ANALYSIS_CODE}
`.trim();
  }

  /** Parse and validate the raw Pyodide result */
  private static parseResult(raw: unknown): DataAnalysisResult {
    const result = raw as DataAnalysisResult | null;

    if (
      !result ||
      typeof result.rowCount !== 'number' ||
      !Array.isArray(result.columns)
    ) {
      throw new Error('Unerwartetes Analyse-Ergebnis');
    }

    return result;
  }

  /** Shared Python analysis code (appended to both CSV and DataFrame variants) */
  private static readonly ANALYSIS_CODE = `
columns_info = []
for col in df.columns:
    info = {
        "name": col,
        "dtype": str(df[col].dtype),
        "count": int(df[col].count()),
        "missing": int(df[col].isnull().sum()),
        "missingPercent": round(float(df[col].isnull().mean() * 100), 2),
        "unique": int(df[col].nunique()),
    }
    if df[col].dtype in ['int64', 'float64', 'float32', 'int32']:
        desc = df[col].describe()
        info.update({
            "mean": round(float(desc['mean']), 4),
            "std": round(float(desc['std']), 4),
            "min": round(float(desc['min']), 4),
            "max": round(float(desc['max']), 4),
            "q25": round(float(desc['25%']), 4),
            "q50": round(float(desc['50%']), 4),
            "q75": round(float(desc['75%']), 4),
        })
    else:
        vc = df[col].value_counts()
        if len(vc) > 0:
            info["topValue"] = str(vc.index[0])
            info["topFrequency"] = int(vc.iloc[0])
    columns_info.append(info)

numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
corr = {}
if len(numeric_cols) > 1:
    corr_df = df[numeric_cols].corr()
    corr = json.loads(corr_df.to_json())

preview = json.loads(df.head(10).to_json(orient="records"))

result = {
    "rowCount": len(df),
    "columnCount": len(df.columns),
    "columns": columns_info,
    "correlations": corr,
    "preview": preview,
    "columnNames": list(df.columns),
    "numericColumns": numeric_cols,
    "categoricalColumns": df.select_dtypes(exclude=['number']).columns.tolist(),
}
result
`.trim();
}
