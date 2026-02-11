/**
 * ModelDeployer – Prediction engine + code export builder.
 *
 * Provides:
 * - predict(): Run a single prediction using the trained model in Pyodide
 * - buildPythonScript(): Generate a standalone .py export
 * - buildNotebook(): Generate a Jupyter .ipynb export
 * - downloadFile(): Trigger a browser file download
 *
 * Architecture:
 * - Expects `_model`, `X_train` (and optionally `df_train`/`df_test`)
 *   to exist in the Pyodide worker (set during ModelTrainer.trainModel)
 * - For clustering, expects `_model` and `df` to exist
 */

import { PyodideManager } from '../pyodide/PyodideManager';
import type {
  WorkspaceProject,
  TrainedModel,
  ProjectType,
  PipelineStep,
} from '../types';

/** Result returned after a single prediction */
export interface PredictionResult {
  success: boolean;
  prediction: string | number;
  probabilities?: Record<string, number>;
  clusterLabel?: number;
  error?: string;
}

/** A single cell in the Jupyter notebook */
interface NotebookCell {
  cell_type: 'code' | 'markdown';
  metadata: Record<string, unknown>;
  source: string[];
  outputs?: unknown[];
  execution_count?: number | null;
  id?: string;
}

/** Jupyter notebook JSON structure */
interface NotebookDocument {
  nbformat: number;
  nbformat_minor: number;
  metadata: Record<string, unknown>;
  cells: NotebookCell[];
}

export class ModelDeployer {
  /**
   * Run a prediction using the currently trained model in Pyodide.
   * Expects `_model` and `X_train` to exist in the worker.
   */
  static async predict(
    inputValues: Record<string, number | string>,
    targetColumn: string,
    projectType: ProjectType,
  ): Promise<PredictionResult> {
    const manager = PyodideManager.getInstance();
    const state = manager.getState();

    if (!state.isReady) {
      throw new Error('Pyodide ist nicht initialisiert. Bitte zuerst die ML-Engine starten.');
    }

    const code = ModelDeployer.buildPredictionCode(inputValues, targetColumn, projectType);
    const execResult = await manager.runPython(code);

    if (!execResult.success) {
      return {
        success: false,
        prediction: '',
        error: execResult.error ?? 'Vorhersage fehlgeschlagen',
      };
    }

    const raw = execResult.result as Record<string, unknown>;
    if (!raw || typeof raw !== 'object') {
      return { success: false, prediction: '', error: 'Unerwartetes Ergebnis' };
    }

    const result: PredictionResult = {
      success: true,
      prediction: raw.prediction as string | number,
    };

    if (raw.probabilities) {
      result.probabilities = raw.probabilities as Record<string, number>;
    }

    if (raw.clusterLabel !== undefined) {
      result.clusterLabel = raw.clusterLabel as number;
    }

    return result;
  }

  /**
   * Generate a complete standalone Python script (.py) as a string.
   */
  static buildPythonScript(
    project: WorkspaceProject,
    model: TrainedModel,
  ): string {
    const isClustering = project.type === 'clustering';
    const date = new Date().toISOString().split('T')[0];
    const pipelineSteps = project.pipelineSteps ?? [];

    const sections: string[] = [];

    // Header comment
    sections.push(`# ${project.name}
# Generiert am: ${date}
# Projekttyp: ${ModelDeployer.getProjectTypeLabel(project.type)}
# Algorithmus: ${model.algorithmLabel}
${project.businessGoal ? `# Ziel: ${project.businessGoal}` : ''}
`);

    // Imports
    sections.push(`import pandas as pd
import numpy as np
${model.pythonCode.split('\\n').filter(line => line.startsWith('from sklearn') || line.startsWith('import sklearn')).join('\\n')}
from sklearn.model_selection import train_test_split
`);

    // Data loading
    sections.push(`# === Daten laden ===
df = pd.read_csv("daten.csv")
print(f"Datensatz: {len(df)} Zeilen, {len(df.columns)} Spalten")
`);

    // Pipeline steps
    if (pipelineSteps.length > 0) {
      sections.push(`# === Datenvorbereitung ===`);
      for (const step of pipelineSteps) {
        sections.push(ModelDeployer.buildReadableStepCode(step));
      }
      sections.push('');
    }

    // Model training
    sections.push(`# === Modelltraining ===
${model.pythonCode}
`);

    // Prediction function
    if (!isClustering) {
      sections.push(`# === Vorhersage-Funktion ===
def predict(input_data: dict):
    """Einzelne Vorhersage mit dem trainierten Modell."""
    df_input = pd.DataFrame([input_data])
    df_input = df_input[X_train.columns]
    prediction = model.predict(df_input)[0]
    result = {"prediction": prediction}
    if hasattr(model, 'predict_proba'):
        probabilities = model.predict_proba(df_input)[0]
        classes = [str(c) for c in model.classes_]
        result["probabilities"] = dict(zip(classes, probabilities.tolist()))
    return result

# Beispiel:
# result = predict({"feature1": 1.0, "feature2": 2.0})
# print(result)
`);
    }

    return sections.join('\n');
  }

