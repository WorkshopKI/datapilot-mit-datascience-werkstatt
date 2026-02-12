/**
 * DatasetSelector – Karte zur Auswahl eines Beispiel-Datensatzes.
 * Zeigt alle verfügbaren Datensätze gruppiert nach Quelle.
 */
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, RefreshCw, Upload } from 'lucide-react';
import { DATASET_REGISTRY, type DatasetId, type DatasetInfo, type ProjectType } from '@/data/openDataRegistry';
import { cn } from '@/lib/utils';

interface DatasetSelectorProps {
  projectType: ProjectType;
  onSelect: (datasetId: DatasetId) => void;
  onUploadOwn: () => void;
}

export function DatasetSelector({ projectType, onSelect, onUploadOwn }: DatasetSelectorProps) {
  const [selectedId, setSelectedId] = useState<DatasetId | null>(null);

  // Datasets compatible with this project type
  const compatible = Object.values(DATASET_REGISTRY).filter(d =>
    d.mlType === projectType
    || (projectType === 'clustering' && d.id === 'iris')
  );

  const classics = compatible.filter(d => !d.isBerlinOpenData);
  const berlin = compatible.filter(d => d.isBerlinOpenData);

  const handleSelect = (id: DatasetId) => {
    setSelectedId(id);
    onSelect(id);
  };

  return (
    <div className="space-y-4">
      {/* Berlin Open Data */}
      {berlin.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            📍 Berlin Open Data
            <Badge variant="outline" className="text-[10px] px-1 py-0">Live-Daten</Badge>
          </p>
          <div className="grid gap-2">
            {berlin.map(d => (
              <DatasetCard
                key={d.id}
                dataset={d}
                isSelected={selectedId === d.id}
                onSelect={() => handleSelect(d.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Klassische Datensätze */}
      {classics.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">📚 Klassische Datensätze</p>
          <div className="grid gap-2">
            {classics.map(d => (
              <DatasetCard
                key={d.id}
                dataset={d}
                isSelected={selectedId === d.id}
                onSelect={() => handleSelect(d.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Eigene Daten */}
      <Button variant="outline" onClick={onUploadOwn} className="w-full gap-2 text-sm">
        <Upload className="h-3.5 w-3.5" />
        Eigene CSV hochladen
      </Button>
    </div>
  );
}

function DatasetCard({ dataset, isSelected, onSelect }: {
  dataset: DatasetInfo;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-sm',
        isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
      )}
      onClick={onSelect}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <span className="text-xl">{dataset.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{dataset.name}</span>
              {dataset.updateFrequency === 'daily' && (
                <Badge className="text-[10px] px-1 py-0 bg-green-100 text-green-700 hover:bg-green-100">
                  <RefreshCw className="h-2.5 w-2.5 mr-0.5" /> täglich
                </Badge>
              )}
              {dataset.updateFrequency === 'weekly' && (
                <Badge className="text-[10px] px-1 py-0 bg-blue-100 text-blue-700 hover:bg-blue-100">
                  <RefreshCw className="h-2.5 w-2.5 mr-0.5" /> wöchentlich
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {dataset.businessQuestion}
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
              <span>~{dataset.approxRows.toLocaleString('de-DE')} Zeilen</span>
              <span>·</span>
              <span>{dataset.columns} Spalten</span>
              {dataset.isBerlinOpenData && (
                <>
                  <span>·</span>
                  <a
                    href={dataset.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-0.5 hover:text-primary"
                  >
                    Quelle <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
