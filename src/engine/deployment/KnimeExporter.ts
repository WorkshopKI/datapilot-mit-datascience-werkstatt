/**
 * KnimeExporter – KNIME workflow export with Python Script nodes.
 *
 * Provides:
 * - buildKnimeGuide(): Mapping table DataPilot steps → KNIME nodes
 * - buildKnimeWorkflow(): ZIP Blob (.knwf) with Python Script nodes
 *
 * Strategy: Uses Python Script nodes (not native KNIME nodes) so the
 * already-generated Python code from pipeline steps and model training
 * can be injected directly. The guide shows native KNIME node equivalents
 * as a didactic reference.
 */

import JSZip from 'jszip';
import type {
  WorkspaceProject,
  TrainedModel,
  PipelineStep,
  PipelineStepType,
  AlgorithmType,
  ProjectType,
  MissingValuesConfig,
  OutlierRemovalConfig,
  EncodingConfig,
  ScalingConfig,
} from '../types';

/** A single row in the KNIME guide mapping table */
export interface KnimeGuideEntry {
  datapilotStep: string;
  knimeNode: string;
  knimeHint: string;
  phase: 'Daten' | 'Vorbereitung' | 'Modellierung' | 'Evaluation';
}

// ============================================================
// Node Mapping Data
// ============================================================

type StepMapper = (config: Record<string, unknown>) => { knimeNode: string; hint: string };

const STEP_NODE_MAP: Record<PipelineStepType, StepMapper> = {
  'missing-values': (config) => {
    const strategy = (config as { strategy?: string }).strategy ?? 'fill-mean';
    const strategyLabel: Record<string, string> = {
      'drop-rows': 'Remove rows',
      'fill-mean': 'Mean',
      'fill-median': 'Median',
      'fill-mode': 'Most frequent value',
      'fill-constant': 'Fixed value',
    };
    return {
      knimeNode: 'Missing Value',
      hint: `Strategy: ${strategyLabel[strategy] ?? strategy}`,
    };
  },
  'outlier-removal': (config) => {
    const method = (config as { method?: string }).method ?? 'iqr';
    if (method === 'zscore') {
      return { knimeNode: 'Rule-based Row Filter', hint: 'Z-Score Methode' };
    }
    return { knimeNode: 'Numeric Outliers', hint: 'IQR Methode' };
  },
  'encoding': (config) => {
    const method = (config as { method?: string }).method ?? 'one-hot';
    if (method === 'label') {
      return { knimeNode: 'Category To Number', hint: 'Label Encoding' };
    }
    return { knimeNode: 'One to Many', hint: 'One-Hot Encoding' };
  },
  'scaling': (config) => {
    const method = (config as { method?: string }).method ?? 'standard';
    if (method === 'minmax') {
      return { knimeNode: 'Normalizer', hint: 'Min-Max Skalierung (0–1)' };
    }
    return { knimeNode: 'Normalizer', hint: 'Z-Score Standardisierung' };
  },
  'feature-selection': () => ({
    knimeNode: 'Column Filter',
    hint: 'Spalten auswählen oder entfernen',
  }),
  'train-test-split': () => ({
    knimeNode: 'Partitioning',
    hint: 'Zufällige Aufteilung in Train/Test',
  }),
};

interface AlgorithmNodeInfo {
  learner: string;
  predictor: string;
  category: string;
}

const ALGORITHM_NODE_MAP: Record<AlgorithmType, AlgorithmNodeInfo> = {
  'logistic-regression': { learner: 'Logistic Regression Learner', predictor: 'Logistic Regression Predictor', category: 'Klassifikation' },
  'decision-tree-classifier': { learner: 'Decision Tree Learner', predictor: 'Decision Tree Predictor', category: 'Klassifikation' },
  'random-forest-classifier': { learner: 'Random Forest Learner', predictor: 'Random Forest Predictor', category: 'Klassifikation' },
  'knn-classifier': { learner: 'k-Nearest Neighbor Learner', predictor: 'k-Nearest Neighbor Predictor', category: 'Klassifikation' },
  'linear-regression': { learner: 'Linear Regression Learner', predictor: 'Regression Predictor', category: 'Regression' },
  'ridge-regression': { learner: 'Ridge Regression Learner', predictor: 'Regression Predictor', category: 'Regression' },
  'decision-tree-regressor': { learner: 'Decision Tree Learner', predictor: 'Decision Tree Predictor', category: 'Regression' },
  'random-forest-regressor': { learner: 'Random Forest Learner', predictor: 'Random Forest Predictor', category: 'Regression' },
  'kmeans': { learner: 'k-Means', predictor: 'Cluster Assigner', category: 'Clustering' },
  'dbscan': { learner: 'DBSCAN', predictor: 'Cluster Assigner', category: 'Clustering' },
};

