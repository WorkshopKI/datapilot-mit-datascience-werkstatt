import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface ColumnCheckboxesProps {
  label: string;
  columns: string[];
  selected: string[];
  onChange: (cols: string[]) => void;
}

export function ColumnCheckboxes({ label, columns, selected, onChange }: ColumnCheckboxesProps) {
  const toggle = (col: string) => {
    if (selected.includes(col)) {
      onChange(selected.filter(c => c !== col));
    } else {
      onChange([...selected, col]);
    }
  };

  if (columns.length === 0) {
    return (
      <div>
        <Label>{label}</Label>
        <p className="text-xs text-muted-foreground mt-1">Keine passenden Spalten vorhanden.</p>
      </div>
    );
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {columns.map(col => (
          <label
            key={col}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md border cursor-pointer hover:bg-gray-50 text-sm"
          >
            <Checkbox
              checked={selected.includes(col)}
              onCheckedChange={() => toggle(col)}
            />
            <span className="font-mono text-xs">{col}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
