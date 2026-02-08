// Deployment Phase – Model Testing, Code Export, Project Summary
import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Rocket, Loader2, Info, AlertCircle, Brain,
  Play, Download, FileCode, FileText, Code,
  CheckCircle2, ClipboardList, ChevronDown, ChevronUp,
} from 'lucide-react';
import { GlossaryLink } from '../GlossaryLink';
import { ModelDeployer } from '@/engine/deployment/ModelDeployer';
import type { PredictionResult } from '@/engine/deployment/ModelDeployer';
import type { WorkspaceProject, TrainedModel } from '@/engine/types';

interface DeploymentProps {
  project: WorkspaceProject;
  onUpdateProject: (updates: Partial<WorkspaceProject>) => void;
}

export function Deployment({ project, onUpdateProject }: DeploymentProps) {
  const trainedModels = project.trainedModels ?? [];
  const selectedModel = useMemo(
    () => trainedModels.find(m => m.id === project.selectedModelId) ?? trainedModels[0],
    [trainedModels, project.selectedModelId],
  );

  // --- No models state ---
  if (trainedModels.length === 0 || !selectedModel) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto p-4 rounded-full bg-muted w-fit">
              <Rocket className="h-10 w-10 text-muted-foreground" />
            </div>
            <CardTitle>Deployment</CardTitle>
            <p className="text-muted-foreground">
              Trainiere zuerst mindestens ein Modell in der{' '}
              <span className="font-medium">Modeling</span>-Phase und wähle es in der{' '}
              <span className="font-medium">Evaluation</span>-Phase aus, um es hier zu testen und zu exportieren.
            </p>
          </CardHeader>
        </Card>
        <GlossaryTermsCard />
      </div>
    );
  }

  const isClustering = project.type === 'clustering';

  return (
    <div className="space-y-4">
      {/* Model Summary */}
      <ModelSummaryCard model={selectedModel} projectType={project.type} />

      {/* Tabs */}
      <Tabs defaultValue="testen">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="testen" className="gap-1">
            <Play className="h-3.5 w-3.5" />
            Modell testen
          </TabsTrigger>
          <TabsTrigger value="exportieren" className="gap-1">
            <Download className="h-3.5 w-3.5" />
            Code exportieren
          </TabsTrigger>
          <TabsTrigger value="zusammenfassung" className="gap-1">
            <ClipboardList className="h-3.5 w-3.5" />
            Zusammenfassung
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Model Testing */}
        <TabsContent value="testen">
          <PredictionPanel
            project={project}
            model={selectedModel}
            isClustering={isClustering}
          />
        </TabsContent>

        {/* Tab 2: Code Export */}
        <TabsContent value="exportieren">
          <CodeExportPanel project={project} model={selectedModel} />
        </TabsContent>

        {/* Tab 3: Summary */}
        <TabsContent value="zusammenfassung">
          <ProjectSummaryPanel project={project} model={selectedModel} />
        </TabsContent>
      </Tabs>

      {/* Tutor Tip */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-orange-800 mb-1">Tipp: Deployment</p>
            <p className="text-orange-700">
              Im echten{' '}
              <GlossaryLink term="Deployment" termId="deployment">Deployment</GlossaryLink>{' '}
              wird das Modell in eine Produktionsumgebung integriert. Dabei ist{' '}
              <GlossaryLink term="Monitoring" termId="monitoring">Monitoring</GlossaryLink>{' '}
              wichtig, um die{' '}
              <GlossaryLink term="Modellperformance" termId="modellperformance">Modellperformance</GlossaryLink>{' '}
              zu überwachen. Achte auf{' '}
              <GlossaryLink term="Data Drift" termId="data-drift">Data Drift</GlossaryLink>{' '}
              – wenn sich die Daten über die Zeit verändern, kann die Vorhersagequalität sinken.
            </p>
          </div>
        </div>
      </div>

      <GlossaryTermsCard />
    </div>
  );
}

// =============================================
// Model Summary Card
// =============================================

