/**
 * DataGenerator – Generates synthetic datasets via Pyodide (sklearn).
 *
 * Uses sklearn's make_classification, make_regression, and make_blobs
 * to produce realistic learning datasets in the browser. Feature names
 * from the project definition are mapped onto generated columns.
 *
 * getPreviewData() remains as a synchronous mock fallback for quick
 * UI previews before Pyodide is loaded.
 */

import { Feature, ProjectType } from '../types';
import { PyodideManager } from '../pyodide/PyodideManager';

export interface GeneratedDataset {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  description: string;
}

export interface DataGeneratorConfig {
  type: ProjectType;
  rowCount: number;
  features: Feature[];
  noiseFactor?: number;   // 0.0 – 1.0, default 0.1
  randomSeed?: number;    // For reproducibility, default 42
}

// Mock datasets for quick preview (no Pyodide needed)
const MOCK_CHURN_DATA: Record<string, unknown>[] = [
  { Kunde_ID: 'K001', Alter: 35, Vertragslaufzeit_Monate: 24, Monatliche_Kosten: 79.99, Support_Tickets: 2, Churn: 'Nein' },
  { Kunde_ID: 'K002', Alter: 52, Vertragslaufzeit_Monate: 6, Monatliche_Kosten: 99.99, Support_Tickets: 8, Churn: 'Ja' },
  { Kunde_ID: 'K003', Alter: 28, Vertragslaufzeit_Monate: 48, Monatliche_Kosten: 49.99, Support_Tickets: 0, Churn: 'Nein' },
  { Kunde_ID: 'K004', Alter: 41, Vertragslaufzeit_Monate: 12, Monatliche_Kosten: 89.99, Support_Tickets: 5, Churn: 'Ja' },
  { Kunde_ID: 'K005', Alter: 63, Vertragslaufzeit_Monate: 36, Monatliche_Kosten: 59.99, Support_Tickets: 1, Churn: 'Nein' },
];

export class DataGenerator {
  /**
   * Generate a synthetic dataset via Pyodide (sklearn).
   * Requires Pyodide to be initialized first.
   */
  static async generate(config: DataGeneratorConfig): Promise<GeneratedDataset> {
    const manager = PyodideManager.getInstance();
    const state = manager.getState();

    if (!state.isReady) {
      throw new Error(
        'Pyodide ist nicht initialisiert. Bitte zuerst die ML-Engine starten.',
      );
    }

    // Prefetch Titanic CSV on main thread (open_url is blocked in module workers)
    let titanicCsv: string | undefined;
    if (config.type === 'klassifikation' && DataGenerator.isTitanicProject(config.features)) {
      const response = await fetch('/data/titanic.csv');
      titanicCsv = await response.text();
    }

    const code = DataGenerator.buildPythonCode(config, titanicCsv);
    const execResult = await manager.runPython(code);

    if (!execResult.success) {
      throw new Error(
        `Datengenerierung fehlgeschlagen: ${execResult.error ?? 'Unbekannter Fehler'}`,
      );
    }

    const result = execResult.result as {
      columns: string[];
      rows: Record<string, unknown>[];
      rowCount: number;
    };

    if (!result || !Array.isArray(result.columns) || !Array.isArray(result.rows)) {
      throw new Error('Unerwartetes Ergebnis der Datengenerierung');
    }

    const realLabel = DataGenerator.getRealDatasetLabel(config.features);
    const description = realLabel
      ? `${realLabel} mit ${result.rowCount} Zeilen`
      : {
          klassifikation: `Synthetischer Klassifikations-Datensatz mit ${result.rowCount} Zeilen`,
          regression: `Synthetischer Regressions-Datensatz mit ${result.rowCount} Zeilen`,
          clustering: `Synthetischer Clustering-Datensatz mit ${result.rowCount} Zeilen`,
        }[config.type];

    return {
      columns: result.columns,
      rows: result.rows,
      rowCount: result.rowCount,
      description: description ?? `Datensatz mit ${result.rowCount} Zeilen`,
    };
  }

  /**
   * Build the Python code string for data generation based on config.
   * @internal Exposed for testing.
   */
  static buildPythonCode(config: DataGeneratorConfig, titanicCsv?: string): string {
    const seed = config.randomSeed ?? 42;
    const noise = config.noiseFactor ?? 0.1;

    switch (config.type) {
      case 'klassifikation':
        return DataGenerator.buildClassificationCode(config, seed, noise, titanicCsv);
      case 'regression':
        return DataGenerator.buildRegressionCode(config, seed, noise);
      case 'clustering':
        return DataGenerator.buildClusteringCode(config, seed, noise);
      default:
        throw new Error(`Unbekannter Projekttyp: ${config.type}`);
    }
  }

