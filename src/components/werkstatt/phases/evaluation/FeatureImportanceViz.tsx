import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TrainedModel } from '@/engine/types';

export function FeatureImportanceViz({ model }: { model: TrainedModel }) {
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