const EVAL_NODE_MAP: Record<ProjectType, { node: string; hint: string }> = {
  'klassifikation': { node: 'Scorer', hint: 'Accuracy, Precision, Recall, F1' },
  'regression': { node: 'Numeric Scorer', hint: 'R², RMSE, MAE' },
  'clustering': { node: 'Silhouette Coefficient', hint: 'Silhouette Score, Cluster-Qualität' },
};

// ============================================================
// KnimeExporter Class
// ============================================================

export class KnimeExporter {
  /**
   * Build a mapping guide: DataPilot steps → KNIME node equivalents.
   */
  static buildKnimeGuide(
    project: WorkspaceProject,
    model: TrainedModel,
  ): KnimeGuideEntry[] {
    const entries: KnimeGuideEntry[] = [];

    // 1. CSV Reader (always first)
    entries.push({
      datapilotStep: 'Daten laden (CSV)',
      knimeNode: 'CSV Reader',
      knimeHint: 'Dateipfad konfigurieren, Trennzeichen prüfen',
      phase: 'Daten',
    });

    // 2. Pipeline steps
    const steps = project.pipelineSteps ?? [];
    for (const step of steps) {
      const mapper = STEP_NODE_MAP[step.type];
      if (mapper) {
        const { knimeNode, hint } = mapper(step.config as Record<string, unknown>);
        entries.push({
          datapilotStep: step.label,
          knimeNode,
          knimeHint: hint,
          phase: 'Vorbereitung',
        });
      }
    }

    // 3. Algorithm (Learner + Predictor)
    const algoInfo = ALGORITHM_NODE_MAP[model.algorithmType];
    if (algoInfo) {
      entries.push({
        datapilotStep: `${model.algorithmLabel} (Training)`,
        knimeNode: algoInfo.learner,
        knimeHint: `${algoInfo.category} – Modell trainieren`,
        phase: 'Modellierung',
      });
      entries.push({
        datapilotStep: `${model.algorithmLabel} (Vorhersage)`,
        knimeNode: algoInfo.predictor,
        knimeHint: `${algoInfo.category} – Vorhersage auf Testdaten`,
        phase: 'Modellierung',
      });
    }

    // 4. Evaluation
    const evalInfo = EVAL_NODE_MAP[project.type];
    if (evalInfo) {
      entries.push({
        datapilotStep: 'Evaluation',
        knimeNode: evalInfo.node,
        knimeHint: evalInfo.hint,
        phase: 'Evaluation',
      });
    }

    return entries;
  }

  /**
   * Build a KNIME .knwf workflow as a ZIP Blob.
   * Contains Python Script nodes with the actual generated code.
   */
  static async buildKnimeWorkflow(
    project: WorkspaceProject,
    model: TrainedModel,
  ): Promise<Blob> {
    const zip = new JSZip();
    const nodes = KnimeExporter.buildNodeList(project, model);

    // workflow.knime – main XML
    const workflowXml = KnimeExporter.buildWorkflowXml(project, nodes);
    zip.file('workflow.knime', workflowXml);

    // settings.xml per node
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const isFirstNode = i === 0;
      const settingsXml = KnimeExporter.buildNodeSettingsXml(node.name, node.pythonCode, isFirstNode);
      zip.file(`${node.folderName}/settings.xml`, settingsXml);
    }

