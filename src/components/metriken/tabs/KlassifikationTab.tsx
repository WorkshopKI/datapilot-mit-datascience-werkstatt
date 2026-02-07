import { MetricCard } from "../MetricCard";
import { ComparisonTable } from "../ComparisonTable";
import { ConfusionMatrix } from "../ConfusionMatrix";
import { DecisionTreeDemo } from "../DecisionTreeDemo";
import { klassifikationMetrics, klassifikationComparisons, klassifikationAlgorithms } from "@/data/metrikenData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export function KlassifikationTab() {
  // Separate accuracy warning metric
  const accuracyMetric = klassifikationMetrics.find(m => m.id === "accuracy");
  const otherMetrics = klassifikationMetrics.filter(m => m.id !== "accuracy");
  
  return (
    <div className="space-y-8">
      {/* Confusion Matrix Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Confusion Matrix</h2>
        <ConfusionMatrix />
      </section>

      {/* Accuracy Warning */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Accuracy – mit Vorsicht genießen</h2>
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Accuracy-Falle bei unbalancierten Daten</AlertTitle>
          <AlertDescription>
            Bei 1% Betrugsrate erreicht ein Modell, das immer "kein Betrug" sagt, 99% Accuracy – ohne einen einzigen Betrugsfall zu erkennen! Nutze bei unbalancierten Klassen immer Precision, Recall und F1.
          </AlertDescription>
        </Alert>
        {accuracyMetric && <MetricCard metric={accuracyMetric} />}
      </section>

      {/* Main Metrics Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Metriken</h2>
        <div className="space-y-4">
          {otherMetrics.map(metric => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      {/* Algorithmen Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Algorithmen</h2>
        <div className="space-y-4">
          {klassifikationAlgorithms.map(algo => (
            <MetricCard key={algo.id} metric={algo} />
          ))}
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Interaktive Demo</h2>
        <DecisionTreeDemo />
      </section>

      {/* Comparison Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Entscheidungshilfe</h2>
        <div className="space-y-4">
          {klassifikationComparisons.map((comparison, i) => (
            <ComparisonTable key={i} data={comparison} />
          ))}
        </div>
      </section>
    </div>
  );
}
