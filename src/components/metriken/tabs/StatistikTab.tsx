import { MetricCard } from "../MetricCard";
import { ConceptCard } from "../ConceptCard";
import { statistikMetrics, konzepte } from "@/data/metrikenData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function StatistikTab() {
  const besselKonzept = konzepte.find(k => k.id === "bessel");
  const quadrierenKonzept = konzepte.find(k => k.id === "quadrieren");
  const anscombeKonzept = konzepte.find(k => k.id === "anscombe");
  
  // Group metrics
  const lageMasse = statistikMetrics.filter(m => ["mittelwert", "median"].includes(m.id));
  const streuungsMasse = statistikMetrics.filter(m => ["varianz", "standardabweichung"].includes(m.id));
  const zusammenhangsMasse = statistikMetrics.filter(m => ["kovarianz", "korrelation-statistik"].includes(m.id));
  const verteilungsMasse = statistikMetrics.filter(m => ["normalverteilung", "perzentil"].includes(m.id));

  return (
    <div className="space-y-8">
      {/* Lagemaße */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Lagemaße</h2>
        <div className="space-y-4">
          {lageMasse.map(metric => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      {/* Streuungsmaße */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Streuungsmaße</h2>
        <div className="space-y-4">
          {streuungsMasse.map(metric => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      {/* Zusammenhangsmaße */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Zusammenhangsmaße</h2>
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Korrelation ≠ Kausalität</AlertTitle>
          <AlertDescription>
            Ein statistischer Zusammenhang bedeutet nicht automatisch Ursache-Wirkung. Eisverkauf korreliert mit Ertrinkungsfällen – beide steigen im Sommer durch den gemeinsamen Faktor "Hitze".
          </AlertDescription>
        </Alert>
        <div className="space-y-4">
          {zusammenhangsMasse.map(metric => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      {/* Verteilungen */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Verteilungen</h2>
        <div className="space-y-4">
          {verteilungsMasse.map(metric => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      {/* Concepts */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Hintergrund</h2>
        <div className="space-y-4">
          {besselKonzept && <ConceptCard concept={besselKonzept} />}
          {quadrierenKonzept && <ConceptCard concept={quadrierenKonzept} />}
          {anscombeKonzept && <ConceptCard concept={anscombeKonzept} />}
        </div>
      </section>
    </div>
  );
}
