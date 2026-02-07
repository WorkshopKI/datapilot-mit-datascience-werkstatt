import { AlertTriangle, Lightbulb, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ConceptData } from "@/data/metrikenData";

interface ConceptCardProps {
  concept: ConceptData;
  className?: string;
}

export function ConceptCard({ concept, className }: ConceptCardProps) {
  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">{concept.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{concept.subtitle}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{concept.description}</p>

        {/* Key Points */}
        {concept.keyPoints && concept.keyPoints.length > 0 && (
          <ul className="space-y-1.5">
            {concept.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Warnung */}
        {concept.warning && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive font-medium">{concept.warning}</p>
          </div>
        )}

        {/* Maßnahmen */}
        {concept.measures && concept.measures.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Gegenmaßnahmen:
            </p>
            <ul className="space-y-1">
              {concept.measures.map((measure, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span>•</span>
                  <span>{measure}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
