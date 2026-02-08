/**
 * SyntheticTwinGenerator – Generates a privacy-preserving synthetic copy of the
 * original dataset using Gaussian Copula (for correlated numerics) and proportional
 * resampling (for categoricals). Validates via KS-Test (scipy).
 */

import { SyntheticTwinConfig, SyntheticTwinData, SyntheticTwinValidation } from '../types';
import { PyodideManager } from '../pyodide/PyodideManager';

/** Statistical profile of a single column */
export interface ColumnProfileInfo {
  dtype: 'numeric' | 'categorical';
  mean?: number;
  std?: number;
  min?: number;
  max?: number;
  categories?: string[];
  frequencies?: number[];
}

/** Full statistical profile of the DataFrame */
export interface DataProfile {
  numericColumns: string[];
  categoricalColumns: string[];
  rowCount: number;
  correlationMatrix: number[][];
  columnProfiles: Record<string, ColumnProfileInfo>;
}

export class SyntheticTwinGenerator {
  /**
   * Generate a synthetic twin of the current DataFrame in Pyodide.
   * Expects `df` to exist in the Pyodide worker.
   * Loads scipy for KS-test validation.
   */
  static async generate(config: SyntheticTwinConfig): Promise<SyntheticTwinData> {
    const manager = PyodideManager.getInstance();
    const state = manager.getState();

    if (!state.isReady) {
      throw new Error('Pyodide ist nicht initialisiert. Bitte warten Sie, bis die Engine geladen ist.');
    }

    // scipy is needed for KS-test validation
    await manager.loadPackages(['scipy']);

    const code = this.buildGenerationCode(config);
    const result = await manager.runPython(code);

    if (!result.success) {
      throw new Error(`Synthetischer Zwilling fehlgeschlagen: ${result.error}`);
    }

    if (!result.result || typeof result.result !== 'object') {
      throw new Error('Unerwartetes Ergebnis vom synthetischen Zwilling.');
    }

    const data = result.result as {
      rows: Record<string, unknown>[];
      rowCount: number;
      columnNames: string[];
      validation: {
        ksTests: Record<string, { statistic: number; pValue: number }>;
        correlationDeviation: number;
        passed: boolean;
      };
    };

    return {
      rows: data.rows,
      rowCount: data.rowCount,
      columnNames: data.columnNames,
      generatedAt: new Date().toISOString(),
      config,
      validation: data.validation,
    };
  }

  /**
   * Extract a statistical profile of the current DataFrame in Pyodide.
   * Expects `df` to exist in the Pyodide worker.
   */
  static async extractProfile(): Promise<DataProfile> {
    const manager = PyodideManager.getInstance();
    const state = manager.getState();

    if (!state.isReady) {
      throw new Error('Pyodide ist nicht initialisiert.');
    }

    const code = `
import json
import numpy as np

numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
categorical_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()

column_profiles = {}
for col in numeric_cols:
    column_profiles[col] = {
        "dtype": "numeric",
        "mean": float(df[col].mean()),
        "std": float(df[col].std()),
        "min": float(df[col].min()),
        "max": float(df[col].max()),
    }
for col in categorical_cols:
    vc = df[col].value_counts()
    column_profiles[col] = {
        "dtype": "categorical",
        "categories": vc.index.astype(str).tolist(),
        "frequencies": vc.values.tolist(),
    }

corr_matrix = []
if len(numeric_cols) > 1:
    corr_matrix = df[numeric_cols].corr().values.tolist()

result = {
    "numericColumns": numeric_cols,
    "categoricalColumns": categorical_cols,
    "rowCount": len(df),
    "correlationMatrix": corr_matrix,
    "columnProfiles": column_profiles,
}
json.loads(json.dumps(result))
`;

    const result = await manager.runPython(code);

    if (!result.success) {
      throw new Error(`Profil-Extraktion fehlgeschlagen: ${result.error}`);
    }

    return result.result as DataProfile;
  }

