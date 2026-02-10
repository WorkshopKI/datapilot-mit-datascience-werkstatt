import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Play } from 'lucide-react';
import { MethodCard } from './MethodCard';
import { ColumnCheckboxes } from './ColumnCheckboxes';
import { nextStepId } from './stepTypes';
import type { PipelineStep, PreparedDataSummary, FeatureSelectionConfig } from '@/engine/types';

export function FeatureSelectionForm({ dataSummary, isApplying, onApply }: {
  dataSummary: PreparedDataSummary; isApplying: boolean; onApply: (step: PipelineStep) => void;
}) {
  const [method, setMethod] = useState<FeatureSelectionConfig['method']>('drop-columns');
  const [selectedCols, setSelectedCols] = useState<string[]>([]);

  const handleApply = () => {
    if (selectedCols.length === 0) return;
    const config: FeatureSelectionConfig = { method, columns: selectedCols };
    const label = method === 'drop-columns'
      ? `${selectedCols.length} Spalte(n) entfernt`
      : `${selectedCols.length} Spalte(n) behalten`;
    onApply({ id: nextStepId(), type: 'feature-selection', label, config, pythonCode: '' });
  };

  return (
    <div className="space-y-3 border-t pt-3">
      <div>
        <Label className="mb-2 block">Methode</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <MethodCard value="drop-columns" selected={method === 'drop-columns'} label="Spalten entfernen" description="Wähle Spalten aus, die entfernt werden sollen (z.B. IDs, irrelevante Features)." onSelect={(v) => setMethod(v as FeatureSelectionConfig['method'])} />
          <MethodCard value="keep-columns" selected={method === 'keep-columns'} label="Nur ausgewählte behalten" description="Wähle gezielt die Spalten, die du behalten möchtest. Alle anderen werden entfernt." onSelect={(v) => setMethod(v as FeatureSelectionConfig['method'])} />
        </div>
      </div>

      <ColumnCheckboxes label={method === 'drop-columns' ? 'Zu entfernende Spalten' : 'Zu behaltende Spalten'} columns={dataSummary.columnNames} selected={selectedCols} onChange={setSelectedCols} />

      {selectedCols.length === 0 && (
        <p className="text-xs text-amber-600">Bitte mindestens eine Spalte auswählen.</p>
      )}

      <Button onClick={handleApply} disabled={isApplying || selectedCols.length === 0} className="gap-2">
        <Play className="h-4 w-4" /> Ausführen
      </Button>
    </div>
  );
}
