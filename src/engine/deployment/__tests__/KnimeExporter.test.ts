import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { KnimeExporter } from '../KnimeExporter';
import type { KnimeGuideEntry } from '../KnimeExporter';
import { createMockModel, createMockProject } from '@/test/fixtures';
import type { AlgorithmType } from '../../types';

// --- Helpers ---

const makeModel = createMockModel;
const makeProject = createMockProject;

// ============================================================
// buildKnimeGuide Tests
// ============================================================

describe('KnimeExporter.buildKnimeGuide', () => {
  it('returns CSV Reader as the first entry', () => {
    const guide = KnimeExporter.buildKnimeGuide(makeProject(), makeModel());
    expect(guide[0].datapilotStep).toBe('Daten laden (CSV)');
    expect(guide[0].knimeNode).toBe('CSV Reader');
    expect(guide[0].phase).toBe('Daten');
  });

  it('maps missing-values step with fill-mean strategy', () => {
    const guide = KnimeExporter.buildKnimeGuide(makeProject(), makeModel());
    const entry = guide.find(e => e.datapilotStep.includes('Fehlende Werte'));
    expect(entry).toBeDefined();
    expect(entry!.knimeNode).toBe('Missing Value');
    expect(entry!.knimeHint).toContain('Mean');
  });

  it('maps missing-values step with drop-rows strategy', () => {
    const project = makeProject({
      pipelineSteps: [{
        id: 's1', type: 'missing-values', label: 'Zeilen entfernen',
        config: { strategy: 'drop-rows', columns: ['A'] },
        pythonCode: 'df.dropna()',
      }],
    });
    const guide = KnimeExporter.buildKnimeGuide(project, makeModel());
    const entry = guide.find(e => e.knimeNode === 'Missing Value');
    expect(entry!.knimeHint).toContain('Remove rows');
  });

  it('maps outlier-removal with IQR method', () => {
    const project = makeProject({
      pipelineSteps: [{
        id: 's1', type: 'outlier-removal', label: 'Outlier (IQR)',
        config: { method: 'iqr', threshold: 1.5, columns: ['Alter'] },
        pythonCode: '# iqr removal',
      }],
    });
    const guide = KnimeExporter.buildKnimeGuide(project, makeModel());
    const entry = guide.find(e => e.datapilotStep.includes('Outlier'));
    expect(entry!.knimeNode).toBe('Numeric Outliers');
  });

  it('maps outlier-removal with Z-Score method', () => {
    const project = makeProject({
      pipelineSteps: [{
        id: 's1', type: 'outlier-removal', label: 'Outlier (Z-Score)',
        config: { method: 'zscore', threshold: 3, columns: ['Alter'] },
        pythonCode: '# zscore removal',
      }],
    });
    const guide = KnimeExporter.buildKnimeGuide(project, makeModel());
    const entry = guide.find(e => e.datapilotStep.includes('Outlier'));
    expect(entry!.knimeNode).toBe('Rule-based Row Filter');
  });

  it('maps encoding step (one-hot)', () => {
    const project = makeProject({
      pipelineSteps: [{
        id: 's1', type: 'encoding', label: 'One-Hot Encoding',
        config: { method: 'one-hot', columns: ['Stadt'] },
        pythonCode: 'pd.get_dummies(df)',
      }],
    });
    const guide = KnimeExporter.buildKnimeGuide(project, makeModel());
    const entry = guide.find(e => e.datapilotStep.includes('One-Hot'));
    expect(entry!.knimeNode).toBe('One to Many');
  });

  it('maps encoding step (label)', () => {
    const project = makeProject({
      pipelineSteps: [{
        id: 's1', type: 'encoding', label: 'Label Encoding',
        config: { method: 'label', columns: ['Stadt'] },
        pythonCode: 'LabelEncoder()',
      }],
    });
    const guide = KnimeExporter.buildKnimeGuide(project, makeModel());
    const entry = guide.find(e => e.datapilotStep.includes('Label'));
    expect(entry!.knimeNode).toBe('Category To Number');
  });

  it('maps scaling step (standard)', () => {
    const guide = KnimeExporter.buildKnimeGuide(makeProject(), makeModel());
    const entry = guide.find(e => e.datapilotStep.includes('StandardScaler'));
    expect(entry!.knimeNode).toBe('Normalizer');
    expect(entry!.knimeHint).toContain('Z-Score');
  });

  it('maps scaling step (minmax)', () => {
    const project = makeProject({
      pipelineSteps: [{
        id: 's1', type: 'scaling', label: 'MinMax Scaling',
        config: { method: 'minmax', columns: ['Alter'] },
        pythonCode: 'MinMaxScaler()',
      }],
    });
    const guide = KnimeExporter.buildKnimeGuide(project, makeModel());
    const entry = guide.find(e => e.datapilotStep.includes('MinMax'));
    expect(entry!.knimeNode).toBe('Normalizer');
    expect(entry!.knimeHint).toContain('Min-Max');
  });

  it('maps feature-selection step', () => {
    const project = makeProject({
      pipelineSteps: [{
        id: 's1', type: 'feature-selection', label: 'Spalten entfernen',
        config: { method: 'drop-columns', columns: ['ID'] },
        pythonCode: 'df.drop(columns=["ID"])',
      }],
    });
    const guide = KnimeExporter.buildKnimeGuide(project, makeModel());
    const entry = guide.find(e => e.datapilotStep.includes('Spalten'));
    expect(entry!.knimeNode).toBe('Column Filter');
  });

  it('maps train-test-split step', () => {
    const guide = KnimeExporter.buildKnimeGuide(makeProject(), makeModel());
    const entry = guide.find(e => e.datapilotStep.includes('Train-Test-Split'));
    expect(entry!.knimeNode).toBe('Partitioning');
    expect(entry!.phase).toBe('Vorbereitung');
  });

  it('maps algorithm learner and predictor', () => {
    const guide = KnimeExporter.buildKnimeGuide(makeProject(), makeModel());
    const learner = guide.find(e => e.datapilotStep.includes('Training'));
    const predictor = guide.find(e => e.datapilotStep.includes('Vorhersage'));
    expect(learner).toBeDefined();
    expect(learner!.knimeNode).toBe('Random Forest Learner');
    expect(learner!.phase).toBe('Modellierung');
    expect(predictor).toBeDefined();
    expect(predictor!.knimeNode).toBe('Random Forest Predictor');
  });

  it('maps all 10 algorithm types correctly', () => {
    const algorithms: AlgorithmType[] = [
      'logistic-regression', 'decision-tree-classifier',
      'random-forest-classifier', 'knn-classifier',
      'linear-regression', 'ridge-regression',
      'decision-tree-regressor', 'random-forest-regressor',
      'kmeans', 'dbscan',
    ];

    for (const algo of algorithms) {
      const model = makeModel({ algorithmType: algo, algorithmLabel: algo });
      const guide = KnimeExporter.buildKnimeGuide(makeProject(), model);
      const learner = guide.find(e => e.datapilotStep.includes('Training'));
      expect(learner, `Expected learner entry for ${algo}`).toBeDefined();
    }
  });

  it('maps evaluation for classification', () => {
    const guide = KnimeExporter.buildKnimeGuide(makeProject(), makeModel());
    const evalEntry = guide.find(e => e.datapilotStep === 'Evaluation');
    expect(evalEntry!.knimeNode).toBe('Scorer');
    expect(evalEntry!.phase).toBe('Evaluation');
  });

  it('maps evaluation for regression', () => {
    const project = makeProject({ type: 'regression' });
    const guide = KnimeExporter.buildKnimeGuide(project, makeModel());
    const evalEntry = guide.find(e => e.datapilotStep === 'Evaluation');
    expect(evalEntry!.knimeNode).toBe('Numeric Scorer');
  });

  it('maps evaluation for clustering', () => {
    const project = makeProject({ type: 'clustering' });
    const model = makeModel({ algorithmType: 'kmeans', algorithmLabel: 'K-Means' });
    const guide = KnimeExporter.buildKnimeGuide(project, model);
    const evalEntry = guide.find(e => e.datapilotStep === 'Evaluation');
    expect(evalEntry!.knimeNode).toBe('Silhouette Coefficient');
  });

  it('does not duplicate train-test-split when it is a pipeline step', () => {
    const guide = KnimeExporter.buildKnimeGuide(makeProject(), makeModel());
    const splitEntries = guide.filter(e => e.knimeNode === 'Partitioning');
    expect(splitEntries).toHaveLength(1);
  });

  it('handles empty pipeline (only CSV + algo + eval)', () => {
    const project = makeProject({ pipelineSteps: [] });
    const guide = KnimeExporter.buildKnimeGuide(project, makeModel());
    // CSV Reader + Learner + Predictor + Evaluation = 4
    expect(guide).toHaveLength(4);
    expect(guide[0].knimeNode).toBe('CSV Reader');
    expect(guide[1].phase).toBe('Modellierung');
    expect(guide[3].phase).toBe('Evaluation');
  });
});

