import { getCorrelationColor } from '../../shared/formatUtils';

interface CorrelationHeatmapProps {
  correlations: Record<string, Record<string, number>>;
  columns: string[];
}

export function CorrelationHeatmap({ correlations, columns }: CorrelationHeatmapProps) {
  const size = columns.length;

  return (
    <div
      className="inline-grid gap-px"
      style={{
        gridTemplateColumns: `auto repeat(${size}, minmax(3rem, 1fr))`,
        gridTemplateRows: `auto repeat(${size}, minmax(2.5rem, 1fr))`,
      }}
    >
      {/* Top-left empty cell */}
      <div />
      {/* Column headers */}
      {columns.map(col => (
        <div
          key={`h-${col}`}
          className="text-xs font-mono text-center truncate px-1 flex items-end justify-center pb-1"
          title={col}
        >
          {col.length > 8 ? col.slice(0, 7) + '…' : col}
        </div>
      ))}
      {/* Rows */}
      {columns.map((rowCol, rowIdx) => (
        <>
          {/* Row label */}
          <div
            key={`r-${rowCol}`}
            className="text-xs font-mono truncate pr-2 flex items-center justify-end"
            title={rowCol}
          >
            {rowCol.length > 10 ? rowCol.slice(0, 9) + '…' : rowCol}
          </div>
          {/* Cells */}
          {columns.map((colCol, colIdx) => {
            // Upper triangle: empty cell
            if (colIdx > rowIdx) {
              return <div key={`${rowCol}-${colCol}`} />;
            }

            // Diagonal: dimmed self-correlation
            if (colIdx === rowIdx) {
              return (
                <div
                  key={`${rowCol}-${colCol}`}
                  className="flex items-center justify-center rounded text-xs font-mono bg-muted text-muted-foreground"
                  title={`${rowCol}: Selbstkorrelation`}
                >
                  1.00
                </div>
              );
            }

            // Lower triangle: normal colored cell
            const value = correlations[rowCol]?.[colCol] ?? 0;
            return (
              <div
                key={`${rowCol}-${colCol}`}
                className="flex items-center justify-center rounded text-xs font-mono cursor-default"
                style={{ backgroundColor: getCorrelationColor(value) }}
                title={`${rowCol} × ${colCol}: ${value.toFixed(4)}`}
              >
                <span className={Math.abs(value) > 0.5 ? 'text-white' : 'text-gray-700'}>
                  {value.toFixed(2)}
                </span>
              </div>
            );
          })}
        </>
      ))}
    </div>
  );
}
