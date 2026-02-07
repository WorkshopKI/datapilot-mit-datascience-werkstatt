import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lightbulb, CheckCircle, XCircle, ArrowRight, MessageSquare, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Term } from "@/data/termsData";

interface SchnellModusProps {
  terms: Term[];
  onShowDetails: (termId: string) => void;
}

export function SchnellModus({ terms, onShowDetails }: SchnellModusProps) {
  // Sort alphabetically
  const sortedTerms = [...terms].sort((a, b) => a.name.localeCompare(b.name));

  // Split into two columns
  const midpoint = Math.ceil(sortedTerms.length / 2);
  const leftColumn = sortedTerms.slice(0, midpoint);
  const rightColumn = sortedTerms.slice(midpoint);

  const renderTermAccordion = (term: Term, index: number, prefix: string) => (
    <AccordionItem key={term.id} value={`${prefix}-${index}`}>
      <AccordionTrigger className="text-left py-2">
        <span className="font-medium text-sm">{term.name}</span>
      </AccordionTrigger>
      <AccordionContent className="space-y-2">
        <p className="text-xs text-muted-foreground">{term.shortDefinition}</p>

        {term.quickExample && (
          <div className="flex items-start gap-2 p-2 bg-muted/50 rounded-md">
            <Lightbulb className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span className="text-xs">{term.quickExample}</span>
          </div>
        )}

        {term.badPractice && (
          <div className="space-y-1">
            {term.badPractice.map((bsp, i) => (
              <div key={i} className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded-md">
                <XCircle className="h-3.5 w-3.5 text-red-600 shrink-0 mt-0.5" />
                <span className="text-xs text-red-800 dark:text-red-300">{bsp}</span>
              </div>
            ))}
          </div>
        )}

        {term.goodPractice && (
          <div className="space-y-1">
            {term.goodPractice.map((bsp, i) => (
              <div key={i} className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-md">
                <CheckCircle className="h-3.5 w-3.5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-xs text-green-800 dark:text-green-300">{bsp}</span>
              </div>
            ))}
          </div>
        )}

        {term.subtypes && (
          <ul className="space-y-1 pl-3">
            {term.subtypes.map((ut, i) => (
              <li key={i} className="text-xs">
                <strong>{ut.name}:</strong>{" "}
                <span className="text-muted-foreground">{ut.description}</span>
              </li>
            ))}
          </ul>
        )}

        {term.table && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {term.table.headers.map((header, i) => (
                    <TableHead key={i} className="text-xs py-1">{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {term.table.rows.map((row, i) => (
                  <TableRow key={i}>
                    {row.map((cell, j) => (
                      <TableCell key={j} className={`text-xs py-1 ${j === 0 ? "font-medium" : "text-muted-foreground"}`}>
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {term.problems && (
          <ul className="space-y-0.5 pl-3 list-disc text-xs text-muted-foreground">
            {term.problems.map((prob, i) => (
              <li key={i}>{prob}</li>
            ))}
          </ul>
        )}

        {term.tip && (
          <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
            <Lightbulb className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
            <span className="text-xs text-blue-800 dark:text-blue-300">
              <strong>Tipp:</strong> {term.tip}
            </span>
          </div>
        )}

        {/* Technical details collapsible */}
        {term.technicalDetails && (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight className="h-3 w-3 transition-transform duration-200 [[data-state=open]>&]:rotate-90" />
              <span>Details für Experten</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 pl-4 space-y-2 border-l-2 border-muted mt-1">
              {term.technicalDetails.formula && (
                <div>
                  <span className="text-xs font-medium">Formel:</span>
                  <code className="block text-xs bg-muted p-2 rounded mt-1 font-mono">
                    {term.technicalDetails.formula}
                  </code>
                </div>
              )}
              {term.technicalDetails.calculation && (
                <div>
                  <span className="text-xs font-medium">Berechnung:</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {term.technicalDetails.calculation}
                  </p>
                </div>
              )}
              {term.technicalDetails.interpretation && (
                <div>
                  <span className="text-xs font-medium">Interpretation:</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {term.technicalDetails.interpretation}
                  </p>
                </div>
              )}
              {term.technicalDetails.caveats && term.technicalDetails.caveats.length > 0 && (
                <div>
                  <span className="text-xs font-medium">Hinweise:</span>
                  <ul className="text-xs text-muted-foreground list-disc pl-3 mt-0.5">
                    {term.technicalDetails.caveats.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Link to stakeholder mode */}
        {term.businessTranslation && (
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80 p-0 h-auto text-xs"
            onClick={() => onShowDetails(term.id)}
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            Mehr Details für Stakeholder-Gespräche
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        )}
      </AccordionContent>
    </AccordionItem>
  );

  if (terms.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        Keine Begriffe gefunden.
      </p>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-x-6">
      {/* Left column */}
      <Accordion type="single" collapsible className="w-full">
        {leftColumn.map((term, index) => renderTermAccordion(term, index, "left"))}
      </Accordion>

      {/* Right column */}
      <Accordion type="single" collapsible className="w-full">
        {rightColumn.map((term, index) => renderTermAccordion(term, index, "right"))}
      </Accordion>
    </div>
  );
}
