// Evaluation Phase – Metrics, Visualizations, Model Comparison
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import {
  BarChart3, CheckCircle2, Info, Brain, Eye, GitCompare, Code, BookOpen, Check,
} from 'lucide-react';
import { GlossaryLink } from '../GlossaryLink';
import { GlossaryTermsCard } from '../shared/GlossaryTermsCard';
import type { WorkspaceProject, TrainedModel } from '@/engine/types';

interface EvaluationProps {
  project: WorkspaceProject;
  onUpdateProject: (updates: Partial<WorkspaceProject>) => void;
}

export function Evaluation({ project, onUpdateProject }: EvaluationProps) {
  const trainedModels = project.trainedModels ?? [];
  const [selectedModelId, setSelectedModelId] = useState<string>(
    project.selectedModelId ?? trainedModels[0]?.id ?? '',
  );

  const selectedModel = useMemo(
    () => trainedModels.find(m => m.id === selectedModelId),
    [trainedModels, selectedModelId],
  );

  const isClassification = project.type === 'klassifikation';
  const isRegression = project.type === 'regression';
  const isClustering = project.type === 'clustering';

  const handleSelectModel = (modelId: string) => {
    onUpdateProject({ selectedModelId: modelId });
  };

  // --- No models state ---
  if (trainedModels.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto p-4 rounded-full bg-muted w-fit">
              <BarChart3 className="h-10 w-10 text-muted-foreground" />
            </div>
            <CardTitle>Evaluation</CardTitle>
            <p className="text-muted-foreground">
              Trainiere zuerst mindestens ein Modell in der{' '}
              <span className="font-medium">Modeling</span>-Phase, um die Ergebnisse hier zu bewerten.
            </p>
          </CardHeader>
        </Card>
        <GlossaryTermsCard terms={[
          { term: 'Confusion Matrix', termId: 'confusion-matrix' },
          { term: 'Precision' },
          { term: 'Recall' },
          { term: 'F1-Score', termId: 'f1-score' },
          { term: 'AUC-ROC', termId: 'auc-roc' },
          { term: 'Overfitting' },
        ]} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Model Selector */}
      {trainedModels.length > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="max-w-sm">
              <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Modell auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {trainedModels.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.algorithmLabel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="metriken">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metriken" className="gap-1">
            <BarChart3 className="h-3.5 w-3.5" />
            Metriken
          </TabsTrigger>
          <TabsTrigger value="visualisierungen" className="gap-1">
            <Eye className="h-3.5 w-3.5" />
            Visualisierungen
          </TabsTrigger>
          <TabsTrigger value="vergleich" className="gap-1">
            <GitCompare className="h-3.5 w-3.5" />
            Vergleich
          </TabsTrigger>
          <TabsTrigger value="code" className="gap-1">
            <Code className="h-3.5 w-3.5" />
            Python-Code
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Metriken */}
        <TabsContent value="metriken">
          {selectedModel ? (
            <div className="space-y-4">
              {isClassification && <ClassificationMetrics model={selectedModel} />}
              {isRegression && <RegressionMetrics model={selectedModel} />}
              {isClustering && <ClusteringMetrics model={selectedModel} />}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Bitte wähle ein Modell aus.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab 2: Visualisierungen */}
        <TabsContent value="visualisierungen">
          {selectedModel ? (
            <div className="space-y-4">
              {isClassification && selectedModel.metrics.confusionMatrix && (
                <ConfusionMatrixViz model={selectedModel} />
              )}
              {selectedModel.featureImportances && selectedModel.featureImportances.length > 0 && (
                <FeatureImportanceViz model={selectedModel} />
              )}
              {isClustering && <ClusteringViz model={selectedModel} />}
              {!isClassification && !selectedModel.featureImportances?.length && !isClustering && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Für dieses Modell sind keine Visualisierungen verfügbar.
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Bitte wähle ein Modell aus.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab 3: Vergleich */}
        <TabsContent value="vergleich">
          {trainedModels.length >= 2 ? (
            <ModelComparisonTable
              models={trainedModels}
              projectType={project.type}
              selectedModelId={project.selectedModelId}
              onSelectModel={handleSelectModel}
            />
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Trainiere mindestens zwei Modelle, um sie hier zu vergleichen.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab 4: Python-Code */}
        <TabsContent value="code">
          {selectedModel ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Python-Code: {selectedModel.algorithmLabel}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Dieser Code zeigt, wie das Modell in Python trainiert und evaluiert wird.
                </p>
                <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                  <code>{selectedModel.pythonCode}</code>
                </pre>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Bitte wähle ein Modell aus.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Tutor Tip */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-orange-800 mb-1">Tipp: Evaluation</p>
            <p className="text-orange-700">
              Vergleiche die Modelle nicht nur anhand einer einzelnen Metrik.
              Bei Klassifikation schaue dir die{' '}
              <GlossaryLink term="Confusion Matrix" termId="confusion-matrix">Confusion Matrix</GlossaryLink>{' '}
              an, um zu verstehen, welche Fehler das Modell macht.{' '}
              <GlossaryLink term="Precision" termId="precision">Precision</GlossaryLink> und{' '}
              <GlossaryLink term="Recall" termId="recall">Recall</GlossaryLink>{' '}
              zeigen unterschiedliche Aspekte der Modellqualität.
            </p>
          </div>
        </div>
      </div>

      <GlossaryTermsCard terms={[
          { term: 'Confusion Matrix', termId: 'confusion-matrix' },
          { term: 'Precision' },
          { term: 'Recall' },
          { term: 'F1-Score', termId: 'f1-score' },
          { term: 'AUC-ROC', termId: 'auc-roc' },
          { term: 'Overfitting' },
        ]} />

      {/* Lernbereich-Link (Pattern 12) */}
      <a
        href="/lernen/grundlagen#crisp-dm"
        className="text-sm text-primary hover:underline flex items-center gap-1"
      >
        <BookOpen className="h-3.5 w-3.5" />
        Mehr zu dieser Phase im Lernbereich →
      </a>
    </div>
  );
}

// =============================================
// Metrics Components
// =============================================

function ClassificationMetrics({ model }: { model: TrainedModel }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          label="Accuracy"
          value={`${((model.metrics.accuracy ?? 0) * 100).toFixed(1)}%`}
          description="Anteil korrekt klassifizierter Datenpunkte"
          highlight={true}
        />
        <MetricCard
          label="Precision"
          value={`${((model.metrics.precision ?? 0) * 100).toFixed(1)}%`}
          description="Von allen positiven Vorhersagen: wie viele waren korrekt?"
        />
        <MetricCard
          label="Recall"
          value={`${((model.metrics.recall ?? 0) * 100).toFixed(1)}%`}
          description="Von allen tatsächlich positiven: wie viele wurden erkannt?"
        />
        <MetricCard
          label="F1-Score"
          value={`${((model.metrics.f1Score ?? 0) * 100).toFixed(1)}%`}
          description="Harmonisches Mittel aus Precision und Recall"
        />
      </div>
      {model.metrics.rocAuc != null && (
        <MetricCard
          label="AUC-ROC"
          value={model.metrics.rocAuc.toFixed(4)}
          description="Fläche unter der ROC-Kurve (1.0 = perfekt, 0.5 = Zufall)"
          wide
        />
      )}
    </div>
  );
}

function RegressionMetrics({ model }: { model: TrainedModel }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <MetricCard
        label="R² (Bestimmtheitsmaß)"
        value={(model.metrics.r2 ?? 0).toFixed(4)}
        description="Anteil der erklärten Varianz (1.0 = perfekt, 0 = kein Erklärungswert)"
        highlight={true}
      />
      <MetricCard
        label="RMSE"
        value={(model.metrics.rmse ?? 0).toFixed(4)}
        description="Wurzel des mittleren quadratischen Fehlers – je kleiner, desto besser"
      />
      <MetricCard
        label="MAE"
        value={(model.metrics.mae ?? 0).toFixed(4)}
        description="Mittlerer absoluter Fehler – durchschnittliche Abweichung"
      />
    </div>
  );
}

function ClusteringMetrics({ model }: { model: TrainedModel }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {model.metrics.silhouetteScore != null && (
        <MetricCard
          label="Silhouette Score"
          value={model.metrics.silhouetteScore.toFixed(4)}
          description="Clustertrennung (-1 bis 1, höher = besser getrennte Cluster)"
          highlight={true}
        />
      )}
      {model.metrics.inertia != null && (
        <MetricCard
          label="Inertia"
          value={model.metrics.inertia.toFixed(2)}
          description="Summe der quadrierten Abstände zu Clusterzentren – je kleiner, desto kompakter"
        />
      )}
      <MetricCard
        label="Anzahl Cluster"
        value={String(model.metrics.nClusters ?? '?')}
        description="Anzahl der gefundenen Cluster"
      />
    </div>
  );
}

function MetricCard({ label, value, description, highlight, wide }: {
  label: string;
  value: string;
  description: string;
  highlight?: boolean;
  wide?: boolean;
}) {
  return (
    <Card className={`${highlight ? 'border-orange-200 bg-orange-50/50' : ''} ${wide ? 'sm:col-span-3' : ''}`}>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="text-xs text-muted-foreground mb-1">{label}</div>
        <div className={`text-2xl font-bold ${highlight ? 'text-orange-600' : 'text-gray-900'}`}>
          {value}
        </div>
        <div className="text-xs text-muted-foreground mt-1">{description}</div>
      </CardContent>
    </Card>
  );
}

// =============================================
// Visualization Components
// =============================================

function ConfusionMatrixViz({ model }: { model: TrainedModel }) {
  const cm = model.metrics.confusionMatrix!;
  const labels = model.metrics.classLabels ?? cm.map((_, i) => String(i));
  const maxVal = Math.max(...cm.flat());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <GlossaryLink term="Confusion Matrix" termId="confusion-matrix">Confusion Matrix</GlossaryLink>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block">
            {/* Header row */}
            <div className="flex items-center mb-1">
              <div className="w-20 text-xs text-muted-foreground text-right pr-2">
                Tatsächlich ↓ / Vorhergesagt →
              </div>
              {labels.map(label => (
                <div key={label} className="w-16 text-center text-xs font-medium text-gray-700">
                  {label}
                </div>
              ))}
            </div>
            {/* Matrix rows */}
            {cm.map((row, i) => (
              <div key={i} className="flex items-center">
                <div className="w-20 text-xs font-medium text-gray-700 text-right pr-2">
                  {labels[i]}
                </div>
                {row.map((val, j) => {
                  const intensity = maxVal > 0 ? val / maxVal : 0;
                  const isDiagonal = i === j;
                  const bgColor = isDiagonal
                    ? `rgba(34, 197, 94, ${0.1 + intensity * 0.6})`
                    : val > 0
                    ? `rgba(239, 68, 68, ${0.1 + intensity * 0.5})`
                    : 'rgba(243, 244, 246, 0.5)';

                  return (
                    <div
                      key={j}
                      className="w-16 h-12 flex items-center justify-center text-sm font-mono border border-gray-200"
                      style={{ backgroundColor: bgColor }}
                    >
                      {val}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Die Diagonale (grün) zeigt korrekte Vorhersagen. Fehlklassifikationen sind rot hervorgehoben.
        </p>
      </CardContent>
    </Card>
  );
}

function FeatureImportanceViz({ model }: { model: TrainedModel }) {
  const importances = model.featureImportances!;
  const maxImportance = Math.max(...importances.map(f => f.importance));
  const top10 = importances.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Feature Importance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {top10.map(({ feature, importance }) => {
            const widthPercent = maxImportance > 0 ? (importance / maxImportance) * 100 : 0;
            return (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-28 text-xs font-mono text-right truncate shrink-0">
                  {feature}
                </div>
                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
                <div className="w-14 text-xs text-muted-foreground text-right shrink-0">
                  {importance.toFixed(4)}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Zeigt, wie stark jedes Feature zur Vorhersage beiträgt.
          {importances.length > 10 && ` (Top 10 von ${importances.length})`}
        </p>
      </CardContent>
    </Card>
  );
}

function ClusteringViz({ model }: { model: TrainedModel }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Clustering-Ergebnis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-900">{model.metrics.nClusters ?? '?'}</div>
            <div className="text-sm text-muted-foreground">Cluster gefunden</div>
          </div>
          {model.metrics.silhouetteScore != null && (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-900">
                {model.metrics.silhouetteScore.toFixed(3)}
              </div>
              <div className="text-sm text-muted-foreground">Silhouette Score</div>
            </div>
          )}
        </div>
        {model.metrics.silhouetteScore != null && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground">Silhouette-Qualität:</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
              {/* Scale markers */}
              <div className="absolute inset-0 flex">
                <div className="flex-1 bg-red-200" />
                <div className="flex-1 bg-amber-200" />
                <div className="flex-1 bg-green-200" />
              </div>
              {/* Indicator */}
              <div
                className="absolute top-0 h-full w-1 bg-gray-900 rounded"
                style={{ left: `${((model.metrics.silhouetteScore + 1) / 2) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>-1 (schlecht)</span>
              <span>0</span>
              <span>1 (perfekt)</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================
// Model Comparison Table
// =============================================

function ModelComparisonTable({ models, projectType, selectedModelId, onSelectModel }: {
  models: TrainedModel[];
  projectType: string;
  selectedModelId?: string;
  onSelectModel: (id: string) => void;
}) {
  const isClassification = projectType === 'klassifikation';
  const isRegression = projectType === 'regression';
  const isClustering = projectType === 'clustering';

  // Find best model by primary metric
  const bestModelId = useMemo(() => {
    if (models.length === 0) return '';
    if (isClassification) {
      return models.reduce((best, m) =>
        (m.metrics.accuracy ?? 0) > (best.metrics.accuracy ?? 0) ? m : best,
      ).id;
    }
    if (isRegression) {
      return models.reduce((best, m) =>
        (m.metrics.r2 ?? 0) > (best.metrics.r2 ?? 0) ? m : best,
      ).id;
    }
    // Clustering
    return models.reduce((best, m) =>
      (m.metrics.silhouetteScore ?? -1) > (best.metrics.silhouetteScore ?? -1) ? m : best,
    ).id;
  }, [models, isClassification, isRegression]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <GitCompare className="h-4 w-4" />
          Modellvergleich
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modell</TableHead>
                {isClassification && (
                  <>
                    <TableHead className="text-right">Accuracy</TableHead>
                    <TableHead className="text-right">Precision</TableHead>
                    <TableHead className="text-right">Recall</TableHead>
                    <TableHead className="text-right">F1-Score</TableHead>
                  </>
                )}
                {isRegression && (
                  <>
                    <TableHead className="text-right">R²</TableHead>
                    <TableHead className="text-right">RMSE</TableHead>
                    <TableHead className="text-right">MAE</TableHead>
                  </>
                )}
                {isClustering && (
                  <>
                    <TableHead className="text-right">Silhouette</TableHead>
                    <TableHead className="text-right">Cluster</TableHead>
                    <TableHead className="text-right">Inertia</TableHead>
                  </>
                )}
                <TableHead className="text-right">Dauer</TableHead>
                <TableHead className="text-center">Aktion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => {
                const isBest = model.id === bestModelId;
                const isSelected = model.id === selectedModelId;

                return (
                  <TableRow
                    key={model.id}
                    className={isBest ? 'bg-green-50/50' : ''}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-orange-500 shrink-0" />
                        <span className="font-medium text-sm">{model.algorithmLabel}</span>
                        {isBest && (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                            Bestes
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {isClassification && (
                      <>
                        <TableCell className="text-right font-mono text-sm">
                          {((model.metrics.accuracy ?? 0) * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {((model.metrics.precision ?? 0) * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {((model.metrics.recall ?? 0) * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {((model.metrics.f1Score ?? 0) * 100).toFixed(1)}%
                        </TableCell>
                      </>
                    )}

                    {isRegression && (
                      <>
                        <TableCell className="text-right font-mono text-sm">
                          {(model.metrics.r2 ?? 0).toFixed(4)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {(model.metrics.rmse ?? 0).toFixed(4)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {(model.metrics.mae ?? 0).toFixed(4)}
                        </TableCell>
                      </>
                    )}

                    {isClustering && (
                      <>
                        <TableCell className="text-right font-mono text-sm">
                          {model.metrics.silhouetteScore != null
                            ? model.metrics.silhouetteScore.toFixed(4)
                            : '–'}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {model.metrics.nClusters ?? '–'}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {model.metrics.inertia != null
                            ? model.metrics.inertia.toFixed(1)
                            : '–'}
                        </TableCell>
                      </>
                    )}

                    <TableCell className="text-right text-sm text-muted-foreground">
                      {model.trainingDurationMs < 1000
                        ? `${model.trainingDurationMs}ms`
                        : `${(model.trainingDurationMs / 1000).toFixed(1)}s`}
                    </TableCell>

                    <TableCell className="text-center">
                      {isSelected ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Gewählt
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSelectModel(model.id)}
                          className="gap-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Auswählen
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Das beste Modell nach Hauptmetrik ist grün hervorgehoben.
          Klicke „Auswählen", um ein Modell für das Deployment festzulegen.
        </p>
      </CardContent>
    </Card>
  );
}

