import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TrainedModel } from '@/engine/types';

export function ClusteringViz({ model }: { model: TrainedModel }) {
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
