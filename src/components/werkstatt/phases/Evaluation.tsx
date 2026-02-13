// Evaluation Phase – Metrics, Visualizations, Model Comparison
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BarChart3, Eye, GitCompare, Code, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlossaryTermsCard } from '../shared/GlossaryTermsCard';
import { LernbereichLink } from '../shared/LernbereichLink';
import { ClassificationMetrics, RegressionMetrics, ClusteringMetrics } from './evaluation/MetricsPanel';
import { ConfusionMatrixViz } from './evaluation/ConfusionMatrixViz';
import { FeatureImportanceViz } from './evaluation/FeatureImportanceViz';
import { ClusteringViz } from './evaluation/ClusteringViz';
import { ModelComparisonTable } from './evaluation/ModelComparisonTable';
import type { WorkspaceProject, TrainedModel } from '@/engine/types';

function formatMainMetric(model: TrainedModel, projectType: string): string {
  if (projectType === 'klassifikation') {
    return `${((model.metrics.accuracy ?? 0) * 100).toFixed(1)}%`;
  }
  if (projectType === 'regression') {
    return `R² ${(model.metrics.r2 ?? 0).toFixed(3)}`;
  }
  // clustering
  return model.metrics.silhouetteScore != null
    ? `Sil. ${model.metrics.silhouetteScore.toFixed(3)}`
    : '–';
}

function CollapsibleVisualization({ title, icon, children }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none hover:bg-muted/50 transition-colors">
            <CardTitle className="text-base flex items-center gap-2">
              {icon}
              <span className="flex-1">{title}</span>
              {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

const GLOSSARY_TERMS = [
  { term: 'Confusion Matrix', termId: 'confusion-matrix' },
  { term: 'Precision' },
  { term: 'Recall' },
  { term: 'F1-Score', termId: 'f1-score' },
  { term: 'AUC-ROC', termId: 'auc-roc' },
  { term: 'Overfitting' },
];

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
        <GlossaryTermsCard terms={GLOSSARY_TERMS} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Model Selector Chips */}
      {trainedModels.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {trainedModels.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedModelId(m.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                m.id === selectedModelId
                  ? 'border-orange-500 bg-orange-50 text-orange-800'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300',
              )}
            >
              {m.algorithmLabel} · {formatMainMetric(m, project.type)}
            </button>
          ))}
        </div>
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
              {/* Feature Importance first */}
              {selectedModel.featureImportances && selectedModel.featureImportances.length > 0 && (
                <CollapsibleVisualization
                  title="Feature Importance"
                  icon={<BarChart3 className="h-4 w-4 text-primary" />}
                >
                  <FeatureImportanceViz model={selectedModel} embedded />
                </CollapsibleVisualization>
              )}
              {/* Confusion Matrix second */}
              {isClassification && selectedModel.metrics.confusionMatrix && (
                <CollapsibleVisualization
                  title="Confusion Matrix"
                  icon={<Eye className="h-4 w-4 text-primary" />}
                >
                  <ConfusionMatrixViz model={selectedModel} embedded />
                </CollapsibleVisualization>
              )}
              {isClustering && (
                <CollapsibleVisualization
                  title="Cluster-Verteilung"
                  icon={<BarChart3 className="h-4 w-4 text-primary" />}
                >
                  <ClusteringViz model={selectedModel} embedded />
                </CollapsibleVisualization>
              )}
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

      <GlossaryTermsCard terms={GLOSSARY_TERMS} />
      <LernbereichLink />
    </div>
  );
}