    return zip.generateAsync({ type: 'blob' });
  }

  // ============================================================
  // Private: Node list builder
  // ============================================================

  private static buildNodeList(
    project: WorkspaceProject,
    model: TrainedModel,
  ): WorkflowNode[] {
    const nodes: WorkflowNode[] = [];
    let nodeId = 1;

    // Node 1: CSV Reader (Python Script)
    nodes.push({
      id: nodeId,
      name: 'CSV Reader',
      folderName: `CSV Reader (#${nodeId})`,
      pythonCode: 'import pandas as pd\n\ndf = pd.read_csv("daten.csv")\nprint(f"Datensatz geladen: {len(df)} Zeilen, {len(df.columns)} Spalten")\nprint(df.head())',
    });
    nodeId++;

    // Node 2: Data Preparation (if pipeline steps exist)
    const steps = project.pipelineSteps ?? [];
    if (steps.length > 0) {
      const prepCode = steps
        .map(step => `# ${step.label}\n${step.pythonCode}`)
        .join('\n\n');
      nodes.push({
        id: nodeId,
        name: 'Datenvorbereitung',
        folderName: `Datenvorbereitung (#${nodeId})`,
        pythonCode: `import pandas as pd\nimport numpy as np\nfrom sklearn.model_selection import train_test_split\n\n${prepCode}`,
      });
      nodeId++;
    }

    // Node 3: Model Training
    nodes.push({
      id: nodeId,
      name: 'Modelltraining',
      folderName: `Modelltraining (#${nodeId})`,
      pythonCode: model.pythonCode,
    });
    nodeId++;

    // Node 4: Evaluation
    const evalCode = KnimeExporter.buildEvaluationCode(project.type, model);
    nodes.push({
      id: nodeId,
      name: 'Evaluation',
      folderName: `Evaluation (#${nodeId})`,
      pythonCode: evalCode,
    });

    return nodes;
  }

  // ============================================================
  // Private: Evaluation code builder
  // ============================================================

  private static buildEvaluationCode(
    projectType: ProjectType,
    model: TrainedModel,
  ): string {
    if (projectType === 'klassifikation') {
      return `from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy:.4f}")
print("\\nClassification Report:")
print(classification_report(y_test, y_pred))
print("\\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))`;
    }

    if (projectType === 'regression') {
      return `from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
import numpy as np

y_pred = model.predict(X_test)
r2 = r2_score(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mae = mean_absolute_error(y_test, y_pred)
print(f"R²: {r2:.4f}")
print(f"RMSE: {rmse:.4f}")
print(f"MAE: {mae:.4f}")`;
    }

    // clustering
    return `from sklearn.metrics import silhouette_score

labels = model.labels_
silhouette = silhouette_score(df, labels)
n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
print(f"Anzahl Cluster: {n_clusters}")
print(f"Silhouette Score: {silhouette:.4f}")`;
  }

  // ============================================================
  // Private: XML builders
  // ============================================================

  private static buildWorkflowXml(
    project: WorkspaceProject,
    nodes: WorkflowNode[],
  ): string {
    const nodeConfigs = nodes.map((node, idx) => {
      const x = (node.id - 1) * 200 + 100;
      const y = 100;
      return `    <config key="node_${idx}">
      <entry key="id" type="xint" value="${node.id}"/>
      <entry key="node_settings_file" type="xstring" value="${escapeXml(node.folderName)}/settings.xml"/>
      <entry key="node_is_meta" type="xboolean" value="false"/>
      <entry key="node_type" type="xstring" value="NativeNode"/>
      <entry key="state" type="xstring" value="CONFIGURED"/>
      <entry key="ui_classname" type="xstring" value="org.knime.core.node.workflow.NodeUIInformation"/>
      <config key="ui_settings">
        <config key="extrainfo.node.bounds">
          <entry key="array-size" type="xint" value="4"/>
          <entry key="0" type="xint" value="${x}"/>
          <entry key="1" type="xint" value="${y}"/>
          <entry key="2" type="xint" value="80"/>
          <entry key="3" type="xint" value="44"/>
        </config>
      </config>
    </config>`;
    }).join('\n');

    const connectionConfigs = nodes.slice(1).map((node, i) => {
      const sourceId = nodes[i].id;
      return `    <config key="connection_${i}">
      <entry key="sourceID" type="xint" value="${sourceId}"/>
      <entry key="destID" type="xint" value="${node.id}"/>
      <entry key="sourcePort" type="xint" value="1"/>
      <entry key="destPort" type="xint" value="1"/>
    </config>`;
    }).join('\n');

    return `${KNIME_XML_HEADER}
<config${KNIME_NS} key="workflow.knime">
  <entry key="created_by" type="xstring" value="4.7.0"/>
  <entry key="version" type="xstring" value="4.1.0"/>
  <entry key="name" type="xstring" value="${escapeXml(project.name)}"/>
  <entry key="state" type="xstring" value="CONFIGURED"/>
  <config key="workflow_credentials"/>
  <config key="nodes">
${nodeConfigs}
  </config>
  <config key="connections">
${connectionConfigs}
  </config>
</config>
`;
  }

  private static buildNodeSettingsXml(
    nodeName: string,
    pythonCode: string,
    isFirstNode: boolean,
  ): string {
    // First node has no input table port (reads data from file);
    // other nodes have 1 input table port connected to the previous node.
    const inputTablePorts = isFirstNode
      ? ''
      : `
          <config key="port_0">
            <entry key="object_class" type="xstring" value="org.knime.core.node.BufferedDataTable"/>
          </config>`;

    return `${KNIME_XML_HEADER}
<config${KNIME_NS} key="settings.xml">
  <entry key="factory" type="xstring" value="${PYTHON_SCRIPT_FACTORY}"/>
  <entry key="node-name" type="xstring" value="${escapeXml(nodeName)}"/>
  <entry key="node_type" type="xstring" value="NativeNode"/>
  <entry key="node_is_meta" type="xboolean" value="false"/>
  <entry key="node-bundle-name" type="xstring" value="KNIME Python 3 - Scripting Nodes"/>
  <entry key="node-bundle-symbolic-name" type="xstring" value="org.knime.python3.scripting.nodes"/>
  <entry key="node-bundle-version" type="xstring" value="5.3.0.v202409121044"/>
  <entry key="node-bundle-vendor" type="xstring" value="KNIME AG, Zurich, Switzerland"/>
  <entry key="node-feature-name" type="xstring" value="KNIME Python Integration"/>
  <entry key="node-feature-symbolic-name" type="xstring" value="org.knime.features.python3.scripting.feature.group"/>
  <entry key="node-feature-version" type="xstring" value="5.3.0.v202409121044"/>
  <config key="factory_settings">
    <config key="node_creation_config">
      <config key="Input object (pickled)"/>
      <config key="Input table">${inputTablePorts}
      </config>
      <config key="Output table">
        <config key="port_0">
          <entry key="object_class" type="xstring" value="org.knime.core.node.BufferedDataTable"/>
        </config>
      </config>
      <config key="Output image"/>
      <config key="Output object (pickled)"/>
    </config>
  </config>
  <config key="internal_node_subsettings">
    <entry key="memory_policy" type="xstring" value="CacheSmallInMemory"/>
  </config>
  <config key="model">
    <entry key="python3_command" type="xstring" value=""/>
    <entry key="script" type="xstring" value="${escapeXml(pythonCode)}"/>
  </config>
  <entry key="hasContent" type="xboolean" value="false"/>
  <entry key="state" type="xstring" value="CONFIGURED"/>
  <config key="flow_stack"/>
</config>
`;
  }
}

// ============================================================
// Helpers
// ============================================================

interface WorkflowNode {
  id: number;
  name: string;
  folderName: string;
  pythonCode: string;
}

/** KNIME XMLConfig namespace header */
const KNIME_XML_HEADER = `<?xml version="1.0" encoding="UTF-8"?>`;
const KNIME_NS = ` xmlns="http://www.knime.org/2008/09/XMLConfig" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.knime.org/2008/09/XMLConfig http://www.knime.org/XMLConfig_2008_09.xsd"`;

const PYTHON_SCRIPT_FACTORY = 'org.knime.python3.scripting.nodes2.script.PythonScriptNodeFactory';

/** Escape special XML characters (including newlines for KNIME) */
function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '&#10;');
}
