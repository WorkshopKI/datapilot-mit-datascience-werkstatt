import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  BarChart3, Search, ArrowUpDown, ChevronUp, ChevronDown, Hash, Info,
} from 'lucide-react';
import { formatCellValue } from './formatUtils';

interface DataPreviewTableProps {
  data: Record<string, unknown>[];
  columns: string[];
  numericColumns: string[];
  /** Custom badge text per column. Default: 'num' / 'kat' */
  getColumnBadge?: (col: string, isNumeric: boolean) => string;
  /** Shown when data is empty */
  emptyState?: React.ReactNode;
  /** Unique ID prefix for the "show all" checkbox */
  checkboxId?: string;
  /** Whether the source data has any missing values (for the hint) */
  hasMissingValues?: boolean;
}

export function DataPreviewTable({
  data,
  columns,
  numericColumns,
  getColumnBadge,
  emptyState,
  checkboxId = 'preview-show-all',
  hasMissingValues,
}: DataPreviewTableProps) {
  const [previewCount, setPreviewCount] = useState(10);
  const [showAllRows, setShowAllRows] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Filter by search query
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(row =>
      columns.some(col =>
        String(row[col] ?? '').toLowerCase().includes(q)
      )
    );
  }, [data, columns, searchQuery]);

  // 2. Sort
  const sortedRows = useMemo(() => {
    if (!sortColumn) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const va = a[sortColumn];
      const vb = b[sortColumn];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDirection === 'asc' ? va - vb : vb - va;
      }
      const cmp = String(va).localeCompare(String(vb), 'de');
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [filteredRows, sortColumn, sortDirection]);

  // 3. Slice to desired count
  const displayedRows = showAllRows
    ? sortedRows
    : sortedRows.slice(0, previewCount);

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortColumn !== col) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />;
    return sortDirection === 'asc'
      ? <ChevronUp className="h-3 w-3 text-primary" />
      : <ChevronDown className="h-3 w-3 text-primary" />;
  };

  // Auto-detect missing values if not explicitly provided
  const showMissingHint = hasMissingValues ?? data.some(row =>
    columns.some(col => {
      const v = row[col];
      return v === null || v === undefined || (typeof v === 'number' && isNaN(v));
    })
  );

  const needsScroll = showAllRows || previewCount > 25;

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Datenvorschau
          <span className="text-sm font-normal text-muted-foreground ml-1">
            · {displayedRows.length} von {data.length} Zeilen
            {searchQuery.trim() && ` (gefiltert aus ${data.length})`}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative max-w-[200px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Suche..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-7 h-8 text-sm"
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Row count slider */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Zeilen:</span>
            <Slider
              value={[previewCount]}
              onValueChange={([v]) => {
                setPreviewCount(v);
                if (showAllRows) setShowAllRows(false);
              }}
              min={10}
              max={100}
              step={10}
              disabled={showAllRows}
              className="w-24"
            />
            <Badge variant="outline" className="text-xs min-w-[3rem] text-center">
              {showAllRows ? 'Alle' : previewCount}
            </Badge>
          </div>

          {/* Show all toggle */}
          <div className="flex items-center gap-1.5">
            <Checkbox
              id={checkboxId}
              checked={showAllRows}
              onCheckedChange={(checked) => setShowAllRows(checked === true)}
            />
            <label htmlFor={checkboxId} className="text-xs text-muted-foreground cursor-pointer whitespace-nowrap">
              Alle
            </label>
          </div>
        </div>

        {/* Table with scroll constraint */}
        <div className={cn(
          "overflow-x-auto",
          needsScroll && "max-h-[600px] overflow-y-auto"
        )}>
          <Table>
            <TableHeader>
              <TableRow>
                {/* Row number column */}
                <TableHead className="py-1.5 px-2 w-10 text-right sticky top-0 bg-white z-10">
                  <Hash className="h-3 w-3 text-muted-foreground inline" />
                </TableHead>
                {columns.map(col => {
                  const isNumeric = numericColumns.includes(col);
                  const isSorted = sortColumn === col;
                  const badgeText = getColumnBadge
                    ? getColumnBadge(col, isNumeric)
                    : (isNumeric ? 'num' : 'kat');
                  return (
                    <TableHead
                      key={col}
                      className={`py-1.5 px-2 cursor-pointer select-none transition-colors hover:bg-muted/50 sticky top-0 bg-white z-10 ${isSorted ? 'bg-muted/30' : ''}`}
                      onClick={() => handleSort(col)}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-xs">{col}</span>
                          <SortIcon col={col} />
                        </div>
                        <Badge variant="outline" className="w-fit text-[10px] px-1 py-0">
                          {badgeText}
                        </Badge>
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">
                    <Search className="h-5 w-5 mx-auto mb-2 opacity-50" />
                    Keine Zeilen gefunden.
                  </TableCell>
                </TableRow>
              ) : (
                displayedRows.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="py-1 px-2 text-xs text-muted-foreground text-right w-10 font-mono">
                      {i + 1}
                    </TableCell>
                    {columns.map(col => {
                      const value = row[col];
                      const isMissing = value === null || value === undefined ||
                        (typeof value === 'number' && isNaN(value));
                      return (
                        <TableCell
                          key={col}
                          className={`py-1 px-2 text-xs font-mono ${isMissing ? 'bg-red-50 text-red-400' : ''}`}
                        >
                          {isMissing ? '–' : formatCellValue(value)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Missing values hint */}
        {showMissingHint && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-3 w-3 shrink-0" />
            <span>
              Fehlende Werte sind <span className="bg-red-50 text-red-400 px-1 rounded">rot hervorgehoben</span>.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
