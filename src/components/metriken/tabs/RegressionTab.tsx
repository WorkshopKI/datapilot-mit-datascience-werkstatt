import { MetricCard } from "../MetricCard";
import { ComparisonTable } from "../ComparisonTable";
import { regressionMetrics, regressionComparisons } from "@/data/metrikenData";

export function RegressionTab() {
  // Separate R² and Adjusted R² for comparison section
  const r2Metric = regressionMetrics.find(m => m.id === "r2");
  const adjustedR2Metric = regressionMetrics.find(m => m.id === "adjusted-r2");
  const errorMetrics = regressionMetrics.filter(m => 
    ["mse", "rmse", "mae"].includes(m.id)
  );
  
  const r2Comparison = regressionComparisons.find(c => c.title.includes("R²"));
  const errorComparison = regressionComparisons.find(c => c.title.includes("Fehler"));

  return (
    <div className="space-y-8">
      {/* R² Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Bestimmtheitsmaße</h2>
        <div className="space-y-4">
          {r2Metric && <MetricCard metric={r2Metric} />}
          {adjustedR2Metric && <MetricCard metric={adjustedR2Metric} />}
          {r2Comparison && <ComparisonTable data={r2Comparison} />}
        </div>
      </section>

      {/* Error Metrics Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Fehlermetriken</h2>
        <div className="space-y-4">
          {errorMetrics.map(metric => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
          {errorComparison && <ComparisonTable data={errorComparison} />}
        </div>
      </section>
    </div>
  );
}
