import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Play } from 'lucide-react';
import { MethodCard } from './MethodCard';
import { ColumnCheckboxes } from './ColumnCheckboxes';
import { nextStepId } from './stepTypes';
import type { PipelineStep, PreparedDataSummary, OutlierRemovalConfig } from '@/engine/types';

export function OutlierRemovalForm({ dataSummary, isApplying, onApply }: {
  dataSummary: PreparedDataSummary; isApplying: boolean; onApply: (step: PipelineStep) => void;
}) {
  const [method, setMethod] = useState<OutlierRemovalConfig['method']>('zscore');
  const [threshold, setThreshold] = useState(method === 'zscore' ? 3 : 1.5);
  const [selectedCols, setSelectedCols] = useState<string[]>([]);

  const handleMethodChange = (m: OutlierRemovalConfig['method']) => {
    setMethod(m);
    setThreshold(m === 'zscore' ? 3 : 1.5);
  };

  const handleApply = () => {
    if (selectedCols.length === 0) return;
    const config: OutlierRemovalConfig = { method, threshold, columns: selectedCols };
    const label = method === 'zscore'
      ? `Ausreißer: Z-Score > ${threshold}`
      : `Ausreißer: IQR × ${threshold}`;
    onApply({ id: nextStepId(), type: 'outlier-removal', label, config, pythonCode: '' });
  };

  return (
    <div className="space-y-3 border-t pt-3">
      <div>
        <Label className="mb-2 block">Methode</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <MethodCard value="zscore" selected={method === 'zscore'} label="Z-Score" description="Misst, wie viele Standardabweichungen ein Wert vom Mittelwert entfernt ist. Werte mit |z| > Schwellenwert werden entfernt. Setzt annähernd normalverteilte Daten voraus." glossaryTerm="Ausreißer" glossaryTermId="ausreisser" onSelect={(v) => handleMethodChange(v as OutlierRemovalConfig['method'])} />
          <MethodCard value="iqr" selected={method === 'iqr'} label="IQR (Interquartilsabstand)" description="Nutzt den Abstand zwischen dem 25%- und 75%-Quantil. Werte außerhalb von Q1 − k×IQR bis Q3 + k×IQR gelten als Ausreißer. Robust bei schiefen Verteilungen." glossaryTerm="Ausreißer" glossaryTermId="ausreisser" onSelect={(v) => handleMethodChange(v as OutlierRemovalConfig['method'])} />
        </div>
      </div>

      <div>
        <Label>Schwellenwert: {threshold}</Label>
        <Slider className="mt-2" min={method === 'zscore' ? 1 : 0.5} max={method === 'zscore' ? 5 : 3} step={method === 'zscore' ? 0.5 : 0.25} value={[threshold]} onValueChange={([v]) => setThreshold(v)} />
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
