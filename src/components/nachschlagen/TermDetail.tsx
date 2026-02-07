import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Copy, Check, Lightbulb, CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { Term } from "@/data/termsData";

interface TermDetailProps {
  term: Term;
  onSelectRelated: (termId: string) => void;
}

export function TermDetail({ term, onSelectRelated }: TermDetailProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Kopiert!", description: "Text wurde in die Zwischenablage kopiert." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5 text-primary" />
          {term.name}
        </CardTitle>
        {term.businessTranslation && (
          <CardDescription className="text-base">{term.businessTranslation}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Full explanation */}
        {term.fullExplanation && (
          <div>
            <h4 className="font-semibold mb-1">Erklärung</h4>
            <p className="text-muted-foreground">{term.fullExplanation}</p>
          </div>
        )}

        {/* Detailed example */}
        {term.detailedExample && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-1">📌 Beispiel: {term.detailedExample.scenario}</h4>
            <p className="text-sm">{term.detailedExample.explanation}</p>
            {term.detailedExample.numbers && (
              <p className="text-sm font-mono mt-1 text-primary">{term.detailedExample.numbers}</p>
            )}
          </div>
        )}

        {/* Good/Bad practice */}
        {term.badPractice && (
          <div className="space-y-2">
            <h4 className="font-semibold mb-1">❌ Vermeiden</h4>
            {term.badPractice.map((bsp, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <span className="text-sm text-red-800 dark:text-red-300">{bsp}</span>
              </div>
            ))}
          </div>
        )}

        {term.goodPractice && (
          <div className="space-y-2">
            <h4 className="font-semibold mb-1">✅ Besser</h4>
            {term.goodPractice.map((bsp, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm text-green-800 dark:text-green-300">{bsp}</span>
              </div>
            ))}
          </div>
        )}

        {/* Subtypes */}
        {term.subtypes && (
          <div>
            <h4 className="font-semibold mb-1">Untertypen</h4>
            <ul className="space-y-2 pl-4">
              {term.subtypes.map((ut, i) => (
                <li key={i} className="text-sm">
                  <strong>{ut.name}:</strong>{" "}
                  <span className="text-muted-foreground">{ut.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Table */}
        {term.table && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {term.table.headers.map((header, i) => (
                    <TableHead key={i}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {term.table.rows.map((row, i) => (
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

        {/* When important */}
        {term.whenImportant && term.whenImportant.length > 0 && (
          <div>
            <h4 className="font-semibold mb-1">Wann besonders wichtig?</h4>
            <ul className="text-sm text-muted-foreground list-disc pl-4">
              {term.whenImportant.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Tip */}
        {term.tip && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Lightbulb className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <span className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Tipp:</strong> {term.tip}
            </span>
          </div>
        )}

        {/* Presentation text */}
        {term.presentationText && (
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold mb-1">💬 Präsentationstext</h4>
                <p className="text-sm italic">"{term.presentationText}"</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleCopy(term.presentationText!)}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        {/* Technical details collapsible */}
        {term.technicalDetails && (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&]:rotate-90" />
              <span>Details für Experten</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 pl-5 space-y-3 border-l-2 border-muted mt-2">
              {term.technicalDetails.formula && (
                <div>
                  <span className="text-sm font-medium">Formel:</span>
                  <code className="block text-sm bg-muted p-3 rounded mt-1 font-mono">
                    {term.technicalDetails.formula}
                  </code>
                </div>
              )}
              {term.technicalDetails.calculation && (
                <div>
                  <span className="text-sm font-medium">Berechnung:</span>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {term.technicalDetails.calculation}
                  </p>
                </div>
              )}
              {term.technicalDetails.interpretation && (
                <div>
                  <span className="text-sm font-medium">Interpretation:</span>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {term.technicalDetails.interpretation}
                  </p>
                </div>
              )}
              {term.technicalDetails.caveats && term.technicalDetails.caveats.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Hinweise:</span>
                  <ul className="text-sm text-muted-foreground list-disc pl-4 mt-0.5">
                    {term.technicalDetails.caveats.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Related terms */}
        {term.relatedTerms && term.relatedTerms.length > 0 && (
          <div>
            <h4 className="font-semibold mb-1">Verwandte Begriffe</h4>
            <div className="flex flex-wrap gap-1">
              {term.relatedTerms.map((rt) => (
                <Badge
                  key={rt}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80"
                  onClick={() => onSelectRelated(rt)}
                >
                  {rt}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
