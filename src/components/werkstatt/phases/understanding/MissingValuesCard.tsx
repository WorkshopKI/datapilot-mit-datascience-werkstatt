import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { GlossaryLink } from '../../GlossaryLink';
import { getMissingBarColor } from '../../shared/formatUtils';
import type { ColumnStatistics } from '@/engine/data/DataAnalyzer';

interface MissingValuesProps {
  columns: ColumnStatistics[];
}

/** Missing values summary card (overview tab) */
export function MissingValuesSummary({ columns }: MissingValuesProps) {
  const totalMissing = columns.reduce((sum, col) => sum + col.missing, 0);
  const columnsWithMissing = columns.filter(c => c.missing > 0).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <GlossaryLink term="Fehlende Werte" termId="fehlende-werte" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {totalMissing === 0 ? (
          <p className="text-green-700 bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
            Keine fehlenden Werte gefunden – der Datensatz ist vollständig.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm">
              {totalMissing} fehlende Werte in {columnsWithMissing} Spalte{columnsWithMissing > 1 ? 'n' : ''} gefunden.
            </p>
            {columns
              .filter(c => c.missing > 0)
              .sort((a, b) => b.missingPercent - a.missingPercent)
              .map(col => (
                <div key={col.name} className="flex items-center gap-3">
                  <span className="text-sm w-32 truncate font-mono">{col.name}</span>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getMissingBarColor(col.missingPercent)}`}
                      style={{ width: `${Math.max(col.missingPercent, 2)}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-16 text-right">
                    {col.missingPercent.toFixed(1)}%
                  </span>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Missing values bars card (statistics tab) */
export function MissingValuesBars({ columns }: MissingValuesProps) {
  const hasMissing = columns.some(c => c.missing > 0);
  if (!hasMissing) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Fehlende Werte pro Spalte</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {columns
          .sort((a, b) => b.missingPercent - a.missingPercent)
          .map(col => (
            <div key={col.name} className="flex items-center gap-3">
              <span className="text-sm w-36 truncate font-mono">{col.name}</span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getMissingBarColor(col.missingPercent)}`}
                  style={{ width: `${Math.max(col.missingPercent, col.missing > 0 ? 2 : 0)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-20 text-right">
                {col.missing} ({col.missingPercent.toFixed(1)}%)
              </span>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
