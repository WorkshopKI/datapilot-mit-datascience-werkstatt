import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ComparisonData } from "@/data/metrikenData";

interface ComparisonTableProps {
  data: ComparisonData;
  className?: string;
}

export function ComparisonTable({ data, className }: ComparisonTableProps) {
  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">{data.title}</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="overflow-x-auto -mx-6 px-6">
          <Table>
            <TableHeader>
              <TableRow>
                {data.columns.map((col, i) => (
                  <TableHead 
                    key={i} 
                    className={cn(
                      "whitespace-nowrap",
                      i === 0 && "font-semibold"
                    )}
                  >
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <TableCell 
                      key={cellIndex}
                      className={cn(
                        cellIndex === 0 && "font-medium",
                        "text-sm"
                      )}
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* Gradient rechts als Scroll-Hinweis - nur auf Mobile */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none sm:hidden" />
      </CardContent>
    </Card>
  );
}