  /**
   * Synchronous mock preview data (no Pyodide needed).
   */
  static getPreviewData(projectType: ProjectType): GeneratedDataset {
    switch (projectType) {
      case 'klassifikation':
        return {
          columns: ['Kunde_ID', 'Alter', 'Vertragslaufzeit_Monate', 'Monatliche_Kosten', 'Support_Tickets', 'Churn'],
          rows: MOCK_CHURN_DATA,
          rowCount: MOCK_CHURN_DATA.length,
          description: 'Kundenabwanderung (Churn) Beispieldaten',
        };
      case 'regression':
        return {
          columns: ['Quadratmeter', 'Zimmer', 'Baujahr', 'Stadtteil', 'Preis'],
          rows: [
            { Quadratmeter: 85, Zimmer: 3, Baujahr: 2010, Stadtteil: 'Zentrum', Preis: 320000 },
            { Quadratmeter: 120, Zimmer: 4, Baujahr: 2015, Stadtteil: 'Vorstadt', Preis: 450000 },
          ],
          rowCount: 2,
          description: 'Immobilienpreis Beispieldaten',
        };
      case 'clustering':
        return {
          columns: ['Kunde_ID', 'Jahresumsatz', 'Bestellhäufigkeit', 'Durchschnittlicher_Warenkorb'],
          rows: [
            { Kunde_ID: 'K001', Jahresumsatz: 5000, Bestellhäufigkeit: 12, Durchschnittlicher_Warenkorb: 416 },
            { Kunde_ID: 'K002', Jahresumsatz: 250, Bestellhäufigkeit: 2, Durchschnittlicher_Warenkorb: 125 },
          ],
          rowCount: 2,
          description: 'Kundensegmentierung Beispieldaten',
        };
      default:
        return { columns: [], rows: [], rowCount: 0, description: '' };
    }
  }

  /** Checks whether the features match a real dataset (Titanic/Iris). */
  static hasRealDataset(features: Feature[]): boolean {
    return DataGenerator.isTitanicProject(features) || DataGenerator.isIrisProject(features);
  }

  /** Returns a human-readable label, or undefined for generic projects. */
  static getRealDatasetLabel(features: Feature[]): string | undefined {
    if (DataGenerator.isTitanicProject(features)) return 'Titanic-Datensatz (echte Daten)';
    if (DataGenerator.isIrisProject(features)) return 'Iris-Datensatz (echte Daten)';
    return undefined;
  }

  // --- Private code builders ---

  private static getFeatureNames(features: Feature[], excludeTarget: boolean): string[] {
    const filtered = excludeTarget
      ? features.filter(f => !f.isTarget)
      : features;
    return filtered.map(f => f.name);
  }

  private static getTargetName(features: Feature[]): string {
    const target = features.find(f => f.isTarget);
    return target ? target.name : 'target';
  }