  /**
   * Generate a Jupyter Notebook (.ipynb) as a JSON string.
   */
  static buildNotebook(
    project: WorkspaceProject,
    model: TrainedModel,
  ): string {
    const isClustering = project.type === 'clustering';
    const pipelineSteps = project.pipelineSteps ?? [];

    const cells: NotebookCell[] = [];
    let cellIndex = 0;

    const addMarkdown = (source: string) => {
      cells.push({
        cell_type: 'markdown',
        metadata: {},
        source: source.split('\n').map((line, i, arr) => i < arr.length - 1 ? line + '\n' : line),
        id: `cell-${cellIndex++}`,
      });
    };

    const addCode = (source: string) => {
      cells.push({
        cell_type: 'code',
        metadata: {},
        source: source.split('\n').map((line, i, arr) => i < arr.length - 1 ? line + '\n' : line),
        outputs: [],
        execution_count: null,
        id: `cell-${cellIndex++}`,
      });
    };

    // 1. Title
    addMarkdown(`# ${project.name}\n\n${project.description || 'Data Science Projekt'}\n\n**Projekttyp:** ${ModelDeployer.getProjectTypeLabel(project.type)}  \n**Algorithmus:** ${model.algorithmLabel}${project.businessGoal ? `  \n**Ziel:** ${project.businessGoal}` : ''}`);

    // 2. Imports
    addCode(`import pandas as pd\nimport numpy as np\nfrom sklearn.model_selection import train_test_split`);

    // 3. Data loading markdown
    addMarkdown(`## Daten laden`);

    // 4. Data loading code
    addCode(`df = pd.read_csv("daten.csv")\nprint(f"Datensatz: {len(df)} Zeilen, {len(df.columns)} Spalten")\ndf.head()`);

    // 5. Data preparation
    if (pipelineSteps.length > 0) {
      addMarkdown(`## Datenvorbereitung`);

      const prepCode = pipelineSteps
        .map(step => ModelDeployer.buildReadableStepCode(step))
        .join('\n\n');
      addCode(prepCode);
    }

    // 6. Modeling
    addMarkdown(`## Modelltraining`);
    addCode(model.pythonCode);

    // 7. Prediction
    if (!isClustering) {
      addMarkdown(`## Vorhersage`);
      addCode(`def predict(input_data: dict):\n    """Einzelne Vorhersage mit dem trainierten Modell."""\n    df_input = pd.DataFrame([input_data])\n    df_input = df_input[X_train.columns]\n    prediction = model.predict(df_input)[0]\n    print(f"Vorhersage: {prediction}")\n    return prediction\n\n# Beispiel:\n# predict({"feature1": 1.0, "feature2": 2.0})`);
    }

    const notebook: NotebookDocument = {
      nbformat: 4,
      nbformat_minor: 5,
      metadata: {
        kernelspec: {
          display_name: 'Python 3',
          language: 'python',
          name: 'python3',
        },
        language_info: {
          name: 'python',
          version: '3.10.0',
          mimetype: 'text/x-python',
          file_extension: '.py',
        },
      },
      cells,
    };

    return JSON.stringify(notebook, null, 2);
  }

  /**
   * Trigger a browser file download from a string.
   */
  static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    ModelDeployer.downloadBlob(blob, filename);
  }

  /**
   * Trigger a browser file download from a Blob (e.g. ZIP files).
   */
  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ============================================================
  // Code Builders (exposed for tests)
  // ============================================================

  /** Build Python code for a single prediction */
  static buildPredictionCode(
    inputValues: Record<string, number | string>,
    targetColumn: string,
    projectType: ProjectType,
  ): string {
    const isClustering = projectType === 'clustering';

    // Serialize input values as Python dict literal
    const inputEntries = Object.entries(inputValues).map(([key, value]) => {
      if (typeof value === 'string') return `"${key}": "${value}"`;
      return `"${key}": ${value}`;
    });
    const inputDictStr = `{${inputEntries.join(', ')}}`;

    if (isClustering) {
      return `
import pandas as _pd

_input = ${inputDictStr}
_df_input = _pd.DataFrame([_input])
_non_numeric_pred = _df_input.select_dtypes(exclude=['number']).columns.tolist()
if _non_numeric_pred:
    _df_input = _pd.get_dummies(_df_input, columns=_non_numeric_pred, drop_first=True)
_df_input = _df_input.reindex(columns=df.columns, fill_value=0)

_pred = _model.predict(_df_input)
_result = {"prediction": int(_pred[0]), "clusterLabel": int(_pred[0])}
_result
`.trim();
    }

    return `
import pandas as _pd

_input = ${inputDictStr}
_df_input = _pd.DataFrame([_input])
_non_numeric_pred = _df_input.select_dtypes(exclude=['number']).columns.tolist()
if _non_numeric_pred:
    _df_input = _pd.get_dummies(_df_input, columns=_non_numeric_pred, drop_first=True)
_df_input = _df_input.reindex(columns=X_train.columns, fill_value=0)

_pred = _model.predict(_df_input)
_result = {"prediction": float(_pred[0]) if hasattr(_pred[0], '__float__') else str(_pred[0])}

if hasattr(_model, 'predict_proba'):
    _proba = _model.predict_proba(_df_input)[0]
    _classes = [str(c) for c in _model.classes_]
    _result["probabilities"] = dict(zip(_classes, [float(p) for p in _proba]))

_result
`.trim();
  }

  // ============================================================
  // Private helpers
  // ============================================================

  /** Get human-readable project type label */
  private static getProjectTypeLabel(type: ProjectType): string {
    switch (type) {
      case 'klassifikation': return 'Klassifikation';
      case 'regression': return 'Regression';
      case 'clustering': return 'Clustering';
      default: return type;
    }
  }

  /** Build readable Python code for a pipeline step (for export, not execution) */
  private static buildReadableStepCode(step: PipelineStep): string {
    // Use the stored pythonCode from the step, but clean up internal variables
    return `# ${step.label}\n${step.pythonCode}`;
  }
}
