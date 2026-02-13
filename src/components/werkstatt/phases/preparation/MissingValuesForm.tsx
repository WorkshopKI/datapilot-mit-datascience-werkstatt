import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Play, Info } from 'lucide-react';
import { GlossaryLink } from '../../GlossaryLink';
import { MethodCard } from './MethodCard';
import { ColumnCheckboxes } from './ColumnCheckboxes';
import { nextStepId } from './stepTypes';
import type { PipelineStep, PreparedDataSummary, MissingValuesConfig } from '@/engine/types';

export function MissingValuesForm({ dataSummary, isApplying, onApply }: {
  dataSummary: PreparedDataSummary; isApplying: boolean; onApply: (step: PipelineStep) => void;
}) {
  const [strategy, setStrategy] = useState<MissingValuesConfig['strategy']>('drop-rows');
  const [selectedCols, setSelectedCols] = useState<string[]>([]);
  const [fillValue, setFillValue] = useState('');

  const handleApply = () => {
    const config: MissingValuesConfig = {
      strategy,
      columns: selectedCols,
      ...(strategy === 'fill-constant' ? { fillValue } : {}),
    };
    const strategyLabels: Record<string, string> = {
      'drop-rows': 'Zeilen entfernen',
      'fill-mean': 'Mittelwert',
      'fill-median': 'Median',
      'fill-mode': 'Häufigster Wert',
      'fill-constant': 'Konstante',
    };
    onApply({
      id: nextStepId(),
      type: 'missing-values',
      label: `Fehlende Werte: ${strategyLabels[strategy]}`,
      config,
      pythonCode: '',
    });
  };

  return (
    <div className="space-y-3 border-t pt-3">
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          Die Behandlung fehlender Werte heißt <GlossaryLink term="Imputation" termId="imputation" />.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
          <div className="flex gap-2">
            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800">
              <span className="font-medium">Empfehlung:</span>{' '}
              Median für numerische Spalten (robust bei Ausreißern), Häufigster Wert für kategoriale Spalten.
              Bei &lt;5% fehlenden Werten kann auch Zeilen entfernen sinnvoll sein.
            </p>
          </div>
        </div>
        <Label className="mb-2 block">Strategie</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <MethodCard value="drop-rows" selected={strategy === 'drop-rows'} label="Zeilen entfernen" description="Löscht alle Zeilen mit fehlenden Werten. Einfach, aber es gehen Daten verloren – nur bei wenigen Lücken sinnvoll." onSelect={(v) => setStrategy(v as MissingValuesConfig['strategy'])} />
          <MethodCard value="fill-mean" selected={strategy === 'fill-mean'} label="Mit Mittelwert füllen" description="Ersetzt Lücken durch den Durchschnitt der Spalte. Gut für normalverteilte numerische Daten." onSelect={(v) => setStrategy(v as MissingValuesConfig['strategy'])} />
          <MethodCard value="fill-median" selected={strategy === 'fill-median'} label="Mit Median füllen" description="Ersetzt Lücken durch den mittleren Wert. Robuster als der Mittelwert bei Ausreißern." onSelect={(v) => setStrategy(v as MissingValuesConfig['strategy'])} />
          <MethodCard value="fill-mode" selected={strategy === 'fill-mode'} label="Mit häufigstem Wert" description="Ersetzt Lücken durch den häufigsten Wert (Modus). Die einzige Option für kategoriale Spalten." onSelect={(v) => setStrategy(v as MissingValuesConfig['strategy'])} />
          <MethodCard value="fill-constant" selected={strategy === 'fill-constant'} label="Mit Konstante füllen" description={"Ersetzt Lücken durch einen festen Wert (z.B. 0 oder 'Unbekannt'). Nützlich wenn Fehlen selbst eine Information ist."} onSelect={(v) => setStrategy(v as MissingValuesConfig['strategy'])} />
        </div>
      </div>

      {strategy === 'fill-constant' && (
        <div>
          <Label>Füllwert</Label>
          <Input className="mt-1" value={fillValue} onChange={(e) => setFillValue(e.target.value)} placeholder="z.B. 0, Unbekannt" />
        </div>
      )}

      {/* TODO: pass per-column missing counts when PreparedDataSummary is extended */}
      <ColumnCheckboxes label="Spalten (leer = alle betroffenen)" columns={dataSummary.columnNames} selected={selectedCols} onChange={setSelectedCols} />

      <Button onClick={handleApply} disabled={isApplying} className="gap-2">
        <Play className="h-4 w-4" /> Ausführen
      </Button>
    </div>
  );
}