function ModelSummaryCard({ model, projectType }: { model: TrainedModel; projectType: string }) {
  const mainMetric = projectType === 'klassifikation'
    ? `Accuracy: ${((model.metrics.accuracy ?? 0) * 100).toFixed(1)}%`
    : projectType === 'regression'
    ? `R²: ${(model.metrics.r2 ?? 0).toFixed(4)}`
    : `Silhouette: ${(model.metrics.silhouetteScore ?? 0).toFixed(4)}`;

  const trainedDate = new Date(model.trainedAt).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className="border-orange-200 bg-orange-50/30">
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-orange-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">{model.algorithmLabel}</span>
              <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                {mainMetric}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
              <span>Trainiert: {trainedDate}</span>
              <span>
                Dauer: {model.trainingDurationMs < 1000
                  ? `${model.trainingDurationMs}ms`
                  : `${(model.trainingDurationMs / 1000).toFixed(1)}s`}
              </span>
            </div>
          </div>
          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================
// Prediction Panel
// =============================================

function PredictionPanel({ project, model, isClustering }: {
  project: WorkspaceProject;
  model: TrainedModel;
  isClustering: boolean;
}) {
  // Get feature columns (columns used for training, excluding target)
  const featureColumns = useMemo(() => {
    const allColumns = project.preparedDataSummary?.columnNames ?? [];
    if (isClustering) return allColumns;
    const target = model.targetColumn || project.targetColumn || '';
    return allColumns.filter(col => col !== target);
  }, [project, model, isClustering]);

  const [inputValues, setInputValues] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    for (const col of featureColumns) {
      defaults[col] = '';
    }
    return defaults;
  });

  const [predicting, setPredicting] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = useCallback(async () => {
    setPredicting(true);
    setResult(null);
    setError(null);

    try {
      // Convert string inputs to numbers where possible
      const parsedValues: Record<string, number | string> = {};
      for (const [key, value] of Object.entries(inputValues)) {
        const num = Number(value);
        parsedValues[key] = isNaN(num) || value.trim() === '' ? value : num;
      }

      const targetColumn = model.targetColumn || project.targetColumn || '';
      const predResult = await ModelDeployer.predict(
        parsedValues,
        targetColumn,
        project.type,
      );

      setResult(predResult);
      if (!predResult.success) {
        setError(predResult.error ?? 'Vorhersage fehlgeschlagen');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
    setPredicting(false);
  }, [inputValues, model, project]);

  const allFilled = featureColumns.every(col => inputValues[col]?.trim() !== '');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Play className="h-4 w-4" />
            Eingabewerte
          </CardTitle>
        </CardHeader>
        <CardContent>
          {featureColumns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Keine Feature-Spalten verfügbar. Bitte überprüfe die Datenvorbereitung.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featureColumns.map(col => (
                <div key={col}>
                  <Label className="text-sm">{col}</Label>
                  <Input
                    className="mt-1"
                    placeholder={`Wert für ${col}`}
                    value={inputValues[col] ?? ''}
                    onChange={(e) => setInputValues(prev => ({
                      ...prev,
                      [col]: e.target.value,
                    }))}
                    disabled={predicting}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center mt-4">
            <Button
              onClick={handlePredict}
              disabled={predicting || !allFilled || featureColumns.length === 0}
              className="gap-2 px-6 bg-orange-500 hover:bg-orange-600"
            >
              {predicting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Berechne Vorhersage...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  Vorhersage berechnen
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && result.success && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-4 pb-3 px-4 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">Vorhersage</span>
            </div>

            <div className="text-3xl font-bold text-gray-900">
              {isClustering
                ? `Cluster ${result.clusterLabel ?? result.prediction}`
                : String(result.prediction)}
            </div>

            {/* Probabilities */}
            {result.probabilities && (
              <div className="space-y-1.5 mt-3">
                <div className="text-xs font-medium text-muted-foreground">Wahrscheinlichkeiten:</div>
                {Object.entries(result.probabilities)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cls, prob]) => (
                    <div key={cls} className="flex items-center gap-2">
                      <div className="w-16 text-xs font-mono text-right shrink-0">
                        Klasse {cls}
                      </div>
                      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full transition-all"
                          style={{ width: `${prob * 100}%` }}
                        />
                      </div>
                      <div className="w-14 text-xs text-muted-foreground text-right shrink-0">
                        {(prob * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// =============================================
// Code Export Panel
// =============================================

function CodeExportPanel({ project, model }: {
  project: WorkspaceProject;
  model: TrainedModel;
}) {
  const [showPyPreview, setShowPyPreview] = useState(false);
  const [showNbPreview, setShowNbPreview] = useState(false);

  const pythonScript = useMemo(
    () => ModelDeployer.buildPythonScript(project, model),
    [project, model],
  );

  const handleDownloadPy = useCallback(() => {
    const filename = `${project.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.py`;
    ModelDeployer.downloadFile(pythonScript, filename, 'text/x-python');
  }, [pythonScript, project.name]);

  const handleDownloadNotebook = useCallback(() => {
    const nbContent = ModelDeployer.buildNotebook(project, model);
    const filename = `${project.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.ipynb`;
    ModelDeployer.downloadFile(nbContent, filename, 'application/json');
  }, [project, model]);

  return (
    <div className="space-y-4">
      {/* Python Script Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Python-Script (.py)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Vollständiges Python-Script mit Datenvorbereitung, Training und Vorhersage-Funktion.
            Kann direkt in einer Python-Umgebung ausgeführt werden.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={handleDownloadPy} className="gap-2 bg-orange-500 hover:bg-orange-600">
              <Download className="h-4 w-4" />
              Download .py
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPyPreview(!showPyPreview)}
              className="gap-2"
            >
              <Code className="h-4 w-4" />
              {showPyPreview ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
              {showPyPreview ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>
          {showPyPreview && (
            <pre className="mt-3 bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-xs font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
              <code>{pythonScript}</code>
            </pre>
          )}
        </CardContent>
      </Card>

      {/* Jupyter Notebook Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Jupyter Notebook (.ipynb)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Interaktives Notebook mit Markdown-Erklärungen und Code-Zellen.
            Ideal zum Nacharbeiten in Jupyter Lab, Google Colab oder VS Code.
          </p>
          <Button onClick={handleDownloadNotebook} className="gap-2 bg-orange-500 hover:bg-orange-600">
            <Download className="h-4 w-4" />
            Download .ipynb
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================
// Project Summary Panel
// =============================================

function ProjectSummaryPanel({ project, model }: {
  project: WorkspaceProject;
  model: TrainedModel;
}) {
  const pipelineSteps = project.pipelineSteps ?? [];
  const phases = project.phases ?? [];
  const completedPhases = phases.filter(p => p.status === 'completed');

  const typeLabel = project.type === 'klassifikation'
    ? 'Klassifikation'
    : project.type === 'regression'
    ? 'Regression'
    : 'Clustering';

  const mainMetricLabel = project.type === 'klassifikation'
    ? `Accuracy: ${((model.metrics.accuracy ?? 0) * 100).toFixed(1)}%`
    : project.type === 'regression'
    ? `R²: ${(model.metrics.r2 ?? 0).toFixed(4)}`
    : `Silhouette: ${(model.metrics.silhouetteScore ?? 0).toFixed(4)}`;

  // Top 3 feature importances
  const topFeatures = (model.featureImportances ?? []).slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Project Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Projekt-Steckbrief</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Projektname</dt>
              <dd className="font-medium">{project.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Projekttyp</dt>
              <dd><Badge variant="secondary">{typeLabel}</Badge></dd>
            </div>
            {project.businessGoal && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Ziel</dt>
                <dd className="font-medium text-right max-w-xs">{project.businessGoal}</dd>
              </div>
            )}
            {project.successCriteria && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Erfolgskriterien</dt>
                <dd className="text-right max-w-xs">{project.successCriteria}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* CRISP-DM Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">CRISP-DM Fortschritt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {phases.map(phase => (
              <div key={phase.id} className="flex items-center gap-2 text-sm">
                {phase.status === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                ) : phase.status === 'in-progress' ? (
                  <div className="h-4 w-4 rounded-full border-2 border-orange-500 shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-gray-300 shrink-0" />
                )}
                <span className={phase.status === 'completed' ? 'text-gray-900' : 'text-muted-foreground'}>
                  {phase.name}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {completedPhases.length} von {phases.length} Phasen abgeschlossen
          </p>
        </CardContent>
      </Card>

      {/* Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daten</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            {project.rowCount && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Zeilen</dt>
                <dd className="font-mono">{project.rowCount.toLocaleString('de-DE')}</dd>
              </div>
            )}
            {project.preparedDataSummary && (
              <>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Spalten (nach Vorbereitung)</dt>
                  <dd className="font-mono">{project.preparedDataSummary.columnCount}</dd>
                </div>
                {project.preparedDataSummary.hasSplit && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Train / Test</dt>
                    <dd className="font-mono">
                      {project.preparedDataSummary.trainRows} / {project.preparedDataSummary.testRows}
                    </dd>
                  </div>
                )}
              </>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Pipeline Steps */}
      {pipelineSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline-Schritte</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-1.5 text-sm">
              {pipelineSteps.map((step, i) => (
                <li key={step.id} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                  <span>{step.label}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Model Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Modell</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Algorithmus</dt>
              <dd className="font-medium">{model.algorithmLabel}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Hauptmetrik</dt>
              <dd className="font-mono">{mainMetricLabel}</dd>
            </div>
            {topFeatures.length > 0 && (
              <div>
                <dt className="text-muted-foreground mb-1">Top Features</dt>
                <dd>
                  <div className="space-y-1">
                    {topFeatures.map(f => (
                      <div key={f.feature} className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{
                              width: `${(f.importance / (topFeatures[0]?.importance || 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono w-24 shrink-0">{f.feature}</span>
                        <span className="text-xs text-muted-foreground w-12 text-right shrink-0">
                          {f.importance.toFixed(3)}
                        </span>
                      </div>
                    ))}
                  </div>
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

// =============================================
// Shared Components
// =============================================

function GlossaryTermsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Relevante Begriffe für diese Phase</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <GlossaryLink term="Deployment" />
          <GlossaryLink term="Monitoring" />
          <GlossaryLink term="Data Drift" termId="data-drift" />
          <GlossaryLink term="MLOps" />
          <GlossaryLink term="A/B Testing" termId="ab-testing" />
        </div>
      </CardContent>
    </Card>
  );
}