// ============================================================
// buildKnimeWorkflow Tests
// ============================================================

describe('KnimeExporter.buildKnimeWorkflow', () => {
  it('returns a Blob', async () => {
    const blob = await KnimeExporter.buildKnimeWorkflow(makeProject(), makeModel());
    expect(blob).toBeInstanceOf(Blob);
  });

  it('contains workflow.knime', async () => {
    const blob = await KnimeExporter.buildKnimeWorkflow(makeProject(), makeModel());
    const zip = await JSZip.loadAsync(blob);
    expect(zip.file('workflow.knime')).not.toBeNull();
  });

  it('workflow.knime starts with XML declaration and KNIME namespace', async () => {
    const blob = await KnimeExporter.buildKnimeWorkflow(makeProject(), makeModel());
    const zip = await JSZip.loadAsync(blob);
    const content = await zip.file('workflow.knime')!.async('string');
    expect(content).toMatch(/^<\?xml version="1\.0"/);
    expect(content).toContain('xmlns="http://www.knime.org/2008/09/XMLConfig"');
    expect(content).toContain('key="workflow.knime"');
    // Required by KNIME loader
    expect(content).toContain('workflow_credentials');
  });

  it('workflow.knime nodes have state entry', async () => {
    const blob = await KnimeExporter.buildKnimeWorkflow(makeProject(), makeModel());
    const zip = await JSZip.loadAsync(blob);
    const content = await zip.file('workflow.knime')!.async('string');
    const stateMatches = content.match(/key="state" type="xstring" value="CONFIGURED"/g);
    // 4 nodes + 1 workflow-level = 5 state entries
    expect(stateMatches).toHaveLength(5);
  });

  it('workflow.knime contains project name as entry', async () => {
    const blob = await KnimeExporter.buildKnimeWorkflow(makeProject(), makeModel());
    const zip = await JSZip.loadAsync(blob);
    const content = await zip.file('workflow.knime')!.async('string');
    expect(content).toContain('value="Testprojekt"');
  });

  it('has correct number of nodes with pipeline (4 nodes)', async () => {
    const blob = await KnimeExporter.buildKnimeWorkflow(makeProject(), makeModel());
    const zip = await JSZip.loadAsync(blob);
    const content = await zip.file('workflow.knime')!.async('string');
    // 4 nodes: CSV Reader, Datenvorbereitung, Modelltraining, Evaluation
    const nodeMatches = content.match(/<config key="node_/g);
    expect(nodeMatches).toHaveLength(4);
  });

  it('has correct number of connections (N-1)', async () => {
    const blob = await KnimeExporter.buildKnimeWorkflow(makeProject(), makeModel());
    const zip = await JSZip.loadAsync(blob);
    const content = await zip.file('workflow.knime')!.async('string');
    // 4 nodes → 3 connections
    const connMatches = content.match(/<config key="connection_/g);
    expect(connMatches).toHaveLength(3);
  });

  it('has 3 nodes without pipeline (CSV + Training + Eval)', async () => {
    const project = makeProject({ pipelineSteps: [] });
    const blob = await KnimeExporter.buildKnimeWorkflow(project, makeModel());
    const zip = await JSZip.loadAsync(blob);
    const content = await zip.file('workflow.knime')!.async('string');
    const nodeMatches = content.match(/<config key="node_/g);
    expect(nodeMatches).toHaveLength(3);
  });

  it('each node has a settings.xml folder', async () => {
    const blob = await KnimeExporter.buildKnimeWorkflow(makeProject(), makeModel());
    const zip = await JSZip.loadAsync(blob);
    const files = Object.keys(zip.files);

    expect(files.some(f => f.includes('CSV Reader (#1)/settings.xml'))).toBe(true);
    expect(files.some(f => f.includes('Datenvorbereitung (#2)/settings.xml'))).toBe(true);
    expect(files.some(f => f.includes('Modelltraining (#3)/settings.xml'))).toBe(true);
    expect(files.some(f => f.includes('Evaluation (#4)/settings.xml'))).toBe(true);
  });

  it('settings.xml contains Python code and KNIME XMLConfig format', async () => {
    const blob = await KnimeExporter.buildKnimeWorkflow(makeProject(), makeModel());
    const zip = await JSZip.loadAsync(blob);
    const csvSettings = await zip.file('CSV Reader (#1)/settings.xml')!.async('string');
    expect(csvSettings).toContain('pd.read_csv');
    expect(csvSettings).toMatch(/^<\?xml version="1\.0"/);
    expect(csvSettings).toContain('xmlns="http://www.knime.org/2008/09/XMLConfig"');
    expect(csvSettings).toContain('key="settings.xml"');
    expect(csvSettings).toContain('type="xstring"');
    expect(csvSettings).toContain('nodes2.script.PythonScriptNodeFactory');
    expect(csvSettings).toContain('<config key="factory_settings">');
    expect(csvSettings).toContain('node_creation_config');
    expect(csvSettings).toContain('memory_policy');
    // Node bundle metadata (required by KNIME loader)
    expect(csvSettings).toContain('node-bundle-name');
    expect(csvSettings).toContain('node-bundle-symbolic-name');
    expect(csvSettings).toContain('node-bundle-version');
    expect(csvSettings).toContain('node-bundle-vendor');
  });

  it('preparation node contains pipeline step code', async () => {
    const blob = await KnimeExporter.buildKnimeWorkflow(makeProject(), makeModel());
    const zip = await JSZip.loadAsync(blob);
    const prepSettings = await zip.file('Datenvorbereitung (#2)/settings.xml')!.async('string');
    expect(prepSettings).toContain('fillna');
    expect(prepSettings).toContain('StandardScaler');
  });

  it('training node contains model Python code', async () => {
    const blob = await KnimeExporter.buildKnimeWorkflow(makeProject(), makeModel());
    const zip = await JSZip.loadAsync(blob);
    const trainSettings = await zip.file('Modelltraining (#3)/settings.xml')!.async('string');
    expect(trainSettings).toContain('RandomForestClassifier');
  });

  it('evaluation node contains classification metrics code', async () => {
    const blob = await KnimeExporter.buildKnimeWorkflow(makeProject(), makeModel());
    const zip = await JSZip.loadAsync(blob);
    const evalSettings = await zip.file('Evaluation (#4)/settings.xml')!.async('string');
    expect(evalSettings).toContain('accuracy_score');
    expect(evalSettings).toContain('classification_report');
  });

  it('evaluation node contains regression metrics for regression project', async () => {
    const project = makeProject({ type: 'regression', pipelineSteps: [] });
    const model = makeModel({ algorithmType: 'linear-regression', algorithmLabel: 'Linear Regression' });
    const blob = await KnimeExporter.buildKnimeWorkflow(project, model);
    const zip = await JSZip.loadAsync(blob);
    // Without pipeline: CSV (#1), Training (#2), Eval (#3)
    const evalSettings = await zip.file('Evaluation (#3)/settings.xml')!.async('string');
    expect(evalSettings).toContain('r2_score');
    expect(evalSettings).toContain('mean_squared_error');
  });

  it('evaluation node contains clustering metrics for clustering project', async () => {
    const project = makeProject({ type: 'clustering', pipelineSteps: [] });
    const model = makeModel({ algorithmType: 'kmeans', algorithmLabel: 'K-Means' });
    const blob = await KnimeExporter.buildKnimeWorkflow(project, model);
    const zip = await JSZip.loadAsync(blob);
    const evalSettings = await zip.file('Evaluation (#3)/settings.xml')!.async('string');
    expect(evalSettings).toContain('silhouette_score');
  });

  it('XML-escapes special characters in project name', async () => {
    const project = makeProject({ name: 'Test & <Projekt>' });
    const blob = await KnimeExporter.buildKnimeWorkflow(project, makeModel());
    const zip = await JSZip.loadAsync(blob);
    const content = await zip.file('workflow.knime')!.async('string');
    expect(content).toContain('Test &amp; &lt;Projekt&gt;');
    expect(content).not.toContain('value="Test & <Projekt>"');
  });

  it('escapes newlines in Python code as &#10;', async () => {
    const blob = await KnimeExporter.buildKnimeWorkflow(makeProject(), makeModel());
    const zip = await JSZip.loadAsync(blob);
    const csvSettings = await zip.file('CSV Reader (#1)/settings.xml')!.async('string');
    // Python code has newlines, they should be escaped as &#10;
    expect(csvSettings).toContain('&#10;');
    // No raw newlines inside the value attribute
    expect(csvSettings).not.toMatch(/value="[^"]*\n[^"]*"/);
  });

  it('without pipeline, node numbering is consecutive (#1, #2, #3)', async () => {
    const project = makeProject({ pipelineSteps: [] });
    const blob = await KnimeExporter.buildKnimeWorkflow(project, makeModel());
    const zip = await JSZip.loadAsync(blob);
    const files = Object.keys(zip.files);
    expect(files.some(f => f.includes('#1'))).toBe(true);
    expect(files.some(f => f.includes('#2'))).toBe(true);
    expect(files.some(f => f.includes('#3'))).toBe(true);
    expect(files.some(f => f.includes('#4'))).toBe(false);
  });
});
