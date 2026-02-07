import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lightbulb, CheckCircle, XCircle } from "lucide-react";

export interface GlossarEintragData {
  begriff: string;
  definition: string;
  beispiel?: string;
  beispielSchlecht?: string[];
  beispielGut?: string[];
  untertypen?: { name: string; beschreibung: string }[];
  tabelle?: { headers: string[]; rows: string[][] };
  probleme?: string[];
  tipp?: string;
}

interface GlossarEintragProps {
  eintrag: GlossarEintragData;
  index: number;
  prefix: string;
}

export function GlossarEintrag({ eintrag, index, prefix }: GlossarEintragProps) {
  return (
    <AccordionItem value={`${prefix}-${index}`}>
      <AccordionTrigger className="text-left">
        <span className="font-semibold">{eintrag.begriff}</span>
      </AccordionTrigger>
      <AccordionContent className="space-y-4">
        <p className="text-muted-foreground">{eintrag.definition}</p>

        {eintrag.beispiel && (
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
            <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="text-sm">{eintrag.beispiel}</span>
          </div>
        )}

        {eintrag.beispielSchlecht && (
          <div className="space-y-2">
            {eintrag.beispielSchlecht.map((bsp, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span className="text-sm text-red-800 dark:text-red-300">{bsp}</span>
              </div>
            ))}
          </div>
        )}

        {eintrag.beispielGut && (
          <div className="space-y-2">
            {eintrag.beispielGut.map((bsp, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm text-green-800 dark:text-green-300">{bsp}</span>
              </div>
            ))}
          </div>
        )}

        {eintrag.untertypen && (
          <ul className="space-y-2 pl-4">
            {eintrag.untertypen.map((ut, i) => (
              <li key={i} className="text-sm">
                <strong>{ut.name}:</strong>{" "}
                <span className="text-muted-foreground">{ut.beschreibung}</span>
              </li>
            ))}
          </ul>
        )}

        {eintrag.tabelle && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {eintrag.tabelle.headers.map((header, i) => (
                    <TableHead key={i}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {eintrag.tabelle.rows.map((row, i) => (
                  <TableRow key={i}>
                    {row.map((cell, j) => (
                      <TableCell key={j} className={j === 0 ? "font-medium" : "text-muted-foreground"}>
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {eintrag.probleme && (
          <ul className="space-y-1 pl-4 list-disc text-sm text-muted-foreground">
            {eintrag.probleme.map((prob, i) => (
              <li key={i}>{prob}</li>
            ))}
          </ul>
        )}

        {eintrag.tipp && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Lightbulb className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <span className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Tipp:</strong> {eintrag.tipp}
            </span>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
