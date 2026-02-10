import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlossaryLink } from '../../GlossaryLink';
import type { TrainedModel } from '@/engine/types';

export function ConfusionMatrixViz({ model }: { model: TrainedModel }) {
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
