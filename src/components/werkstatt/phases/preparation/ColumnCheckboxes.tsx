import { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface ColumnCheckboxesProps {
  label: string;
  columns: string[];
  selected: string[];
  onChange: (cols: string[]) => void;
  /** Per-column missing value counts. When provided, columns with missing values are sorted first. */
  missingCounts?: Record<string, number>;
}

export function ColumnCheckboxes({ label, columns, selected, onChange, missingCounts }: ColumnCheckboxesProps) {
  const toggle = (col: string) => {
    if (selected.includes(col)) {
      onChange(selected.filter(c => c !== col));
    } else {
      onChange([...selected, col]);
    }
  };

  const sortedColumns = useMemo(() => {
    if (!missingCounts) return columns;
    return [...columns].sort((a, b) => {
      const ma = missingCounts[a] ?? 0;
      const mb = missingCounts[b] ?? 0;
      return mb - ma; // descending by missing count
    });
  }, [columns, missingCounts]);

  if (columns.length === 0) {
    return (
      <div>
        <Label>{label}</Label>
        <p className="text-xs text-muted-foreground mt-1">Keine passenden Spalten vorhanden.</p>
      </div>
    );
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {sortedColumns.map(col => {
          const count = missingCounts?.[col] ?? 0;
          const hasMissing = missingCounts != null && count > 0;
          const noMissing = missingCounts != null && count === 0;
          return (
            <label
              key={col}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-md border cursor-pointer hover:bg-gray-50 text-sm',
                noMissing && 'text-muted-foreground opacity-60',
              )}
            >
              <Checkbox
                checked={selected.includes(col)}
                onCheckedChange={() => toggle(col)}
              />
              <span className="font-mono text-xs">
                {col}
                {hasMissing && (
                  <span className="text-amber-600 ml-1">({count} fehlend)</span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
