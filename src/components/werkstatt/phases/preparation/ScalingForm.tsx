import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Play } from 'lucide-react';
import { MethodCard } from './MethodCard';
import { ColumnCheckboxes } from './ColumnCheckboxes';
import { nextStepId } from './stepTypes';
import type { PipelineStep, PreparedDataSummary, ScalingConfig } from '@/engine/types';

export function ScalingForm({ dataSummary, isApplying, onApply }: {
  dataSummary: PreparedDataSummary; isApplying: boolean; onApply: (step: PipelineStep) => void;
}) {
  const [method, setMethod] = useState<ScalingConfig['method']>('standard');
  const [selectedCols, setSelectedCols] = useState<string[]>([]);

  const handleApply = () => {
    if (selectedCols.length === 0) return;
    const config: ScalingConfig = { method, columns: selectedCols };
    const label = method === 'standard' ? 'StandardScaler' : 'MinMaxScaler';
    onApply({ id: nextStepId(), type: 'scaling', label, config, pythonCode: '' });
  };

  return (
    <div className="space-y-3 border-t pt-3">
      <div>
        <Label className="mb-2 block">Methode</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <MethodCard value="standard" selected={method === 'standard'} label="StandardScaler" description="Transformiert auf Mittelwert = 0 und Standardabweichung = 1. Standard-Wahl für die meisten ML-Algorithmen." glossaryTerm="Normalisierung" glossaryTermId="normalisierung" onSelect={(v) => setMethod(v as ScalingConfig['method'])} />
          <MethodCard value="minmax" selected={method === 'minmax'} label="MinMaxScaler" description="Skaliert alle Werte in den Bereich 0 bis 1. Gut wenn die Originalverteilung erhalten bleiben soll." glossaryTerm="Normalisierung" glossaryTermId="normalisierung" onSelect={(v) => setMethod(v as ScalingConfig['method'])} />
        </div>
      </div>

      <ColumnCheckboxes label="Numerische Spalten" columns={dataSummary.numericColumns} selected={selectedCols} onChange={setSelectedCols} />

      {selectedCols.length === 0 && (
        <p className="text-xs text-amber-600">Bitte mindestens eine Spalte auswählen.</p>
      )}

      <Button onClick={handleApply} disabled={isApplying || selectedCols.length === 0} className="gap-2">
        <Play className="h-4 w-4" /> Ausführen
      </Button>
    </div>
  );
}
