import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import { CheckCircle2, Brain, GitCompare, Check } from 'lucide-react';
import type { TrainedModel } from '@/engine/types';

interface ModelComparisonTableProps {
  models: TrainedModel[];
  projectType: string;
  selectedModelId?: string;
  onSelectModel: (id: string) => void;
}

export function ModelComparisonTable({ models, projectType, selectedModelId, onSelectModel }: ModelComparisonTableProps) {
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
                          Gewählt für Deployment
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSelectModel(model.id)}
                          className="gap-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Für Deployment wählen
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
          Die grün hervorgehobene Zeile zeigt das Modell mit der besten Hauptmetrik.
          Über „Für Deployment wählen" legst du fest, welches Modell in der Deployment-Phase verwendet wird.
        </p>
      </CardContent>
    </Card>
  );
}
