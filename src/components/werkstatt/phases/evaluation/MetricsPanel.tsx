import { MetricCard } from './MetricCard';
import type { TrainedModel } from '@/engine/types';

export function ClassificationMetrics({ model }: { model: TrainedModel }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          label="Accuracy"
          value={`${((model.metrics.accuracy ?? 0) * 100).toFixed(1)}%`}
          description="Anteil korrekt klassifizierter Datenpunkte"
          highlight={true}
        />
        <MetricCard
          label="Precision"
          value={`${((model.metrics.precision ?? 0) * 100).toFixed(1)}%`}
          description="Von allen positiven Vorhersagen: wie viele waren korrekt?"
        />
        <MetricCard
          label="Recall"
          value={`${((model.metrics.recall ?? 0) * 100).toFixed(1)}%`}
          description="Von allen tatsächlich positiven: wie viele wurden erkannt?"
        />
        <MetricCard
          label="F1-Score"
          value={`${((model.metrics.f1Score ?? 0) * 100).toFixed(1)}%`}
          description="Harmonisches Mittel aus Precision und Recall"
        />
      </div>
      {model.metrics.rocAuc != null && (
        <MetricCard
          label="AUC-ROC"
          value={model.metrics.rocAuc.toFixed(4)}
          description="Fläche unter der ROC-Kurve (1.0 = perfekt, 0.5 = Zufall)"
          wide
        />
      )}
    </div>
  );
}

export function RegressionMetrics({ model }: { model: TrainedModel }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <MetricCard
        label="R² (Bestimmtheitsmaß)"
        value={(model.metrics.r2 ?? 0).toFixed(4)}
        description="Anteil der erklärten Varianz (1.0 = perfekt, 0 = kein Erklärungswert)"
        highlight={true}
      />
      <MetricCard
        label="RMSE"
        value={(model.metrics.rmse ?? 0).toFixed(4)}
        description="Wurzel des mittleren quadratischen Fehlers – je kleiner, desto besser"
      />
      <MetricCard
        label="MAE"
        value={(model.metrics.mae ?? 0).toFixed(4)}
        description="Mittlerer absoluter Fehler – durchschnittliche Abweichung"
      />
    </div>
  );
}

export function ClusteringMetrics({ model }: { model: TrainedModel }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {model.metrics.silhouetteScore != null && (
        <MetricCard
          label="Silhouette Score"
          value={model.metrics.silhouetteScore.toFixed(4)}
          description="Clustertrennung (-1 bis 1, höher = besser getrennte Cluster)"
          highlight={true}
        />
      )}
      {model.metrics.inertia != null && (
        <MetricCard
          label="Inertia"
          value={model.metrics.inertia.toFixed(2)}
          description="Summe der quadrierten Abstände zu Clusterzentren – je kleiner, desto kompakter"
        />
      )}
      <MetricCard
        label="Anzahl Cluster"
        value={String(model.metrics.nClusters ?? '?')}
        description="Anzahl der gefundenen Cluster"
      />
    </div>
  );
}
