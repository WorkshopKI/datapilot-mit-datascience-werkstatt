import { AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MetricData } from "@/data/metrikenData";

interface MetricCardProps {
  metric: MetricData;
  className?: string;
}

export function MetricCard({ metric, className }: MetricCardProps) {
  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">{metric.title}</CardTitle>
        <p className="text-muted-foreground">{metric.definition}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Formel */}
        {metric.formula && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 overflow-x-auto">
            <p className="text-xs text-muted-foreground mb-1">Formel:</p>
            <code className="font-mono text-sm text-foreground whitespace-nowrap">
              {metric.formula}
            </code>
          </div>
        )}

        {/* Wertebereich & Einheit */}
        {(metric.range || metric.unit) && (
          <div className="flex flex-wrap gap-4 text-sm">
            {metric.range && (
              <div>
                <span className="text-muted-foreground">Wertebereich: </span>
                <span className="font-medium">{metric.range}</span>
              </div>
            )}
            {metric.unit && (
              <div>
                <span className="text-muted-foreground">Einheit: </span>
                <span className="font-medium">{metric.unit}</span>
              </div>
            )}
          </div>
        )}

        {/* Interpretation */}
        {metric.interpretation && metric.interpretation.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Interpretation:</p>
            <div className="space-y-1">
              {metric.interpretation.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono shrink-0">
                    {item.value}
                  </code>
                  <span className="text-muted-foreground">→ {item.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Beispiel */}
        {metric.example && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            {metric.example.scenario && (
              <p className="font-medium mb-1">Beispiel: {metric.example.scenario}</p>
            )}
            {metric.example.data && (
              <p className="text-muted-foreground">Daten: {metric.example.data}</p>
            )}
            {metric.example.calculation && (
              <p className="font-mono text-xs mt-1">{metric.example.calculation}</p>
            )}
            {metric.example.steps && (
              <ul className="mt-2 space-y-0.5 text-muted-foreground">
                {metric.example.steps.map((step, i) => (
                  <li key={i}>• {step}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Stärken & Schwächen */}
        {(metric.pros || metric.cons) && (
          <div className="grid sm:grid-cols-2 gap-3">
            {metric.pros && metric.pros.length > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-sm font-medium text-primary mb-2">Stärken</p>
                <ul className="space-y-1">
                  {metric.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {metric.cons && metric.cons.length > 0 && (
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                <p className="text-sm font-medium text-destructive mb-2">Schwächen</p>
                <ul className="space-y-1">
                  {metric.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Warnung */}
        {metric.warning && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{metric.warning}</p>
          </div>
        )}

        {/* Wann verwenden */}
        {metric.useWhen && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-medium text-primary">Wann verwenden?</span>
              <p className="text-muted-foreground">{metric.useWhen}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
