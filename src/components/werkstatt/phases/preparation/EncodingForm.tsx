import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Play } from 'lucide-react';
import { MethodCard } from './MethodCard';
import { ColumnCheckboxes } from './ColumnCheckboxes';
import { nextStepId } from './stepTypes';
import type { PipelineStep, PreparedDataSummary, EncodingConfig } from '@/engine/types';

export function EncodingForm({ dataSummary, isApplying, onApply }: {
  dataSummary: PreparedDataSummary; isApplying: boolean; onApply: (step: PipelineStep) => void;
}) {
  const [method, setMethod] = useState<EncodingConfig['method']>('one-hot');
  const [dropFirst, setDropFirst] = useState(false);
  const [selectedCols, setSelectedCols] = useState<string[]>([]);

  const handleApply = () => {
    if (selectedCols.length === 0) return;
    const config: EncodingConfig = { method, columns: selectedCols, ...(method === 'one-hot' ? { dropFirst } : {}) };
    const label = method === 'one-hot'
      ? `One-Hot-Encoding${dropFirst ? ' (drop first)' : ''}`
      : 'Label-Encoding';
    onApply({ id: nextStepId(), type: 'encoding', label, config, pythonCode: '' });
  };

  return (
    <div className="space-y-3 border-t pt-3">
      <div>
        <Label className="mb-2 block">Methode</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <MethodCard value="one-hot" selected={method === 'one-hot'} label="One-Hot Encoding" description="Erstellt pro Kategorie eine neue 0/1-Spalte. Ideal wenn keine Rangfolge existiert (z.B. Farbe, Stadt). Erhöht die Spaltenanzahl." glossaryTerm="One-Hot Encoding" glossaryTermId="one-hot-encoding" onSelect={(v) => setMethod(v as EncodingConfig['method'])} />
          <MethodCard value="label" selected={method === 'label'} label="Label Encoding" description="Ersetzt Kategorien durch Zahlen (0, 1, 2, …). Nur sinnvoll bei ordinalen Daten mit natürlicher Reihenfolge (z.B. klein < mittel < groß)." onSelect={(v) => setMethod(v as EncodingConfig['method'])} />
        </div>
      </div>

      {method === 'one-hot' && (
        <div className="flex items-center gap-2">
          <Switch checked={dropFirst} onCheckedChange={setDropFirst} id="drop-first" />
          <Label htmlFor="drop-first" className="text-sm">Erste Dummy-Spalte entfernen (drop first)</Label>
        </div>
      )}

      <ColumnCheckboxes label="Kategoriale Spalten" columns={dataSummary.categoricalColumns} selected={selectedCols} onChange={setSelectedCols} />

      {selectedCols.length === 0 && (
        <p className="text-xs text-amber-600">Bitte mindestens eine Spalte auswählen.</p>
      )}

      <Button onClick={handleApply} disabled={isApplying || selectedCols.length === 0} className="gap-2">
        <Play className="h-4 w-4" /> Ausführen
      </Button>
    </div>
  );
}
