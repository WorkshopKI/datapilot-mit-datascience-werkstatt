// Evaluation Phase – Metrics, Visualizations, Model Comparison
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { BarChart3, Info, Eye, GitCompare, Code } from 'lucide-react';
import { GlossaryLink } from '../GlossaryLink';
import { GlossaryTermsCard } from '../shared/GlossaryTermsCard';
import { LernbereichLink } from '../shared/LernbereichLink';
import { ClassificationMetrics, RegressionMetrics, ClusteringMetrics } from './evaluation/MetricsPanel';
import { ConfusionMatrixViz } from './evaluation/ConfusionMatrixViz';
import { FeatureImportanceViz } from './evaluation/FeatureImportanceViz';
import { ClusteringViz } from './evaluation/ClusteringViz';
import { ModelComparisonTable } from './evaluation/ModelComparisonTable';
import type { WorkspaceProject } from '@/engine/types';

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

      <GlossaryTermsCard terms={GLOSSARY_TERMS} />
      <LernbereichLink />
    </div>
  );
}
