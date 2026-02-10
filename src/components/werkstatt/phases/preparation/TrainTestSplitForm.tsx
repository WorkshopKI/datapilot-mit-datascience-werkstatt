import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play } from 'lucide-react';
import { nextStepId } from './stepTypes';
import type { PipelineStep, PreparedDataSummary, TrainTestSplitConfig } from '@/engine/types';

export function TrainTestSplitForm({ dataSummary, isApplying, hasSplit, onApply }: {
  dataSummary: PreparedDataSummary; isApplying: boolean; hasSplit: boolean;
  onApply: (step: PipelineStep) => void;
}) {
  const [testSize, setTestSize] = useState(0.2);
  const [randomState, setRandomState] = useState(42);
  const [stratify, setStratify] = useState('__none__');

  const handleApply = () => {
    const config: TrainTestSplitConfig = {
      testSize,
      randomState,
      ...(stratify && stratify !== '__none__' ? { stratify } : {}),
    };
    const pct = Math.round(testSize * 100);
    const label = `Train-Test-Split (${100 - pct}/${pct})`;
    onApply({ id: nextStepId(), type: 'train-test-split', label, config, pythonCode: '' });
  };

  if (hasSplit) {
    return (
      <div className="border-t pt-3">
        <p className="text-sm text-amber-600">
          Ein Train-Test-Split wurde bereits angewendet. Entferne ihn zuerst, um einen neuen zu erstellen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 border-t pt-3">
      <div>
        <Label>Test-Anteil: {Math.round(testSize * 100)}%</Label>
        <Slider className="mt-2" min={0.1} max={0.4} step={0.05} value={[testSize]} onValueChange={([v]) => setTestSize(v)} />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>10%</span>
          <span>40%</span>
        </div>
      </div>

      <div>
        <Label>Random State</Label>
        <Input className="mt-1 w-32" type="number" value={randomState} onChange={(e) => setRandomState(parseInt(e.target.value) || 0)} />
      </div>

      <div>
        <Label>Stratifizierung (optional)</Label>
        <Select value={stratify} onValueChange={setStratify}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="Keine" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Keine</SelectItem>
            {dataSummary.categoricalColumns.map(col => (
              <SelectItem key={col} value={col}>{col}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          Sorgt dafür, dass das Klassenverhältnis in Train und Test gleich bleibt.
        </p>
      </div>

      <Button onClick={handleApply} disabled={isApplying} className="gap-2">
        <Play className="h-4 w-4" /> Ausführen
      </Button>
    </div>
  );
}