  /**
   * Build the Python code for generating a synthetic twin + validation.
   * One single runPython call that produces generation + KS-test validation.
   */
  static buildGenerationCode(config: SyntheticTwinConfig): string {
    const { rowCount, randomSeed, preserveCorrelations } = config;

    return `
import json
import numpy as np
from scipy.stats import norm, ks_2samp

rng = np.random.default_rng(${randomSeed})

numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
categorical_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()
n_synthetic = ${rowCount}

df_synthetic_parts = {}

# --- Numeric columns ---
if len(numeric_cols) > 0:
${preserveCorrelations ? `\
    if len(numeric_cols) > 1:
        # Gaussian Copula: correlated normals -> inverse empirical CDF
        corr_matrix = df[numeric_cols].corr().values
        # Ensure positive semi-definite
        eigvals, eigvecs = np.linalg.eigh(corr_matrix)
        eigvals = np.maximum(eigvals, 1e-8)
        corr_psd = eigvecs @ np.diag(eigvals) @ eigvecs.T
        # Cholesky decomposition
        L = np.linalg.cholesky(corr_psd)
        # Generate correlated standard normals
        z = rng.standard_normal((n_synthetic, len(numeric_cols)))
        correlated = z @ L.T
        # Transform to uniform via normal CDF
        u = norm.cdf(correlated)
        # Inverse empirical CDF (quantile mapping)
        for i, col in enumerate(numeric_cols):
            sorted_vals = np.sort(df[col].dropna().values)
            indices = (u[:, i] * (len(sorted_vals) - 1)).astype(int)
            indices = np.clip(indices, 0, len(sorted_vals) - 1)
            df_synthetic_parts[col] = sorted_vals[indices]
    else:
        col = numeric_cols[0]
        sorted_vals = np.sort(df[col].dropna().values)
        u = rng.uniform(0, 1, n_synthetic)
        indices = (u * (len(sorted_vals) - 1)).astype(int)
        indices = np.clip(indices, 0, len(sorted_vals) - 1)
        df_synthetic_parts[col] = sorted_vals[indices]` : `\
    for col in numeric_cols:
        sorted_vals = np.sort(df[col].dropna().values)
        u = rng.uniform(0, 1, n_synthetic)
        indices = (u * (len(sorted_vals) - 1)).astype(int)
        indices = np.clip(indices, 0, len(sorted_vals) - 1)
        df_synthetic_parts[col] = sorted_vals[indices]`}

# --- Categorical columns ---
for col in categorical_cols:
    vc = df[col].value_counts(normalize=True)
    cats = vc.index.tolist()
    probs = vc.values.astype(float)
    probs = probs / probs.sum()
    df_synthetic_parts[col] = rng.choice(cats, size=n_synthetic, p=probs)

import pandas as pd
df_synthetic = pd.DataFrame(df_synthetic_parts)
# Preserve original column order
df_synthetic = df_synthetic[df.columns.tolist()]

# --- Validation ---
ks_tests = {}
for col in numeric_cols:
    stat, pvalue = ks_2samp(df[col].dropna().values, df_synthetic[col].values)
    ks_tests[col] = {"statistic": float(stat), "pValue": float(pvalue)}

corr_deviation = 0.0
if len(numeric_cols) > 1:
    corr_orig = df[numeric_cols].corr().values
    corr_syn = df_synthetic[numeric_cols].corr().values
    corr_deviation = float(np.max(np.abs(corr_orig - corr_syn)))

all_passed = all(v["pValue"] > 0.05 for v in ks_tests.values()) if ks_tests else True

result = {
    "rows": json.loads(df_synthetic.to_json(orient="records")),
    "rowCount": len(df_synthetic),
    "columnNames": df_synthetic.columns.tolist(),
    "validation": {
        "ksTests": ks_tests,
        "correlationDeviation": corr_deviation,
        "passed": bool(all_passed),
    },
}
json.loads(json.dumps(result))
`;
  }

  /**
   * Build Python code that runs only validation (KS-test) between df and df_synthetic.
   * Expects both `df` and `df_synthetic` to exist in the Pyodide worker.
   */
  static buildValidationCode(): string {
    return `
import json
import numpy as np
from scipy.stats import ks_2samp

numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()

ks_tests = {}
for col in numeric_cols:
    if col in df_synthetic.columns:
        stat, pvalue = ks_2samp(df[col].dropna().values, df_synthetic[col].values)
        ks_tests[col] = {"statistic": float(stat), "pValue": float(pvalue)}

corr_deviation = 0.0
if len(numeric_cols) > 1:
    shared_num = [c for c in numeric_cols if c in df_synthetic.columns]
    if len(shared_num) > 1:
        corr_orig = df[shared_num].corr().values
        corr_syn = df_synthetic[shared_num].corr().values
        corr_deviation = float(np.max(np.abs(corr_orig - corr_syn)))

all_passed = all(v["pValue"] > 0.05 for v in ks_tests.values()) if ks_tests else True

result = {
    "ksTests": ks_tests,
    "correlationDeviation": corr_deviation,
    "passed": bool(all_passed),
}
json.loads(json.dumps(result))
`;
  }
}
