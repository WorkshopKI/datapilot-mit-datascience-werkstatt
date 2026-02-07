import { MetricCard } from "../MetricCard";
import { ConceptCard } from "../ConceptCard";
import { ComparisonTable } from "../ComparisonTable";
import { 
  clusteringMetrics, 
  clusteringConcepts, 
  clusteringComparisons 
} from "@/data/metrikenData";

export function ClusteringTab() {
  const kmeansMetric = clusteringMetrics.find(m => m.id === "kmeans");
  const evaluationMetrics = clusteringMetrics.filter(m => 
    ["inertia", "silhouette", "davies-bouldin"].includes(m.id)
  );

  return (
    <div className="space-y-8">
      {/* k-Means Algorithmus Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">k-Means Algorithmus</h2>
        <div className="space-y-4">
          {kmeansMetric && <MetricCard metric={kmeansMetric} />}
        </div>
      </section>

      {/* Bewertungsmetriken Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Bewertungsmetriken</h2>
        <div className="space-y-4">
          {evaluationMetrics.map(metric => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      {/* Konzepte Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Wichtige Konzepte</h2>
        <div className="space-y-4">
          {clusteringConcepts.map(concept => (
            <ConceptCard key={concept.id} concept={concept} />
          ))}
        </div>
      </section>

      {/* Vergleichstabelle Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Entscheidungshilfe</h2>
        <div className="space-y-4">
          {clusteringComparisons.map((comparison, index) => (
            <ComparisonTable key={index} data={comparison} />
          ))}
        </div>
      </section>
    </div>
  );
}