  private static sanitizePythonString(s: string): string {
    return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  private static toPythonList(items: string[]): string {
    const escaped = items.map(s => `"${DataGenerator.sanitizePythonString(s)}"`);
    return `[${escaped.join(', ')}]`;
  }

  /** Detect Titanic-like project by feature names */
  private static isTitanicProject(features: Feature[]): boolean {
    const names = features.map(f => f.name);
    return names.some(n => n === 'Pclass' || n === 'Survived' || n === 'Embarked');
  }

  /** Detect Iris-like project by feature names */
  private static isIrisProject(features: Feature[]): boolean {
    const names = features.map(f => f.name);
    return names.some(n => n.includes('Sepal') || n.includes('Petal'));
  }

  private static buildTitanicCode(config: DataGeneratorConfig, seed: number, csvContent?: string): string {
    const rowCount = config.rowCount || 891;
    // Escape backslashes and triple-quotes in CSV content (same pattern as DataAnalyzer)
    const escaped = (csvContent ?? '')
      .replace(/\\/g, '\\\\')
      .replace(/"""/g, '\\"\\"\\"');

    return `
import pandas as pd
from io import StringIO
import json

csv_data = """${escaped}"""
df = pd.read_csv(StringIO(csv_data))

# Shuffle für Varianz
df = df.sample(frac=1, random_state=${seed}).reset_index(drop=True)
df = df.head(${rowCount})

result = {
    "columns": df.columns.tolist(),
    "rows": json.loads(df.to_json(orient='records')),
    "rowCount": len(df)
}
result
`.trim();
  }

  private static buildIrisCode(config: DataGeneratorConfig, seed: number): string {
    const rowCount = config.rowCount || 150;
    return `
import pandas as pd
from sklearn.datasets import load_iris
import json

iris = load_iris()
df = pd.DataFrame(iris.data, columns=['SepalLength', 'SepalWidth', 'PetalLength', 'PetalWidth'])
df['Species'] = pd.Series(iris.target).map({0: 'setosa', 1: 'versicolor', 2: 'virginica'})
# Shuffle
df = df.sample(frac=1, random_state=${seed}).reset_index(drop=True)
df = df.head(${rowCount})

result = {
    "columns": df.columns.tolist(),
    "rows": json.loads(df.to_json(orient="records")),
    "rowCount": len(df)
}
result
`.trim();
  }

  private static buildClassificationCode(
    config: DataGeneratorConfig,
    seed: number,
    noise: number,
    titanicCsv?: string,
  ): string {
    // Route to specialized builders for known datasets
    if (DataGenerator.isTitanicProject(config.features)) {
      return DataGenerator.buildTitanicCode(config, seed, titanicCsv);
    }
    if (DataGenerator.isIrisProject(config.features)) {
      return DataGenerator.buildIrisCode(config, seed);
    }

    const featureNames = DataGenerator.getFeatureNames(config.features, true);
    const targetName = DataGenerator.getTargetName(config.features);
    const nFeatures = Math.max(featureNames.length, 2);
    const nInformative = Math.max(Math.round(nFeatures * 0.7), 1);
    const nRedundant = Math.min(Math.round(nFeatures * 0.1), nFeatures - nInformative);
    const flipY = Math.min(Math.max(noise, 0), 0.5);
    // n_classes * n_clusters_per_class must be <= 2^n_informative
    const nClustersPerClass = Math.pow(2, nInformative) >= 4 ? 2 : 1;

    return `
import pandas as pd
from sklearn.datasets import make_classification
import json

X, y = make_classification(
    n_samples=${config.rowCount},
    n_features=${nFeatures},
    n_informative=${nInformative},
    n_redundant=${nRedundant},
    n_clusters_per_class=${nClustersPerClass},
    flip_y=${flipY},
    random_state=${seed}
)

columns = ${DataGenerator.toPythonList(featureNames.slice(0, nFeatures))}
# Pad column names if fewer feature names than generated features
while len(columns) < ${nFeatures}:
    columns.append(f"Feature_{len(columns) + 1}")

df = pd.DataFrame(X, columns=columns[:${nFeatures}])
df["${DataGenerator.sanitizePythonString(targetName)}"] = y

result = {
    "columns": list(df.columns),
    "rows": json.loads(df.to_json(orient="records")),
    "rowCount": len(df)
}
result
`.trim();
  }

  private static buildRegressionCode(
    config: DataGeneratorConfig,
    seed: number,
    noise: number,
  ): string {
    const featureNames = DataGenerator.getFeatureNames(config.features, true);
    const targetName = DataGenerator.getTargetName(config.features);
    const nFeatures = Math.max(featureNames.length, 2);
    const nInformative = Math.max(Math.round(nFeatures * 0.7), 1);
    // noise scales from 0 to 50 for regression
    const regressionNoise = noise * 50;

    return `
import pandas as pd
from sklearn.datasets import make_regression
import json

X, y = make_regression(
    n_samples=${config.rowCount},
    n_features=${nFeatures},
    n_informative=${nInformative},
    noise=${regressionNoise},
    random_state=${seed}
)

columns = ${DataGenerator.toPythonList(featureNames.slice(0, nFeatures))}
while len(columns) < ${nFeatures}:
    columns.append(f"Feature_{len(columns) + 1}")

df = pd.DataFrame(X, columns=columns[:${nFeatures}])
df["${DataGenerator.sanitizePythonString(targetName)}"] = y

result = {
    "columns": list(df.columns),
    "rows": json.loads(df.to_json(orient="records")),
    "rowCount": len(df)
}
result
`.trim();
  }

  private static buildClusteringCode(
    config: DataGeneratorConfig,
    seed: number,
    noise: number,
  ): string {
    const featureNames = DataGenerator.getFeatureNames(config.features, true);
    const nFeatures = Math.max(featureNames.length, 2);
    const centers = 3;
    // cluster_std scales from 0.5 to 3.0
    const clusterStd = 0.5 + noise * 2.5;

    return `
import pandas as pd
from sklearn.datasets import make_blobs
import json

X, y = make_blobs(
    n_samples=${config.rowCount},
    n_features=${nFeatures},
    centers=${centers},
    cluster_std=${clusterStd},
    random_state=${seed}
)

columns = ${DataGenerator.toPythonList(featureNames.slice(0, nFeatures))}
while len(columns) < ${nFeatures}:
    columns.append(f"Feature_{len(columns) + 1}")

df = pd.DataFrame(X, columns=columns[:${nFeatures}])
df["Cluster"] = y

result = {
    "columns": list(df.columns),
    "rows": json.loads(df.to_json(orient="records")),
    "rowCount": len(df)
}
result
`.trim();
  }
}
