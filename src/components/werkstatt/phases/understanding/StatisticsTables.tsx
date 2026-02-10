import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import { GlossaryLink } from '../../GlossaryLink';
import { formatNumber } from '../../shared/formatUtils';
import type { ColumnStatistics } from '@/engine/data/DataAnalyzer';

interface StatisticsTablesProps {
  columns: ColumnStatistics[];
  numericColumns: string[];
  categoricalColumns: string[];
}

export function StatisticsTables({ columns, numericColumns, categoricalColumns }: StatisticsTablesProps) {
  return (
    <>
      {/* Numeric columns */}
      {numericColumns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Numerische Spalten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Spalte</TableHead>
                    <TableHead className="text-right">Anzahl</TableHead>
                    <TableHead className="text-right">Fehlend</TableHead>
                    <TableHead className="text-right">
                      <GlossaryLink term="Mittelwert">Mittelwert</GlossaryLink>
                    </TableHead>
                    <TableHead className="text-right">
                      <GlossaryLink term="Standardabweichung">Std</GlossaryLink>
                    </TableHead>
                    <TableHead className="text-right">Min</TableHead>
                    <TableHead className="text-right">
                      <GlossaryLink term="Median" termId="median">Q50</GlossaryLink>
                    </TableHead>
                    <TableHead className="text-right">Max</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {columns
                    .filter(c => numericColumns.includes(c.name))
                    .map(col => (
                      <TableRow key={col.name}>
                        <TableCell className="font-mono font-medium">{col.name}</TableCell>
                        <TableCell className="text-right">{col.count}</TableCell>
                        <TableCell className="text-right">
                          <span className={col.missing > 0 ? 'text-amber-600 font-medium' : ''}>
                            {col.missingPercent.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(col.mean)}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(col.std)}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(col.min)}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(col.q50)}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(col.max)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categorical columns */}
      {categoricalColumns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kategoriale Spalten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Spalte</TableHead>
                    <TableHead className="text-right">Anzahl</TableHead>
                    <TableHead className="text-right">Fehlend</TableHead>
                    <TableHead className="text-right">Eindeutige</TableHead>
                    <TableHead>Häufigster Wert</TableHead>
                    <TableHead className="text-right">Häufigkeit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {columns
                    .filter(c => categoricalColumns.includes(c.name))
                    .map(col => (
                      <TableRow key={col.name}>
                        <TableCell className="font-mono font-medium">{col.name}</TableCell>
                        <TableCell className="text-right">{col.count}</TableCell>
                        <TableCell className="text-right">
                          <span className={col.missing > 0 ? 'text-amber-600 font-medium' : ''}>
                            {col.missingPercent.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{col.unique}</TableCell>
                        <TableCell className="font-mono">{col.topValue ?? '–'}</TableCell>
                        <TableCell className="text-right">{col.topFrequency ?? '–'}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
