import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ConfusionMatrixProps {
  className?: string;
}

export function ConfusionMatrix({ className }: ConfusionMatrixProps) {
  return (
    <Card className={cn("border-border", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">Confusion Matrix</CardTitle>
        <p className="text-sm text-muted-foreground">
          Visualisierung der Klassifikationsergebnisse
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          {/* Matrix Grid - 4 columns: empty, row-label, cell, cell */}
          <div className="min-w-[300px] max-w-md mx-auto grid grid-cols-[auto_auto_1fr_1fr] gap-1">
            {/* Row 1: Header "Vorhergesagt" spanning columns 3-4 */}
            <div className="col-span-2" /> {/* Empty corner */}
            <div className="col-span-2 text-center text-sm font-medium text-muted-foreground py-2">
              Vorhergesagt
            </div>
            
            {/* Row 2: Column labels "Ja" / "Nein" */}
            <div className="col-span-2" /> {/* Empty corner */}
            <div className="text-center text-xs font-medium py-1 bg-muted rounded">
              Ja
            </div>
            <div className="text-center text-xs font-medium py-1 bg-muted rounded">
              Nein
            </div>

            {/* Row 3: "Tatsächlich" label (row-span-2), "Ja" label, TP, FN */}
            <div className="row-span-2 flex items-center justify-center w-8">
              <span className="text-sm font-medium text-muted-foreground -rotate-90 whitespace-nowrap">
                Tatsächlich
              </span>
            </div>
            <div className="flex items-center justify-center px-2 text-xs font-medium bg-muted rounded min-w-[40px]">
              Ja
            </div>
            {/* TP */}
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center hover:bg-primary/20 transition-colors cursor-default">
              <div className="text-lg font-bold text-primary">TP</div>
              <div className="text-xs text-primary/80">True Positive</div>
              <div className="text-xs text-muted-foreground mt-1">✓ Richtig erkannt</div>
            </div>
            {/* FN */}
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-center hover:bg-destructive/20 transition-colors cursor-default">
              <div className="text-lg font-bold text-destructive">FN</div>
              <div className="text-xs text-destructive/80">False Negative</div>
              <div className="text-xs text-muted-foreground mt-1">✗ Übersehen</div>
            </div>

            {/* Row 4: (Tatsächlich continues), "Nein" label, FP, TN */}
            <div className="flex items-center justify-center px-2 text-xs font-medium bg-muted rounded min-w-[40px]">
              Nein
            </div>
            {/* FP */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-center hover:bg-amber-500/20 transition-colors cursor-default">
              <div className="text-lg font-bold text-amber-600">FP</div>
              <div className="text-xs text-amber-600/80">False Positive</div>
              <div className="text-xs text-muted-foreground mt-1">⚠ Falscher Alarm</div>
            </div>
            {/* TN */}
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center hover:bg-primary/20 transition-colors cursor-default">
              <div className="text-lg font-bold text-primary">TN</div>
              <div className="text-xs text-primary/80">True Negative</div>
              <div className="text-xs text-muted-foreground mt-1">✓ Richtig abgelehnt</div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary/30" />
              <span className="text-muted-foreground">Korrekte Vorhersage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-destructive/30" />
              <span className="text-muted-foreground">Falsch Negativ (übersehen)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500/30" />
              <span className="text-muted-foreground">Falsch Positiv (Fehlalarm)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
